/* The shape every part of the app renders against. `plan` exists from day
   one so billing tiers (docs/PRD.md §9 — free/pro/team/enterprise) are a
   value change later, not a schema migration. */

export type PlanTier = "free" | "pro";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  createdAt: number;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

/* One interface, swapped behind lib/auth/index.ts — see docs/AUTH-PLAN.md.
   mockProvider implements this today; supabaseProvider implements it in
   Phase B with identical signatures. */
export interface AuthProvider {
  signUp(input: SignUpInput): Promise<AuthUser>;
  signIn(input: SignInInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthUser | null>;
}
