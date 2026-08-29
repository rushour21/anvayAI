import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { conversation } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { isModelMode } from "@/lib/ai/models";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.conversation.findMany({
    where: eq(conversation.userId, userId),
    orderBy: desc(conversation.updatedAt),
  });

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      title: c.title,
      modelMode: c.modelMode,
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

  const [created] = await db.insert(conversation).values({ userId, title, modelMode }).returning();

  return NextResponse.json({ id: created.id, title: created.title, modelMode: created.modelMode });
}
