import { NextRequest, NextResponse } from "next/server";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { conversation, messages as messagesTable, documents as documentsTable } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { runFinancialAgent, describeError, type AgentEvent } from "@/lib/ai/agent";
import { rateLimit, clientIp, RULES } from "@/lib/security/rate-limit";
import { checkBudget, microsToUsd } from "@/lib/billing/usage";
import { waitForDocuments } from "@/lib/documents/process";
import { buildConversationContext } from "@/lib/memory/summarize";
import { recallRelevant } from "@/lib/memory/user-memory";
import { selectModel } from "@/lib/ai/model-router";
import { isModelMode } from "@/lib/ai/models";
import {
  OpenRouterError,
  PaymentRequiredResponseError,
  TooManyRequestsResponseError,
} from "@openrouter/sdk/models/errors";

/* Vercel's default function timeout (10s) was silently killing agent runs
   mid-stream whenever a tool call took longer than that — e.g. search_news/
   search_web's real web-search-augmented OpenRouter call, or a multi-tool
   comparison query. The client saw a "200" with a truncated/empty NDJSON
   body (headers had already been sent) rather than any error, since the
   platform kills the process, not our own code. */
export const maxDuration = 60;

function statusForUpstreamError(code: number): number {
  if (code === 401 || code === 402 || code === 429 || code === 400) return code;
  return 502;
}

// Retrying never helps a 402 — it's an account balance issue, not a
// transient failure — so it gets a distinct, actionable message instead of
// the generic fallback. A 429 is genuinely transient, but an immediate
// retry tends to compound it (all candidate models rate-limited in the
// same burst, seen in production) — tell the user to wait instead of
// implying "try again" will help right away.
function userMessageForError(err: unknown): string {
  if (err instanceof PaymentRequiredResponseError) {
    return "Your OpenRouter account doesn't have enough credits for this request. Add credits at openrouter.ai and try again.";
  }
  if (err instanceof TooManyRequestsResponseError) {
    return "This model is temporarily rate-limited. Wait about 30 seconds before trying again — retrying immediately tends to hit the same limit.";
  }
  return "Something went wrong. Please try again.";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const convo = await db.query.conversation.findFirst({ where: eq(conversation.id, id) });
  if (!convo || convo.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  /* Phase 7 preflight. Rate limit first (cheapest check, and the one that
     stops retry storms compounding provider limits), then the spend
     ceiling — both before anything expensive starts. */
  const perUser = await rateLimit(`user:${userId}:messages`, RULES.messages);
  if (!perUser.allowed) {
    return NextResponse.json(
      { error: `You're sending messages too quickly. Try again in ${perUser.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(perUser.retryAfterSeconds) } }
    );
  }
  const perIp = await rateLimit(`ip:${clientIp(req)}:messages`, {
    limit: RULES.messages.limit * 3,
    windowSeconds: RULES.messages.windowSeconds,
  });
  if (!perIp.allowed) {
    return NextResponse.json(
      { error: `Too many requests from this network. Try again in ${perIp.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(perIp.retryAfterSeconds) } }
    );
  }

  const budget = await checkBudget(userId);
  if (!budget.allowed) {
    return NextResponse.json(
      {
        error:
          `You've reached this month's usage limit of $${microsToUsd(budget.limitMicros).toFixed(2)}. ` +
          `It resets at the start of next month.`,
      },
      { status: 402 }
    );
  }

  // Save the user message before calling the model (AGENTS.md Phase 1 §7).
  // A client-supplied id (if a well-formed uuid) is used as-is so the
  // frontend's optimistic message and the persisted row share one id —
  // needed to tie any pending document uploads to this exact message.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const clientMessageId = typeof body?.id === "string" && UUID_RE.test(body.id) ? body.id : undefined;
  const [userMessage] = await db
    .insert(messagesTable)
    .values({ ...(clientMessageId ? { id: clientMessageId } : {}), conversationId: id, role: "user", content })
    .returning();

  // Tie any documents uploaded but not yet attached to a message (chip
  // still shown in the composer) to this one, so the frontend can render
  // them in chat history above this message instead.
  await db
    .update(documentsTable)
    .set({ messageId: userMessage.id })
    .where(and(eq(documentsTable.conversationId, id), isNull(documentsTable.messageId)));

  /* A PDF attached to this message is very often still parsing right now —
     processing runs in after() on the upload request, while the user can
     attach and send immediately. Waiting here (bounded, well inside this
     route's maxDuration) is what stops the agent treating the new document as
     absent and quietly answering from an older one in the same conversation.
     If it still isn't ready, the run continues and the agent is told to say
     so rather than substituting a different document. */
  const attachedDocs = await db.query.documents.findMany({
    where: eq(documentsTable.messageId, userMessage.id),
  });

  /* Phase 8 — instead of resending the whole history every turn, older
     turns are compacted into a rolling summary and only recent ones go
     verbatim. Memory recall runs alongside it (both hit the network, and
     neither depends on the other), and so does the document wait above —
     none of the three depends on another, so the wait usually costs nothing
     beyond what context building already takes. */
  const [context, recalledMemories] = await Promise.all([
    buildConversationContext(id),
    recallRelevant(userId, content),
    waitForDocuments(attachedDocs.map((d) => d.id)),
  ]);

  // Per-message override (AGENTS.md Phase 2 §8) — falls back to the
  // conversation's stored mode, and never gets written back onto it.
  const effectiveMode = isModelMode(body?.mode) ? body.mode : convo.modelMode;
  const primaryModel = selectModel(effectiveMode, content);

  const generator = runFinancialAgent({
    conversationId: id,
    userId,
    messages: context.messages,
    model: primaryModel,
    // Lets the agent tell "the PDF the user just attached" apart from
    // "a PDF uploaded earlier in this conversation".
    currentMessageId: userMessage.id,
    conversationSummary: context.summary,
    recalledMemories,
  });

  // Drive the first event before responding, so a failure on every candidate
  // model still surfaces as a normal HTTP error status instead of a
  // silently-empty stream.
  let first: IteratorResult<AgentEvent, { modelUsed: string }>;
  try {
    first = await generator.next();
  } catch (err) {
    console.error("Agent run failed:", describeError(err));
    const status = err instanceof OpenRouterError ? statusForUpstreamError(err.statusCode) : 500;
    return NextResponse.json({ error: userMessageForError(err) }, { status });
  }

  const encoder = new TextEncoder();
  let fullText = "";
  let modelUsed = primaryModel;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        if (!first.done) {
          if (first.value.type === "text") fullText += first.value.text;
          send(first.value);
        }
        while (true) {
          const next = await generator.next();
          if (next.done) {
            modelUsed = next.value.modelUsed;
            break;
          }
          if (next.value.type === "text") fullText += next.value.text;
          send(next.value);
        }
      } catch (err) {
        console.error("Agent stream failed:", describeError(err));
        // A mid-run failure (e.g. a transient upstream/SDK error on a
        // follow-up turn after a tool already ran) would otherwise leave
        // the client with a stream that just stops — always surface a
        // clean message when no text made it out at all.
        if (!fullText) {
          fullText = userMessageForError(err);
          send({ type: "text", text: fullText });
        }
      } finally {
        controller.close();
        if (fullText) {
          await db.insert(messagesTable).values({
            conversationId: id,
            role: "assistant",
            content: fullText,
            modelUsed,
          });
          await db
            .update(conversation)
            .set({ updatedAt: new Date() })
            .where(eq(conversation.id, id));
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
