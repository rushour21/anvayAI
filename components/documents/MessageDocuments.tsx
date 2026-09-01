"use client";

import { useChatStore } from "@/stores/chatStore";
import DocumentChip from "./DocumentChip";

/** Documents attached to one specific user message — rendered above that
    message's bubble once it's been sent (see MessageBubble.tsx). Before
    that, the same document shows in AttachedDocuments (the composer). */
export default function MessageDocuments({ messageId }: { messageId: string }) {
  const documents = useChatStore((s) => s.documents.filter((d) => d.messageId === messageId));
  const deleteDocument = useChatStore((s) => s.deleteDocument);

  if (documents.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {documents.map((doc) => (
        <DocumentChip key={doc.id} document={doc} onDelete={() => deleteDocument(doc.id)} />
      ))}
    </div>
  );
}
