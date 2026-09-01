/** Status values the backend reports for an uploaded document
    (GET /api/documents/:id and the conversation's `documents` array). */
export type DocumentStatus = "uploaded" | "processing" | "ready" | "error";

/** "uploading" is a client-only state covering the window between choosing
    a file and the initial POST /api/documents response — the backend never
    reports it. */
export type ClientDocumentStatus = DocumentStatus | "uploading";

export interface DocumentAttachment {
  id: string;
  filename: string;
  status: ClientDocumentStatus;
  pageCount?: number;
  error?: string;
  /** Null/undefined while pending (shown in the composer). Set once the
      document has been tied to the message it was attached to — the chip
      then renders in chat history above that message instead. */
  messageId?: string | null;
  createdAt: number;
}
