import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { loadArtifact } from "@/lib/artifacts/load";
import { artifactToXlsx } from "@/lib/artifacts/xlsx";
import { artifactToCsv } from "@/lib/artifacts/csv";
import type { ArtifactContent } from "@/types/artifact";

/* Building a workbook is CPU work over an arbitrary number of rows — well
   past the platform's 10s default, same reason the message and upload routes
   raise it. */
export const maxDuration = 60;

/** Strips characters that would break a Content-Disposition filename. */
function safeFilename(title: string, extension: string): string {
  const base = title.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "artifact";
  return `${base}.${extension}`;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const loaded = await loadArtifact(userId, id);
  if (!loaded || !loaded.version) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const content = loaded.version.content as ArtifactContent;
  const title = loaded.artifact.title;

  if (format === "csv") {
    return new NextResponse(artifactToCsv(content), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeFilename(title, "csv")}"`,
      },
    });
  }

  const buffer = await artifactToXlsx(title, content);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${safeFilename(title, "xlsx")}"`,
    },
  });
}
