# Anvay — Workspace

**Last updated:** 2 September 2026
**Status:** Proposal. It adds detail to `PRD.md` §7 (output types) and §10 (document
types), and gives `MVP.md` v3 "document generation" a real screen to live on.
**Current code:** `components/layout/RightPanel.tsx` is an empty box. It has a title,
it can be resized, and it says "Nothing open yet". Everything in this document is
still to be built.

---

## 1. The main idea

Chat is where the analyst **asks**. The Workspace is where the answer becomes
**a file they own**.

A chat message is read once and then forgotten. A Workspace item — we call it an
**artifact** — is different. It has three things a chat message can never have:

1. **Sources.** Every number can be traced back to a filing, a page, and a sentence.
2. **It stays.** It lives after the chat is closed. It has versions and a history.
3. **It can update itself.** It remembers which companies and which periods it was
   built from. Next quarter it rebuilds itself instead of being typed again.

That is the whole design. Simple rule: **if a feature does not add one of these
three things, it belongs in chat, not in the Workspace.**

---

## 2. Why this is not "Claude with a finance skin"

First, be honest about what already exists. Claude and ChatGPT already do a lot of
this well. They can write an Excel file, write a good earnings note, draw a chart,
and read a PDF you upload. If we pretend they can't, a 30-second demo will prove us
wrong.

Here is what they **cannot** do. Not "do worse" — cannot do at all:

| Question | Claude / ChatGPT | Anvay Workspace |
|---|---|---|
| Where did this number come from? | Somewhere in the long PDF you pasted | Click the cell → filing → page → the exact sentence |
| What about next quarter? | Upload everything again, write the prompt again, hope the format matches | Open the artifact, press Refresh. It knows its companies and periods |
| Can it work on my model? | It reads it, then gives you a **new** file. Your formatting and formulas are gone | It edits **your** file. Formulas and formatting stay |
| Where do the numbers come from? | Written by a language model. They look correct | Fetched by real code (`lib/finance/calculations/`). The model arranges them, it never invents them |
| Does it match my firm's format? | You describe the format in every prompt | You upload the format once. It is reused every time |
| Is the math correct? | "Looks right" | Totals are checked, subtotals are checked, numbers are compared against the filing |
| Is it safe to send to a client? | No record of anything | Source coverage check, disclosure block, "as of" date, full edit history |

So the difference is not that we can generate files. Everyone can generate files.
The difference is that **our files are connected to real sources and stay alive**,
and that we edit the analyst's **existing** file instead of replacing it.

One line to remember: *Claude gives you a file. Anvay gives you something you can
defend in a meeting.*

---

## 3. What an artifact is

Five types. Only the first three matter for the MVP.

| Type | What it is | Export as |
|---|---|---|
| `sheet` | A workbook: comp sheet, statement extract, the user's own model | XLSX, CSV |
| `note` | A document: earnings note, flash note, initiation, IC memo | PDF, DOCX |
| `table` | A data table taken out of a chat answer | XLSX, CSV, copy |
| `chart` | A numbered exhibit | PNG, SVG, PPTX slide |
| `checklist` | Diligence checklist (later, after v3) | PDF |

Every artifact stores four things:

- **`spec`** — the recipe that made it: companies, periods, list of metrics, template
  used. This is what makes Refresh possible. Run the recipe again, show what changed.
- **`provenance`** — one row for every number: which cell, which source, which page,
  which sentence.
- **`versions`** — a saved copy each time it changes, with who changed it (user or
  agent) and a short summary of the change.
- **`pin`** — an optional link to a company, so the artifact shows up in research
  memory (`PRD.md` §8).

---

## 4. Full list of what we can build

Grouped by which of the three properties from §1 it adds. The order to build them in
is in §5.

### A. Create — turn an answer into a file

**A1. Send a chat table to the Workspace.** The agent already writes tables in its
answers. Add a small "Open in Workspace" button on each one. This is the smallest
feature in this document, and it is the one that makes the empty panel stop being
empty.

**A2. Comp sheet builder.** N companies × M metrics × K periods. It is not a fixed
grid. The recipe is `{companies, metrics, periods}`, so adding one more company or
one more quarter is a re-run, not a rebuild. It should also add the rows analysts
always add by hand: median, average, premium or discount to the peer median, and rank.

