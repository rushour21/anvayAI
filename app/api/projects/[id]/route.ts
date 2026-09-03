import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { projects, conversation, documents, artifacts } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";

function normaliseTickers(input: unknown): string[] {
  const raw = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/[,\s]+/)
      : [];
  const cleaned = raw
    .map((t) => String(t).trim().toUpperCase())
    .filter((t) => /^[A-Z.\-]{1,10}$/.test(t));
  return [...new Set(cleaned)];
}

/* The overview arrives in one request. It leads with what changed since the
   analyst last opened the project — the core "what changed" loop — rather
   than a directory listing, which is what a folder tree would give them. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const since = project.lastViewedAt;

  const [convos, docs, arts] = await Promise.all([
    db.query.conversation.findMany({
      where: eq(conversation.projectId, id),
      orderBy: desc(conversation.updatedAt),
    }),
    db.query.documents.findMany({
      where: eq(documents.projectId, id),
      orderBy: desc(documents.createdAt),
    }),
    db.query.artifacts.findMany({
      where: eq(artifacts.projectId, id),
      orderBy: desc(artifacts.updatedAt),
    }),
  ]);

  /* Computed before the visit is recorded below, so the first render after an
     absence still shows what happened while the analyst was away. */
  const changedSince = since
    ? {
        since: since.toISOString(),
        conversations: convos.filter((c) => c.updatedAt > since).length,
        documents: docs.filter((d) => d.createdAt > since).length,
        artifacts: arts.filter((a) => a.updatedAt > since).length,
      }
    : null;

  await db.update(projects).set({ lastViewedAt: new Date() }).where(eq(projects.id, id));

  return NextResponse.json({
    id: project.id,
    name: project.name,
    tickers: project.tickers,
    thesis: project.thesis,
    openQuestions: project.openQuestions,
    lastViewedAt: since?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    changedSince,
    conversations: convos.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
    })),
    documents: docs.map((d) => ({
      id: d.id,
      filename: d.filename,
      status: d.status,
      pageCount: d.pageCount,
      createdAt: d.createdAt.toISOString(),
    })),
    artifacts: arts.map((a) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      currentVersion: a.currentVersion,
      updatedAt: a.updatedAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const patch: Partial<typeof projects.$inferInsert> = { updatedAt: new Date() };

  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 80);
  if (body?.tickers !== undefined) patch.tickers = normaliseTickers(body.tickers);
  if (body?.thesis !== undefined) {
    patch.thesis = typeof body.thesis === "string" && body.thesis.trim() ? body.thesis.trim() : null;
  }
  if (Array.isArray(body?.openQuestions)) {
    patch.openQuestions = body.openQuestions
      .map((q: unknown) => String(q).trim())
      .filter(Boolean)
      .slice(0, 50);
  }

  const [updated] = await db.update(projects).set(patch).where(eq(projects.id, id)).returning();

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    tickers: updated.tickers,
    thesis: updated.thesis,
    openQuestions: updated.openQuestions,
    updatedAt: updated.updatedAt.toISOString(),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!project || project.userId !== userId) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  /* Conversations and documents survive (their project_id is SET NULL) —
     tidying a project away must never destroy the analyst's work or their
     uploaded files. Artifacts belong to the project and cascade. */
  await db.delete(projects).where(eq(projects.id, id));

  return NextResponse.json({ ok: true });
}
