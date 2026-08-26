# Anvay — Auth Module Plan

**Last updated:** 26 August 2026
**Status:** Phase A (below) implemented with a local mock provider. Phase B
(Supabase) not started — no project/credentials yet.

This plan covers signup, login, session, and account state — the piece that
everything else (chats, documents, billing) hangs off. It implements
`docs/IMPLEMENTATION-PLAN.md` Phase 1, Stage 1.3 in more detail than that
document goes into, since this is being built now rather than later.

---

## Constraints (from `docs/PRD.md` §9, locked)

- **Email + password only. No Google OAuth.** Reversed from the original
  pre-pivot plan — financial professionals are often on locked-down
  corporate environments where a third-party tool doing Google OAuth is a
  harder sell, and it removes a Google Cloud console dependency per
  environment.
- **Individual accounts only in v1.** No workspaces, no teams, no invites.
  Adding that later must not require a schema rewrite.
- **Supabase is the intended backend**, but credentials don't exist yet.
  The module must work end-to-end today against a local mock, and switching
  to Supabase later must be a one-file change, not a UI rewrite.
- **Plan tiers are coming** (`free → pro → team → enterprise` per the PRD).
  The user model carries a `plan` field from day one so billing isn't
  bolted on as an afterthought.

---

## Architecture: one interface, two providers

Every part of the app that needs auth — pages, the sidebar user chip,
settings — talks to a single `AuthProvider` interface. Today that interface
is backed by a **mock provider** (localStorage, no network). Later it's
backed by a **Supabase provider** with the identical method signatures. The
swap happens in one file; nothing above it changes.

```
components/*, app/*                 (never touch localStorage or Supabase directly)
        │
        ▼
stores/authStore.ts                 (zustand — user, status, actions)
        │
        ▼
lib/auth/index.ts                   (exports the active provider — the one swap point)
        │
   ┌────┴────┐
   ▼         ▼
mockProvider   supabaseProvider      (same AuthProvider interface)
(today)        (Phase B)
```

### The interface

```ts
type PlanTier = "free" | "pro"; // team / enterprise join later, same field

interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  createdAt: number;
}

interface AuthProvider {
  signUp(input: { name: string; email: string; password: string }): Promise<AuthUser>;
  signIn(input: { email: string; password: string }): Promise<AuthUser>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthUser | null>;
}
```

Every plan tier the PRD mentions later (`docs/MVP.md`'s parking lot — Pro,
Team, Enterprise) is a value of `plan`, not a new field or a new table
relationship. That's the whole point of deciding the shape now.

---

## Phase A — Mock provider (implemented now)

**Goal:** signup, login, logout, and session persistence all work today,
with an architecture that doesn't have to be rewritten when Supabase lands.

| Stage | Work | Status |
|---|---|---|
| A.1 | `lib/auth/types.ts` — `AuthUser`, `AuthProvider` interface | ✅ |
| A.2 | `lib/auth/mockProvider.ts` — localStorage-backed, simulated latency, basic email/password validation, no real security | ✅ |
| A.3 | `lib/auth/index.ts` — the single swap point, exports the active provider | ✅ |
| A.4 | `stores/authStore.ts` — zustand store wrapping the provider; `user`, `status`, `signUp`, `signIn`, `signOut` | ✅ |
| A.5 | Rewrite `/login` and `/register` as client components: real validation, loading/error states, redirect to `/chat/new` on success. **Google OAuth button removed** — was disabled dead UI from the pre-pivot plan | ✅ |
| A.6 | Client-side `AuthGuard` wrapping the `(dashboard)` route group — redirects to `/login` if there's no session | ✅ |
| A.7 | Wire the sidebar user chip, Settings → Account, and the Profile page to the real signed-in user instead of the hardcoded "Rushabh Ingle" placeholder | ✅ |
| A.8 | Logout in `UserMenu` calls `authStore.signOut()` before navigating, instead of just linking to `/login` | ✅ |

