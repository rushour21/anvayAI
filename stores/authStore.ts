"use client";

import { create } from "zustand";
import { authProvider, type AuthUser } from "@/lib/auth";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;

  /** Reads any existing session once, on app start. */
  hydrate: () => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  hydrate: async () => {
    set({ status: "loading" });
    const user = await authProvider.getSession();
    set({ user, status: user ? "authenticated" : "unauthenticated" });
  },

  signUp: async (input) => {
    set({ status: "loading", error: null });
    try {
      const user = await authProvider.signUp(input);
      set({ user, status: "authenticated" });
    } catch (e) {
      set({ status: "unauthenticated", error: e instanceof Error ? e.message : "Sign up failed." });
      throw e;
    }
  },

  signIn: async (input) => {
    set({ status: "loading", error: null });
    try {
      const user = await authProvider.signIn(input);
      set({ user, status: "authenticated" });
    } catch (e) {
      set({ status: "unauthenticated", error: e instanceof Error ? e.message : "Sign in failed." });
      throw e;
    }
  },

  signOut: async () => {
    await authProvider.signOut();
    set({ user: null, status: "unauthenticated", error: null });
  },

  clearError: () => set({ error: null }),
}));
