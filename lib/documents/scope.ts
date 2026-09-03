import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { conversation, documents } from "@/db/schema";

/* Which documents a search should look at.

   "attached"     — only what the user attached to the message being answered.
   "project"      — every ready document in the conversation's project.
   "conversation" — every ready document in this conversation.

   The precedence matters. A newly-attached PDF must win, or a question about
   it gets answered from an older document that happened to score higher. But
   once nothing is attached, a conversation inside a project should see the
   whole project's documents — that is the point of projects: upload the 10-K
   once and use it in every conversation about that company. */
export type DocumentScope = "attached" | "project" | "conversation";

export interface ScopeInputs {
  hasAttached: boolean;
  hasProject: boolean;
  /** An explicit scope asked for by the model, if any. */
  requested?: DocumentScope;
}

/** Pure decision step, separated from the database so the precedence rules
    can be tested on their own. */
export function chooseScope({ hasAttached, hasProject, requested }: ScopeInputs): DocumentScope {
  if (requested === "attached") {
    /* Asking for "attached" when nothing is attached would search nothing at
       all and produce a false "I couldn't find it". Widen instead. */
    return hasAttached ? "attached" : hasProject ? "project" : "conversation";
  }
  if (requested === "project") return hasProject ? "project" : "conversation";
  if (requested === "conversation") return "conversation";

  // No explicit request: narrowest meaningful scope.
  if (hasAttached) return "attached";
  return hasProject ? "project" : "conversation";
}

/** Resolves a scope to the concrete set of ready document ids to search.

    Resolution happens here in Postgres rather than as a Qdrant filter, so no
    `projectId` payload field, payload index, or vector backfill is needed —
    the ids feed the `documentIds` filter searchChunks already supports. */
export async function resolveDocumentScope(
  conversationId: string,
  scope: DocumentScope,
  attachedDocumentIds: string[]
): Promise<string[]> {
  if (scope === "attached") return attachedDocumentIds;

  if (scope === "project") {
    const convo = await db.query.conversation.findFirst({
      where: eq(conversation.id, conversationId),
    });
    if (convo?.projectId) {
      const rows = await db.query.documents.findMany({
        where: and(eq(documents.projectId, convo.projectId), eq(documents.status, "ready")),
      });
      return rows.map((r) => r.id);
    }
    // No project — fall through to conversation scope rather than returning
    // nothing, which would look to the model like "there are no documents".
  }

  const rows = await db.query.documents.findMany({
    where: and(eq(documents.conversationId, conversationId), eq(documents.status, "ready")),
  });
  return rows.map((r) => r.id);
}

/** True when this conversation belongs to a project — used to decide whether
    "project" is even an available scope. */
export async function conversationProjectId(conversationId: string): Promise<string | null> {
  const convo = await db.query.conversation.findFirst({
    where: eq(conversation.id, conversationId),
  });
  return convo?.projectId ?? null;
}
