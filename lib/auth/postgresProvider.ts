import type { AuthProvider, AuthUser, SignInInput, SignUpInput } from "./types";

/* Phase B (docs/AUTH-PLAN.md) — talks to the app's own /api/auth/* route
   handlers, which own the Postgres users table and the session cookie.
   Same interface as mockProvider; nothing above lib/auth/index.ts knows
   the difference. */

async function parseOrThrow(res: Response): Promise<Record<string, unknown>> {
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof data.error === "string" ? data.error : "Something went wrong.";
    throw new Error(message);
  }
  return data;
}

export const postgresProvider: AuthProvider = {
  async signUp(input: SignUpInput) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await parseOrThrow(res)) as unknown as AuthUser;
  },

  async signIn(input: SignInInput) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await parseOrThrow(res)) as unknown as AuthUser;
  },

  async signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
  },

  async getSession() {
    const res = await fetch("/api/auth/session");
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser | null };
    return data.user;
  },
};
