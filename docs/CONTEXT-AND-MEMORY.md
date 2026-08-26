# Anvay — Context, Memory, and the Chat Model

**Status:** design
**Supersedes:** the workspace/tenancy layer in `DATA-MODEL.md`

---

## 1. What Anvay actually is

A single-user research assistant. Chat, documents, web search. No image
generation. Two levels of organisation:

- **Chat** — one conversation. Has a context ceiling; past it, the user starts a
  new one.
- **Project** — a folder of related chats plus shared documents and standing
  instructions. Perplexity calls this a Space, ChatGPT calls it a Project.

**There are no workspaces and no teams.** Content is owned by a `user_id`.
Everything below assumes that.

---

## 2. The central problem

Every turn, we must decide what to put in front of the model. Get it wrong in
one direction and the model forgets what you told it three turns ago. Get it
wrong in the other and you pay for 100k tokens to answer "what about the second
one?".

Three findings shape the design:

1. **Multi-turn degrades quality.** Models perform measurably worse across
   extended dialogue than on single-turn prompts — strong models become as
   unreliable as weak ones once conversations run long. More history is not
   automatically better.
2. **Compaction works.** Summarising older turns yields 50–70% token reduction
   and up to 2× cost savings with no measured degradation. This is what Claude
   Code does on long sessions.
3. **Caching is the biggest cost lever**, and it is *prefix-based* — which
   dictates the order we assemble the prompt.

---

## 3. Prompt assembly: stable first, volatile last

This is the single most important rule in the system.

Prompt caching matches on a **prefix**. If any block changes, everything after
it is a cache miss. So blocks are ordered by how often they change:

```
┌─ 1  System prompt                      never changes        ╮
├─ 2  Project instructions + doc digest  changes rarely       │ cacheable
├─ 3  Long-term memory block             refreshed on a clock │ prefix
├─ 4  Conversation summary               changes on compaction╯
├─ 5  Recent turns, verbatim             every turn           ╮ never
├─ 6  Retrieved sources for this query   every turn           │ cached
└─ 7  The question                       every turn           ╯
```

**Rule: a volatile block must never sit above a stable one.** Putting retrieved
sources at the top — which reads naturally — busts the cache on every single
turn and silently multiplies cost.

The subtle one is **block 3**. If long-term memory is re-retrieved per turn, it
changes per turn, and blocks 3–4 stop caching. So memory is refreshed on a
schedule (on chat open, and after compaction) rather than per message. Slightly
staler memory is worth a cacheable prefix.

### Cache mechanics

- **Anthropic** needs explicit `cache_control` breakpoints. Writes cost ~1.25×
  normal input; reads cost ~10%. Conversations past ~20 turns need breakpoints
  refreshed, or the oldest cached context ages out of the lookback window and
  gets charged at full rate.
- **OpenAI** caches automatically for prefixes over ~1024 tokens, at 50–80% off
  depending on model. Nothing to opt into.

Because the discount is asymmetric, the router should prefer whichever provider
is cheapest *including* cache economics, not on sticker price.

> Verify exact breakpoint limits and TTLs against provider docs at
> implementation time — these numbers move.

---

## 4. Short-term memory: the conversation itself

### Rolling window plus compaction

```
turns 1-12   ──compacted──▶  one summary block  (~600 tokens)
turns 13-18  ────────────▶  verbatim
turn  19     ────────────▶  the question
```

Keep the last **K turns verbatim** (start at 6 — three exchanges). Everything
older collapses into a running summary that is *rewritten*, not appended, each
time compaction fires.

**Trigger:** when assembled history exceeds ~60% of the model's usable window.
Not at 100% — compaction itself costs a model call, and you want headroom for
the answer.

**What the summary must preserve**, in priority order:

1. Facts the user asserted about themselves or the task
2. Decisions and constraints ("we settled on Postgres", "ignore anything pre-2024")
3. Unresolved threads
4. Which sources were already consulted, so we don't re-fetch them

**What it discards:** superseded reasoning, full tool outputs, and anything the
user already rejected.

### The "start a new chat" nudge

Because quality degrades with conversation length regardless of how well we
compact, there's a point where a fresh chat beats a longer one.

Trigger a suggestion when **either**:
- compaction has fired 3+ times in one chat, or
- the new question's embedding is far from the chat's running centroid (topic
  drift — the user has moved on to something else)

Offer, don't force: *"This chat is getting long. Start a new one?"* — and carry
the summary and project into the new chat so nothing is lost.

---

## 5. Long-term memory: across chats

Three kinds, following the standard cognitive split:

| Kind | Holds | Example |
|---|---|---|
| **Semantic** | Durable facts, preferences | "Works in fintech", "prefers TypeScript" |
| **Episodic** | Time-indexed events | "On 12 Aug asked about Postgres vs ClickHouse" |
| **Procedural** | How the user wants things done | "Always wants sources before conclusions" |

### Writing

After a run completes — **off the critical path, never blocking the answer** — a
cheap fast model reads the exchange and proposes candidate memories. Each gets a
kind, a confidence, and a pointer to the message it came from.

Conflict handling matters more than extraction. When a new fact contradicts an
old one ("moved from fintech to healthcare"), the old row is marked superseded
rather than deleted — so the history stays auditable and a wrong extraction can
be undone.

### Reading

1. Embed the incoming question
2. Fetch ~20 candidates by vector similarity, scoped to this user
3. Score by **relevance × recency × kind weight** — semantic 0.6, episodic 0.3,
   procedural 0.1