**A3. Statement extract.** "Give me NVDA's last 12 quarters, all three statements,
cleaned up." The result is a clean workbook: one tab per statement, same units
everywhere, same sign rules everywhere, a **Source** column next to each line, and a
Notes tab listing every change we made while cleaning. This is the most repetitive
manual job an analyst has.

**A4. Write the note.** Earnings note, flash note, initiation, IC memo — the exact
documents listed in `PRD.md` §10. Built from findings already in the chat:
thesis → what changed → supporting table → risks → valuation → sources.

**A5. Exhibit builder.** Charts with a number, a caption, and a source line. Sized
for a report or a slide, not for a screen.

### B. Work on the analyst's own file

This is the strongest reason for an analyst to switch. It is also the hardest part
to build — see §7.

**B1. Model map.** The user uploads an .xlsx. Anvay reads the workbook and shows how
it is built: the tabs, the named ranges, which cells are typed-in inputs, which cells
are calculations, which are outputs, and how they connect. When an analyst inherits a
model from someone who left the firm, they spend days working this out by hand.

**B2. Careful edits.** "Add an FY27 column and extend the formulas." "Add a bear case
at 6% revenue growth." "Update the segment split after the reorganisation." The change
is made **inside their file**. Formulas stay formulas. Formatting stays. Tabs we did
not touch stay exactly the same.

**B3. Model check.** A list of real problems, found by code, not by the model's
opinion:
- a typed-in number sitting in a row that should be all formulas (a "plug")
- one formula in a row that is different from its neighbours
- `#REF!`, `#DIV/0!`, broken links to other files
- circular references that were not intended
- totals that do not add up, subtotals that do not match
- sign mistakes (capex positive one year, negative the next)
- units mixed up (thousands in one place, millions in another)

Shown as a list sorted by seriousness. Click an item, go to the cell.

**B4. Compare the model to the filing.** Take the historical columns in their model
and compare them with the real reported numbers. "Your FY25 revenue row is correct.
Your FY24 gross profit is wrong by 12bps because you used the number from before the
restatement." This is the feature an analyst shows to a colleague.

**B5. List of assumptions.** Pull out every typed-in assumption in the model, show
where it sits and what it affects. Export it as its own tab. An unclear model
becomes reviewable.

**B6. Fill in from the filing.** Empty cells in a template get filled with real
numbers, each one carrying its source.

**B7. Compare two versions in plain words.** "Between v3 and v4: FY26 revenue growth
cut from 14% to 11%, WACC raised by 40bps, terminal margin unchanged. Price target
moved from $182 to $164. About 70% of that move comes from the growth cut."

### C. Keep it alive

**C1. Refresh.** Run the artifact's recipe again with today's data. Always show it as
a comparison — old number, new number, the difference — never replace things quietly.
The analyst has to see what moved.

**C2. Draft ready on earnings day.** The artifact knows which companies it covers.
When one of them reports, the quarterly note is drafted overnight and waiting, with
blanks left where the analyst's judgement is needed.

**C3. Watch for restatements.** When a company restates results, changes how it
reports segments, or changes its fiscal year, mark every artifact whose numbers are
now old or no longer comparable. An artifact that is quietly out of date is the
fastest way to lose the user's trust.

**C4. Source panel.** Click a cell, and the source opens next to it with the
supporting sentence highlighted. For uploaded documents this is cheap to build,
because page numbers are already saved per chunk (`documentChunks.page`, filled by
LlamaParse in `lib/documents/providers/parser.ts`). For SEC filings it is not cheap —
see §7.

### D. Making it usable at a real firm

**D1. Firm template.** The analyst uploads their firm's earnings note and comp sheet
once. Anvay learns the section order, the exhibit numbering, the fonts, and the
disclosure page — then writes **into** that format. If the note does not look like
the firm's note, the analyst retypes it, and we saved them no time at all.

**D2. Required fields.** Rating, price target, previous price target, "as of" date,
analyst name, disclosure block. If one is missing, block the export instead of
quietly leaving it out.

**D3. Source coverage meter.** What percentage of the numbers in this artifact have a
real source behind them. Show it while the analyst is working. If it is too low,
block the export. This is how we actually handle the "made-up citation" risk in
`PRD.md` §12, and it is also a good thing to show a customer.

**D4. Export formats.** XLSX with working formulas, then PDF, then DOCX, then PPTX
exhibit, then CSV. In that order.

**D5. Edit history.** Every change: who, when, was it the user or the agent, which
model, which tools were used. Needed later for the team plan.

