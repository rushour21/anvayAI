import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, artifactVersions } from "@/db/schema";

/** Loads an artifact plus its current version, enforcing user ownership.

    Lives here rather than in the route module because Next.js only allows a
    route file to export route handlers and config — an extra named export
    there fails the build's route-export validation. */
export async function loadArtifact(userId: string, id: string) {
  const artifact = await db.query.artifacts.findFirst({ where: eq(artifacts.id, id) });
  if (!artifact || artifact.userId !== userId) return null;

  const version = await db.query.artifactVersions.findFirst({
    where: and(
      eq(artifactVersions.artifactId, id),
      eq(artifactVersions.version, artifact.currentVersion)
    ),
  });
  return { artifact, version };
}
