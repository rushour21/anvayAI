import { NextRequest } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "./session";

/* Shared by every /api/conversations* route — same cookie/JWT check as
   /api/auth/session, factored out so each route doesn't repeat it. */
export async function getAuthUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  return token ? await verifySessionToken(token) : null;
}
