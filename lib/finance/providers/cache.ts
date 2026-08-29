/* Tiny in-memory TTL cache shared by the FMP-backed providers — avoids
   duplicate external calls when several tools in the same agent run ask
   about the same symbol (AGENTS.md Phase 4 "Performance" section). Not
   persisted, not shared across server instances; that's fine for this
   purpose since it only needs to survive a single request's lifetime. */

const store = new Map<string, { value: unknown; expiresAt: number }>();

export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;
  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}