### E. Using several artifacts together

**E1. Pin to a company.** An artifact is attached to a ticker and appears in research
memory. "What did we decide about NVDA last quarter?" returns the actual note.

**E2. Split view.** The source document on one side, the artifact on the other, with
the citations linked. This is how analysts actually work — filing in one hand, model
in the other — so the panel should support it directly.

**E3. One artifact inside another.** The comp sheet becomes Exhibit 2 of the note.
Update the sheet, and the exhibit updates too.

---

## 5. What to build first

Sorted by how much trust it earns compared with how much work it takes.

| # | Build | Why now | Size |
|---|---|---|---|
| 1 | A1 send table to Workspace + XLSX export with a Source column | The panel stops being empty. Proves the whole artifact pipeline works | S |
| 2 | C4 source panel, uploaded documents only | Page numbers already exist. Biggest trust gain for the least code | S |
| 3 | A2 comp sheet with a saved recipe | The most requested output, and the first artifact with a Refresh button | M |
| 4 | A3 statement extract | Removes the most repetitive manual job | M |
| 5 | B1 model map + B3 model check (read only) | The strongest feature, at low risk. It only reads workbooks, never writes them | M |
| 6 | A4 note writing into D1 firm template | This is the v3 exit criterion in `MVP.md` | M |
| 7 | C1 refresh with a comparison view | The thing no competitor has. Only possible once recipes exist | M |
| 8 | B2 careful edits | Highest technical risk. Do it after read-only has earned trust | L |
| 9 | B4 compare model to filing | Needs filings to be ingested, not just searched (§7) | L |
| 10 | C2/C3 watch and pre-draft | Keeps users coming back. Needs a scheduler | L |

Steps 1 to 4 can be built on what exists today. Step 5 needs a workbook library.
Steps 8 and 9 need the two unsolved problems in §7 to be solved first.

---

## 6. Database and API sketch

```sql
CREATE TYPE artifact_kind   AS ENUM ('sheet','note','table','chart','checklist');
CREATE TYPE artifact_origin AS ENUM ('generated','uploaded');

CREATE TABLE artifacts (
  id              uuid PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  kind            artifact_kind   NOT NULL,
  origin          artifact_origin NOT NULL,
  title           text NOT NULL,
  ticker          text,                 -- pin, for research memory
  spec            jsonb,                -- the recipe; NULL for uploads
  current_version integer NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE artifact_versions (
  artifact_id  uuid NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version      integer NOT NULL,
  storage_key  text NOT NULL,           -- S3, same provider as documents
  content      jsonb,                   -- structured form for notes and tables
  author       text NOT NULL,           -- 'user' | 'agent'
  summary      text,                    -- short plain-words changelog
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (artifact_id, version)
);

CREATE TABLE artifact_provenance (
  id           uuid PRIMARY KEY,
  artifact_id  uuid NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version      integer NOT NULL,
  ref          text NOT NULL,           -- 'Comps!C7' or 'note.exhibit2.row3'
  tool_call_id uuid REFERENCES tool_calls(id),
  document_id  uuid REFERENCES documents(id),
  source_url   text,
  page         integer,
  quote        text
);
```

Routes, following the same shape as `app/api/documents`:

```
POST   /api/artifacts                 create (from a recipe, or from an upload)
GET    /api/artifacts?conversationId= list, for the panel
GET    /api/artifacts/:id             current version + sources
POST   /api/artifacts/:id/versions    an edit by the user or the agent
POST   /api/artifacts/:id/refresh     run the recipe again, return a comparison
GET    /api/artifacts/:id/export?f=   xlsx | pdf | docx | csv
POST   /api/artifacts/:id/audit       run the model checks
```

New agent tools, next to the 20 already in `lib/ai/tools/`:

`create_artifact` · `update_artifact` · `read_artifact` · `audit_workbook` ·
`export_artifact`

Same rule as `calculate-metric.ts`: the tool does the work, the model only decides
**which** tool to use and **how to arrange** the result.

---

## 7. The hard parts

**Editing a workbook without breaking it.** This is the biggest technical risk in the
whole document. If we read a workbook, then build a new one from what we read, we
lose formatting, charts, conditional formatting, pivot tables, and macros. An analyst
whose model comes back looking broken will never upload a second one. So the rule is:
**change the original file, never rebuild it from scratch.** Before choosing a
library, run a test that compares them specifically on how well they preserve
formatting, charts, named ranges, and cross-sheet formulas. Give this real time. Do
not assume any library keeps everything.

