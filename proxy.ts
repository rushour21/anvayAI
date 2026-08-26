import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";

/* Phase B route protection (docs/AUTH-PLAN.md) — runs at the edge, reads
   the session cookie directly, no database round trip. Replaces the
   client-side-only redirect that AuthGuard did in Phase A; AuthGuard stays
   as the loading state and the thing that populates authStore.user for
   the UI, but this is what actually keeps a signed-out visitor out.

   Named proxy.ts, not middleware.ts — Next.js 16 renamed the convention
   (the old name still works but logs a deprecation warning). */

const PROTECTED_PREFIXES = ["/chat", "/settings", "/profile", "/help"];
const AUTH_PAGES = ["/login", "/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const userId = token ? await verifySessionToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL("/chat/new", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*", "/profile/:path*", "/help/:path*", "/login", "/register"],
};
