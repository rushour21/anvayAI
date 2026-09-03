import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";

/* The project's thesis and open questions.

   Research into analyst workflow keeps landing on the same point: the thing
   an analyst carries between quarters isn't a file, it's a view — "Overweight,
   PT $180, the debate is CoWoS capacity" — plus a list of things still to
   verify. Intra-quarter thesis validation is a named workflow, and it only
   works if the prior view was written down. These tools capture it as the
   analyst states it in conversation, instead of asking them to maintain it by
   hand somewhere else.

   Bound server-side to the real projectId, never LLM-supplied. */
export function createProjectTools(projectId: string | null) {
  const updateThesisTool = tool({
    name: "update_thesis",
    description:
      "Records the analyst's current view on this project — rating, price target, the key " +
      "debate, what would change their mind. Call this ONLY when the user states or revises " +
      "a view of their own (\"I think this is overweight\", \"moving my PT to $164\", " +
      "\"my thesis is...\"). Never call it to store your own analysis, and never for a " +
      "one-off figure.",
    inputSchema: z.object({
      thesis: z
        .string()
        .describe("The analyst's view, in their terms. Replaces the previous thesis entirely."),
    }),
    execute: async ({ thesis }) => {
      if (!projectId) {
        return {
          ok: false as const,
          error:
            "This conversation isn't in a project, so there's nothing to attach a thesis to. " +
            "Tell the user they can create a project to keep a running view.",
        };
      }
      try {
        await db
          .update(projects)
          .set({ thesis: thesis.trim().slice(0, 2000), updatedAt: new Date() })
          .where(eq(projects.id, projectId));
        return { ok: true as const, message: "Thesis updated on the project." };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Failed to update thesis.",
        };
      }
    },
  });

  const addOpenQuestionTool = tool({
    name: "add_open_question",
    description:
      "Adds a 'check this later' item to the project — something raised in conversation " +
      "that couldn't be resolved now and should be verified when the next filing lands. " +
      "Call it when the user says they need to verify something, or when a tool couldn't " +
      "answer a question that clearly matters to their view.",
    inputSchema: z.object({
      question: z.string().describe("One specific, checkable item."),
    }),
    execute: async ({ question }) => {
      if (!projectId) {
        return {
          ok: false as const,
          error: "This conversation isn't in a project, so there's nowhere to keep the question.",
        };
      }
      try {
        const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
        if (!project) return { ok: false as const, error: "Project not found." };

        const cleaned = question.trim().slice(0, 300);
        if (project.openQuestions.includes(cleaned)) {
          return { ok: true as const, message: "That question is already on the list." };
        }
        await db
          .update(projects)
          .set({
            // Capped so a chatty run can't grow the list without bound.
            openQuestions: [...project.openQuestions, cleaned].slice(-50),
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
        return { ok: true as const, message: "Added to the project's open questions." };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Failed to add the question.",
        };
      }
    },
  });

  return [updateThesisTool, addOpenQuestionTool] as const;
}
