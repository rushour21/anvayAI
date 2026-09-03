import { NextRequest, NextResponse } from "next/server";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db";
import { conversation, projects } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { isModelMode } from "@/lib/ai/models";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  /* ?projectId= filters the sidebar to one project. Without it the list is
     every conversation, project-scoped or not — chat still works with no
     project at all. */
  const projectId = req.nextUrl.searchParams.get("projectId");
  const rows = await db.query.conversation.findMany({
    where: projectId
      ? and(eq(conversation.userId, userId), eq(conversation.projectId, projectId))
      : eq(conversation.userId, userId),
    orderBy: desc(conversation.updatedAt),
  });

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      title: c.title,
      modelMode: c.modelMode,
      projectId: c.projectId,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rawTitle = typeof body?.title === "string" ? body.title.trim() : "";
  const title = rawTitle ? rawTitle.slice(0, 80) : "New conversation";
  const modelMode = isModelMode(body?.modelMode) ? body.modelMode : "auto";

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
    .insert(conversation)
    .values({ userId, title, modelMode, projectId })
    .returning();

  return NextResponse.json({
    id: created.id,
    title: created.title,
    modelMode: created.modelMode,
    projectId: created.projectId,
  });
}
