import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { conversation, messages as messagesTable, documents as documentsTable } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const convo = await db.query.conversation.findFirst({ where: eq(conversation.id, id) });
  if (!convo || convo.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const rows = await db.query.messages.findMany({
    where: eq(messagesTable.conversationId, id),
    orderBy: asc(messagesTable.createdAt),
  });

  const docs = await db.query.documents.findMany({
    where: eq(documentsTable.conversationId, id),
    orderBy: asc(documentsTable.createdAt),
  });

  return NextResponse.json({
    id: convo.id,
    title: convo.title,
    modelMode: convo.modelMode,
    messages: rows.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      modelUsed: m.modelUsed,
      createdAt: m.createdAt.toISOString(),
    })),
    documents: docs.map((d) => ({
      id: d.id,
      filename: d.filename,
      status: d.status,
      pageCount: d.pageCount,
      error: d.error,
      messageId: d.messageId,
      createdAt: d.createdAt.toISOString(),
    })),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const convo = await db.query.conversation.findFirst({ where: eq(conversation.id, id) });
  if (!convo || convo.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // messages/agent_runs/tool_calls all cascade-delete via their FK to
  // conversations/agent_runs (db/schema.ts) — no manual cleanup needed.
  await db.delete(conversation).where(eq(conversation.id, id));

  return NextResponse.json({ ok: true });
}
