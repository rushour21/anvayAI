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
  createdAt: number;
}