**Formulas, not typed numbers.** A calculated cell must be written as a formula
(`=C5/B5-1`). A sourced cell is a number plus a source record. If Anvay writes fixed
numbers into a model, it has created exactly the "plug" that feature B3 warns about,
and the analyst will notice straight away.

**No number without a source.** Every figure in an artifact comes from a tool result
or from the user's own file. The model arranges numbers, it never types them. This is
enforced by the coverage meter in D3, not by asking the model nicely in a prompt.

**Filings are searched, not stored.** `lib/finance/providers/filings.ts` returns SEC
EDGAR results and a link, nothing more. There is no stored, page-by-page filing text.
So comparing a model against a filing (B4) and showing filing sources (the filings
half of C4) both need a filing ingestion pipeline that does not exist yet. Uploaded
PDFs already have this. Plan for it, and do not promise filing-level citations before
the filing text is actually stored.

**Time limits.** Document upload is already at a 60 second `maxDuration`. Reading a
workbook, checking it, and refreshing several companies will all take longer. So
artifact work has to be a background job with a status the UI can poll, the same way
documents already work (`uploaded → processing → ready | error`). It cannot be a
normal request.

**Units.** Thousands mixed with millions is the most common cause of a wrong comp
sheet. Convert everything on the way in, store the scale as a real field, and show it
on screen.

**Cost.** A 40-tab model does not cost the same to process as a 20-page PDF. Track it
in the existing `usageLedger` before allowing it on the free plan.

---

## 8. Do you need a sandbox?

Two different things get called a "sandbox". The answer is different for each.

**A sandbox where the model writes code and runs it** (like Claude's code
interpreter). **No — and we should not add one.** For steps 1 to 7 of the build
order, every output has a known shape: a comp sheet, a statement extract, a note in a
template. Those are normal function calls with fixed inputs. Fixed inputs are exactly
what give us sources, a recipe we can run again, and a Refresh button. Model-written
code throws all three away: a recipe you can re-run becomes a script you can only
re-run and hope for the best. It also brings back the randomness that
`calculate-metric.ts` was written to remove. Other assistants need a sandbox because
they do not know what you will ask. We do know. That is our advantage.

**A separate, locked-down container for processing files.** **Yes — but as
infrastructure, not as something the agent controls.** Two reasons:

1. **Safety.** An uploaded .xlsx is an untrusted zip file. It can contain macros, zip
   bombs, and links that try to pull in outside content. Opening those in the same
   process that holds the database password is not acceptable once real analyst
   models start arriving. This becomes necessary the moment B1 ships.
2. **Recalculation.** When we change a formula inside someone's workbook (B2), Node
   writes the formula but does not work out the new value. The old cached value stays
   there, so the user opens a file where the numbers do not match the formulas. To
   fix that you need a real calculation engine. Headless LibreOffice in a container is
   the practical choice, and the same container can produce clean PDFs for D4.

So: a locked-down worker with a job queue, starting at step 5, and no agent-written
code at all. If a real need for open-ended calculation shows up later — "run this
custom transform on my data" — add it then as a narrow, clearly labelled option whose
output is marked **unverified** and left out of the source coverage meter. It must
never become the normal path for the standard outputs.

---

## 9. What we are not building

- A spreadsheet clone. The panel views files, makes careful edits, and exports. It is
  not Google Sheets. Competing on a grid UI would waste the runway.
- Real-time collaboration. There are no teams until the team plan (`AUTH-PLAN.md`).
- A DCF engine, before the comp sheet is trusted. Valuation is where a wrong answer
  costs the most.
- PPTX, before PDF prints correctly.
- Private data-room diligence — out of scope, per `PRD.md` §4.

---

## 10. What success looks like

- An analyst asks a question, gets an answer with sources, clicks once, and has a
  comp sheet in the panel where **every** number can be traced to a source.
- They upload their own model. Anvay tells them three true things about it they did
  not know, and one of them is a real mistake.
- Next quarter they open the same artifact, press Refresh, and review what changed
  instead of rebuilding it.
- The exported note goes to a client without anyone retyping it into the firm's
  template.

The numbers to watch: **exports per active user per week**, and **how many exports
are refreshes rather than first builds**. The second number is the one that tells us
the Workspace became a tool people rely on, and not just a demo.
