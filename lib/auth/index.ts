import { postgresProvider } from "./postgresProvider";
import type { AuthProvider } from "./types";

/* The one place that decides which provider is live (docs/AUTH-PLAN.md).
   Nothing above this file should ever import mockProvider or
   postgresProvider directly. */
export const authProvider: AuthProvider = postgresProvider;

export type { AuthProvider, AuthUser, PlanTier, SignInInput, SignUpInput } from "./types";
