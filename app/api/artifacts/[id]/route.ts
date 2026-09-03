import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, artifactVersions } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { loadArtifact } from "@/lib/artifacts/load";
import type { ArtifactContent } from "@/types/artifact";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const loaded = await loadArtifact(userId, id);
  if (!loaded) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });

  const versions = await db.query.artifactVersions.findMany({
    where: eq(artifactVersions.artifactId, id),
    orderBy: desc(artifactVersions.version),
  });

  return NextResponse.json({
    id: loaded.artifact.id,
    kind: loaded.artifact.kind,
    title: loaded.artifact.title,
    projectId: loaded.artifact.projectId,
    conversationId: loaded.artifact.conversationId,
    spec: loaded.artifact.spec,
    currentVersion: loaded.artifact.currentVersion,
    content: loaded.version?.content ?? null,
    createdAt: loaded.artifact.createdAt.getTime(),
    updatedAt: loaded.artifact.updatedAt.getTime(),
    versions: versions.map((v) => ({
      version: v.version,
      author: v.author,
      summary: v.summary,
      createdAt: v.createdAt.getTime(),
    })),
  });
}

/* An edit never overwrites — it appends a new version and moves the pointer.
   Version history is what makes "what changed between v3 and v4" answerable,
   and an analyst who can't see what moved won't trust the artifact. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const loaded = await loadArtifact(userId, id);
  if (!loaded) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const content = body?.content as ArtifactContent | undefined;
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const nextVersion = loaded.artifact.currentVersion + 1;
  await db.insert(artifactVersions).values({
    artifactId: id,
    version: nextVersion,
    content,
    author: body?.author === "agent" ? "agent" : "user",
    summary: typeof body?.summary === "string" ? body.summary : null,
  });

  const [updated] = await db
    .update(artifacts)
    .set({
      currentVersion: nextVersion,
      updatedAt: new Date(),
      ...(typeof body?.title === "string" && body.title.trim()
        ? { title: body.title.trim().slice(0, 120) }
        : {}),
    })
    .where(eq(artifacts.id, id))
    .returning();

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    currentVersion: updated.currentVersion,
    updatedAt: updated.updatedAt.getTime(),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const loaded = await loadArtifact(userId, id);
  if (!loaded) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });

  // artifact_versions cascade via FK.
  await db.delete(artifacts).where(eq(artifacts.id, id));
  return NextResponse.json({ ok: true });
}
