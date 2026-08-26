import type { AuthProvider, AuthUser, SignInInput, SignUpInput } from "./types";

/* Phase A stand-in (docs/AUTH-PLAN.md) — localStorage, no network, no real
   security. It exists so the rest of the app has a real user object to
   render against before Supabase credentials exist. Every account created
   here is disposable: Phase B replaces the storage, not the interface, so
   nothing carries over. Never store a password like this against a real
   backend. */

const USERS_KEY = "anvay-auth-users";
const SESSION_KEY = "anvay-auth-session";
const LATENCY_MS = 400;

interface StoredUser extends AuthUser {
  password: string;
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* private mode — the account just won't survive a reload */
  }
}

function toPublicUser(u: StoredUser): AuthUser {
  return { id: u.id, email: u.email, name: u.name, plan: u.plan, createdAt: u.createdAt };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const mockProvider: AuthProvider = {
  async signUp({ name, email, password }: SignUpInput) {
    if (!name.trim()) throw new Error("Enter your name.");
    if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");

    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }

    const user: StoredUser = {
      id: crypto.randomUUID(),
      email,
      name: name.trim(),
      password,
      plan: "free",
      createdAt: Date.now(),
    };
    writeUsers([...users, user]);
    try {
      localStorage.setItem(SESSION_KEY, user.id);
    } catch {
      /* private mode — session won't survive a reload, sign-up still succeeds */
    }

    return delay(toPublicUser(user));
  },

  async signIn({ email, password }: SignInInput) {
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      throw new Error("Incorrect email or password.");
    }

    try {
      localStorage.setItem(SESSION_KEY, user.id);
    } catch {
      /* private mode */
    }

    return delay(toPublicUser(user));
  },

  async signOut() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* private mode — nothing to clear */
    }
    return delay(undefined);
  },

  async getSession() {
    if (typeof window === "undefined") return null;
    let sessionId: string | null = null;
    try {
      sessionId = localStorage.getItem(SESSION_KEY);
    } catch {
      return null;
    }
    if (!sessionId) return null;

    const user = readUsers().find((u) => u.id === sessionId);
    return user ? toPublicUser(user) : null;
  },
};
