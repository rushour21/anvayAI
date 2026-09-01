"use client";

import { useChatStore } from "@/stores/chatStore";
import DocumentChip from "./DocumentChip";

/** Documents attached to the current conversation — rendered just above the
    composer (see InputCard.tsx). Renders nothing when there are none, so it
    never adds visual weight to a plain conversation. */
export default function AttachedDocuments() {
  // Only pending uploads (not yet tied to a sent message) belong here —
  // once a message ties them via messageId, MessageDocuments renders them
  // in chat history instead.
  const documents = useChatStore((s) => s.documents.filter((d) => !d.messageId));
  const deleteDocument = useChatStore((s) => s.deleteDocument);

  if (documents.length === 0) return null;

  return (
    <div
      className="mx-auto flex flex-wrap gap-1.5 px-1 pb-2"
      style={{ maxWidth: 760 }}
    >
      {documents.map((doc) => (
        <DocumentChip key={doc.id} document={doc} onDelete={() => deleteDocument(doc.id)} />
      ))}
    </div>
  );
}
