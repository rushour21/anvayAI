import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { deleteDocument as deleteFromStorage } from "@/lib/documents/providers/storage";
import { deleteDocumentVectors } from "@/lib/documents/providers/vectorstore";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc || doc.userId !== userId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: doc.id,
    filename: doc.filename,
    status: doc.status,
    pageCount: doc.pageCount,
    error: doc.error,
    createdAt: doc.createdAt.toISOString(),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!doc || doc.userId !== userId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // document_chunks rows cascade via FK; storage object and Qdrant vectors
  // don't, so clean those up explicitly.
  await deleteFromStorage(doc.storageKey).catch((err) => console.error("[documents] storage delete failed:", err));
  await deleteDocumentVectors(doc.id).catch((err) => console.error("[documents] vector delete failed:", err));
  await db.delete(documents).where(eq(documents.id, id));

  return NextResponse.json({ ok: true });
}
