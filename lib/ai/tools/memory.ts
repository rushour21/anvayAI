import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { rememberFact } from "@/lib/memory/user-memory";

/* Bound to the real userId server-side (never an LLM-supplied argument),
   same pattern as the document tools — the model can save a fact for the
   current user and no one else. Created per agent run in lib/ai/agent.ts. */
export function createMemoryTools(userId: string) {
  const rememberFactTool = tool({
    name: "remember_fact",
    description:
      "Saves one durable fact or preference about the user so it carries into future " +
      "conversations — the companies they follow, the currency or fiscal convention they " +
      "work in, how they want answers shaped. Input: { fact }. Use this only for things " +
      "that stay true beyond the current question: never for the question itself, a " +
      "one-off figure you just looked up, or anything the user asked you to forget. Write " +
      "the fact as one short self-contained sentence in the third person, e.g. \"Follows " +
      "NVIDIA and AMD closely\" or \"Prefers figures in INR crore\".",
    inputSchema: z.object({
      fact: z.string().describe("One short, self-contained, durable fact about the user"),
    }),
    execute: async ({ fact }) => {
      const trimmed = fact.trim();
      if (!trimmed) return { ok: false as const, error: "Nothing to remember." };
      try {
        await rememberFact(userId, trimmed);
        return { ok: true as const, remembered: trimmed };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Failed to save that.",
        };
      }
    },
  });

  return [rememberFactTool] as const;
}