4. Take the top 5, cap the block at **~200 tokens**

That cap is deliberate. Memory is a nudge, not a briefing. A large memory block
crowds out retrieved sources, which are what the answer is actually built from.

### Consolidation

Periodically, episodes that have proven durable get promoted to semantic facts
and the raw episode is dropped. Memories that are never retrieved decay out —
that's what `last_used_at` and `use_count` are for.

> **Build vs buy:** Mem0 is the most widely deployed option and handles exactly
> this extraction/conflict/consolidation loop. It has a Node SDK that runs
> in-process against our own Postgres. Worth adopting *when* memory ships —
> but memory is not v1, so don't stand it up yet.

---

## 6. Retrieval for documents

Unchanged from `DATA-MODEL.md`: chunk, embed, store in pgvector, and retrieve
**hybrid** — vector for meaning plus keyword for exact terms, fused with
Reciprocal Rank Fusion, then reranked.

The addition for projects: documents attach to a **project** (available to every
chat in it) or to a **single chat** (ad-hoc upload). Project documents are part
of the cacheable prefix; chat documents are not.

---

## 7. Schema changes

Dropping tenancy, adding projects and memory.

```sql
-- Gone: workspaces, workspace_members, workspace_invites.
-- Every `workspace_id` becomes `user_id`.

CREATE TABLE projects (
  id           uuid PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  instructions text,                    -- standing prompt, joins the prefix
  created_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX projects_user_idx ON projects (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE chats
  ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  -- Compaction state lives on the chat.
  ADD COLUMN summary text,
  ADD COLUMN summary_through_ordinal integer,
  ADD COLUMN compaction_count integer NOT NULL DEFAULT 0,
  ADD COLUMN token_estimate integer NOT NULL DEFAULT 0;

ALTER TABLE documents
  ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  ADD COLUMN chat_id    uuid REFERENCES chats(id) ON DELETE CASCADE,
  ADD CONSTRAINT doc_scope_one CHECK (
    (project_id IS NOT NULL)::int + (chat_id IS NOT NULL)::int <= 1
  );

CREATE TYPE memory_kind AS ENUM ('semantic','episodic','procedural');

CREATE TABLE user_memories (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          memory_kind NOT NULL,
  content       text NOT NULL,
  embedding     vector(1536) NOT NULL,
  confidence    real NOT NULL DEFAULT 0.5,
  source_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  superseded_by uuid REFERENCES user_memories(id) ON DELETE SET NULL,
  last_used_at  timestamptz,
  use_count     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Retrieval only ever considers live memories.
CREATE INDEX memories_live_idx ON user_memories
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
CREATE INDEX memories_user_idx ON user_memories (user_id)
  WHERE superseded_by IS NULL;

-- What was actually sent, per turn. Makes cost and quality debuggable.
CREATE TABLE context_snapshots (
  run_id          uuid PRIMARY KEY REFERENCES runs(id) ON DELETE CASCADE,
  blocks          jsonb NOT NULL,   -- [{kind, tokens, cached}]
  total_tokens    integer NOT NULL,
  cached_tokens   integer NOT NULL,
  compacted       boolean NOT NULL DEFAULT false
);
```

`context_snapshots` earns its place: when a user says "it forgot what I told it",
this is the only way to answer *what did we actually send?* without guessing.

---

## 8. Where the future features plug in

Each of these is a new **block in the prompt assembly** or a new **step in the
run** — none require reshaping the core.

| Feature | Where it lands |
|---|---|
| **Connectors** (Drive, Notion) | A `connections` table with encrypted credentials; connector documents flow into the same chunk/embed pipeline as uploads |
| **Skills** | A `skills` table plus per-chat enabled set; enabled skills join the cacheable prefix (block 2) |
| **Image upload** | An `attachments` table on messages; images ride in the message, and the router must filter to vision-capable models |
| **Browser / code sandbox** | New `run_steps` kinds. Sandbox must be E2B/Modal-class isolation — never in-process |
| **Voice input** | Transcribe before the message exists, so the rest of the system sees an ordinary text message |

The one that changes prompt assembly most is **skills**: they add standing
instructions, so they belong in the stable prefix, not appended at the end.

---

## 9. Build order

1. Chats and messages persisted; naive "send last N turns" — no compaction
2. `context_snapshots` from day one, so you can *see* token usage before optimising
3. Prompt caching with correct block ordering — biggest cost win, small change
4. Compaction and the summary block
5. Projects: instructions, document scoping, chat grouping
6. The new-chat nudge
7. Long-term memory, extraction, retrieval — last, and possibly via Mem0

Steps 1–3 are worth doing before anything clever. Most "context management"
problems turn out to be "nobody measured what was being sent".

---

## Sources

- [Compaction — Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/agents/conversations/compaction)
- [Context window optimization strategies](https://neuraltrust.ai/blog/context-window-optimization)
- [Long-term memory for AI agents](https://mem0.ai/blog/long-term-memory-ai-agents)
- [Long-term memory architectures](https://redis.io/blog/long-term-memory-architectures-ai-agents/)
- [Prompt caching: OpenAI & Anthropic](https://tokonomics.ca/blog/prompt-caching-guide-openai-anthropic)
- [Prompt caching cost comparison 2026](https://aicostcheck.com/blog/ai-prompt-caching-cost-savings)
