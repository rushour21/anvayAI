import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";

/** Tickers arrive as free text ("nvda, amd") — normalise to the uppercase,
    de-duplicated form the finance tools expect. */
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

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.projects.findMany({
    where: eq(projects.userId, userId),
    orderBy: desc(projects.updatedAt),
  });

  return NextResponse.json(
    rows.map((p) => ({
      id: p.id,
      name: p.name,
      tickers: p.tickers,
      thesis: p.thesis,
      openQuestions: p.openQuestions,
      lastViewedAt: p.lastViewedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rawName = typeof body?.name === "string" ? body.name.trim() : "";
  if (!rawName) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(projects)
    .values({
      userId,
      name: rawName.slice(0, 80),
      tickers: normaliseTickers(body?.tickers),
      thesis: typeof body?.thesis === "string" ? body.thesis.trim() || null : null,
    })
    .returning();

  return NextResponse.json({
    id: created.id,
    name: created.name,
    tickers: created.tickers,
    thesis: created.thesis,
    openQuestions: created.openQuestions,
    lastViewedAt: null,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  });
}