**Exit criteria:** create an account, get redirected into the app, refresh
the page and stay signed in, sign out from the user menu, and land back on
`/login`. Visiting `/chat/new` while signed out redirects to `/login`.

**What this deliberately does not do:** no real password hashing, no email
verification, no password reset, no protection against someone reading
`localStorage`. It exists so the rest of the product (chat, settings,
billing UI) has a real user object to render against, not so it can hold a
real user's password. Treat every account created against the mock
provider as disposable — Phase B replaces the storage, not the interface,
so nothing carries over.

---

## Phase B — Postgres-backed auth (not started, needs credentials)

**Decision (26 Aug 2026): Supabase is used as Postgres storage only — not
its hosted Auth product.** No OAuth, no `supabase.auth.*` calls. Credentials
live in a plain `users` table on the same Postgres instance (reached via
Supabase's connection string), with password hashing and sessions handled
by the app itself. This resolves the open question below in favor of
"custom credentials table."

**Goal:** replace the mock provider with real accounts, without touching
any component above `lib/auth/index.ts`.

| Stage | Work |
|---|---|
| B.1 | Provision the Supabase project for its Postgres connection string only; add `DATABASE_URL` to `.env.local`. No Supabase Auth keys needed |
| B.2 | `npm install drizzle-orm pg bcrypt jose` (or equivalent) — ORM, password hashing, session token signing |
| B.3 | `users` table via Drizzle migration: `id, email, password_hash, name, plan, created_at` |
| B.4 | Server-side auth route handlers (`app/api/auth/*`) — hash on signup, verify on login, issue a signed session token in an httpOnly cookie |
| B.5 | `lib/auth/postgresProvider.ts` implementing the same `AuthProvider` interface — calls the route handlers above instead of localStorage |
| B.6 | Flip the export in `lib/auth/index.ts` from `mockProvider` to `postgresProvider` — this is the only edit outside the `lib/auth` folder |
| B.7 | Real Next.js `proxy.ts` (the `middleware.ts` convention was renamed in Next.js 16) reading the session cookie for route protection — replaces the client-side `AuthGuard` from Phase A, which was a stand-in for exactly this |
| B.8 | Delete `mockProvider.ts` and the `AuthGuard` component once B.7 is confirmed working |

**No email sending, deliberately.** No verification email on signup, no
password-reset email. Signup is trusted at face value — enter an email,
you're in. This means there's no forgotten-password recovery path yet;
that's a real gap, not an oversight, and needs an email provider decision
(Resend, Postmark, etc.) before it can be closed. Revisit once there's an
actual reason to (spam signups, a user locked out).

**Exit criteria:** same as Phase A's, but backed by real hashed-password
storage in Postgres, and a stranger's session actually can't be forged by
editing localStorage.

**Why middleware waits for Phase B:** Next.js middleware runs at the edge
and can't read `localStorage` — real route protection needs a cookie-based
session, which Stage B.4 issues. Building a throwaway cookie scheme for the
mock provider isn't worth it when Phase B replaces it outright.

---

## Where plan tiers plug in later

Nothing in Phase A or B builds billing. But because `AuthUser.plan` exists
from the start:

- The Settings → "Plan and billing" section (already built, currently a
  disabled "Manage" button) reads `authStore.user.plan` instead of a
  hardcoded "Pro" label once this lands.
- A future `upgradeToPror()` call is just `plan: "pro"` written back through
  the same `AuthProvider` interface — no new user-model migration.
- Team tier (PRD `MVP.md` parking lot) adds a `workspaceId` alongside
  `plan`, not a parallel identity system.

---

## Open questions (carried into Phase B)

1. ~~Supabase Auth vs. a custom credentials table~~ — decided: custom table,
   Supabase used for Postgres only (see Phase B above).
2. ~~Email verification~~ — decided: none for now, no email sending at all
   (see Phase B). Revisit if abuse or lockout becomes a real problem.
3. Rate limiting signup/login attempts — needed before this leaves mock
   data, not needed for the mock provider itself.
