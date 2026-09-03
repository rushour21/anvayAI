import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, artifactVersions, projects } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import type { ArtifactContent } from "@/types/artifact";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  const conversationId = req.nextUrl.searchParams.get("conversationId");

  const rows = await db.query.artifacts.findMany({
    where: projectId
      ? and(eq(artifacts.userId, userId), eq(artifacts.projectId, projectId))
      : conversationId
        ? and(eq(artifacts.userId, userId), eq(artifacts.conversationId, conversationId))
        : eq(artifacts.userId, userId),
    orderBy: desc(artifacts.updatedAt),
  });

  return NextResponse.json(
    rows.map((a) => ({
      id: a.id,
      kind: a.kind,
      title: a.title,
      projectId: a.projectId,
      conversationId: a.conversationId,
      currentVersion: a.currentVersion,
      createdAt: a.createdAt.getTime(),
      updatedAt: a.updatedAt.getTime(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const kind = body?.kind === "note" ? "note" : body?.kind === "sheet" ? "sheet" : null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const content = body?.content as ArtifactContent | undefined;

  if (!kind || !title || !content) {
    return NextResponse.json({ error: "kind, title and content are required" }, { status: 400 });
  }

  // A projectId, when given, must belong to this user.
  let projectId: string | null = null;
  if (typeof body?.projectId === "string" && body.projectId) {
    const project = await db.query.projects.findFirst({ where: eq(projects.id, body.projectId) });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    projectId = project.id;
  }

  const [created] = await db
    .insert(artifacts)
    .values({
      userId,
      projectId,
      conversationId: typeof body?.conversationId === "string" ? body.conversationId : null,
      kind,
      title: title.slice(0, 120),
      spec: body?.spec ?? null,
    })
    .returning();

  await db.insert(artifactVersions).values({
    artifactId: created.id,
    version: 1,
    content,
    author: body?.author === "user" ? "user" : "agent",
    summary: typeof body?.summary === "string" ? body.summary : null,
  });

  return NextResponse.json({
    id: created.id,
    kind: created.kind,
    title: created.title,
    projectId: created.projectId,
    conversationId: created.conversationId,
    currentVersion: created.currentVersion,
    createdAt: created.createdAt.getTime(),
    updatedAt: created.updatedAt.getTime(),
  });
}
