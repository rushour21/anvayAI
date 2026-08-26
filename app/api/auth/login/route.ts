import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSessionToken, COOKIE_NAME, MAX_AGE_SECONDS } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !ok) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const res = NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    createdAt: user.createdAt.getTime(),
  });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
