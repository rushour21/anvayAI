import { eq, and, gt } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, artifactVersions } from "@/db/schema";
import { extractFirstTable, deriveTitle } from "./from-markdown";
import { isSheetContent, type SheetContent, type NoteContent } from "@/types/artifact";

/* Safety net for create_artifact.

   Verified against the live tool_calls log: on a MiniMax run that produced a
   three-row revenue table, the agent used 6 of its 8 steps and never called
   create_artifact once. The prompt has been strengthened, but a free model
   will still miss it, and an analyst staring at a table they have to retype
   is the failure this product exists to remove. So if the answer contains a
   table and the run saved nothing, the table is saved here.

   Deliberately silent on failure: this runs after the response has already
   streamed, and a failed convenience save must never surface as an error on
   an otherwise good answer. */
export async function autoSaveTableArtifact({
  userId,
  conversationId,
  projectId,
  answer,
  fallbackTitle,
  since,
}: {
  userId: string;
  conversationId: string;
  projectId: string | null;
  answer: string;
  fallbackTitle: string;
  /** Start of this run — anything the agent saved itself is newer than this. */
  since: Date;
}): Promise<void> {
  try {
    const sheet = extractFirstTable(answer);
    if (!sheet) return;

    // The agent already saved something this run — don't duplicate it, and
    // prefer its version, which carries per-cell sources.
    const savedThisRun = await db.query.artifacts.findFirst({
      where: and(eq(artifacts.conversationId, conversationId), gt(artifacts.createdAt, since)),
    });
    if (savedThisRun) return;

    /* A follow-up answer usually re-renders the same table with one more
       column. Saving that as a second artifact is exactly the pile-of-
       near-identical-sheets problem the workspace is meant to avoid — the
       agent should have called update_artifact. If a sheet with these columns
       already exists, do nothing rather than duplicate it. */
    const signature = (sheet: SheetContent) =>
      sheet.columns.map((c) => c.label.toLowerCase().trim()).join("|");
    const newSignature = signature(sheet);

    const priorArtifacts = await db.query.artifacts.findMany({
      where: and(eq(artifacts.conversationId, conversationId), eq(artifacts.kind, "sheet")),
    });
    for (const prior of priorArtifacts) {
      const version = await db.query.artifactVersions.findFirst({
        where: and(
          eq(artifactVersions.artifactId, prior.id),
          eq(artifactVersions.version, prior.currentVersion)
        ),
      });
      const content = version?.content as SheetContent | NoteContent | undefined;
      if (content && isSheetContent(content) && signature(content) === newSignature) return;
    }

    const [created] = await db
      .insert(artifacts)
      .values({
        userId,
        projectId,
        conversationId,
        kind: "sheet",
        title: deriveTitle(answer, fallbackTitle),
        spec: null,
      })
      .returning();

    await db.insert(artifactVersions).values({
      artifactId: created.id,
      version: 1,
      content: sheet,
      author: "agent",
      summary: "Recovered from the answer",
    });
  } catch (err) {
    console.error("[artifacts] auto-save failed:", err);
  }
}
