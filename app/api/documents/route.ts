import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/db";
import { conversation, documents } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { uploadDocument } from "@/lib/documents/providers/storage";
import { processDocument } from "@/lib/documents/process";

/* Processing (parse → chunk → embed → upsert) can take up to ~90s for a
   large PDF (LlamaParse's own poll timeout) — well past Vercel's default
   10s. Runs inside after() below so the upload response returns fast while
   processing continues; after() itself is bounded by this maxDuration. */
export const maxDuration = 60;

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const conversationId = form?.get("conversationId");
  if (!(file instanceof File) || typeof conversationId !== "string" || !conversationId) {
    return NextResponse.json({ error: "file and conversationId are required" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File exceeds the 20MB upload limit" }, { status: 400 });
  }

  const convo = await db.query.conversation.findFirst({ where: eq(conversation.id, conversationId) });
  if (!convo || convo.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const documentId = randomUUID();
  const storageKey = `${userId}/${conversationId}/${documentId}-${file.name}`;

  try {
    await uploadDocument(storageKey, buffer, file.type);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 502 }
    );
  }

  const [doc] = await db
    .insert(documents)
    .values({
      id: documentId,
      conversationId,
      userId,
      filename: file.name,
      storageKey,
      status: "uploaded",
    })
    .returning();

  after(() =>
    processDocument(documentId).catch((err) =>
      console.error(`[documents] processing failed documentId=${documentId}:`, err)
    )
  );

  return NextResponse.json({
    id: doc.id,
    filename: doc.filename,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  });
}
