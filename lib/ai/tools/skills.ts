import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { SKILL_REGISTRY } from "@/lib/skills/registry";
import { loadSkillContent } from "@/lib/skills/loader";

export const listSkillsTool = tool({
  name: "list_skills",
  description:
    "Lists the named research workflows (skills) this agent knows, each with a short " +
    "description of when to use it. Call this if you're unsure which named workflow (if " +
    "any) fits the user's request. Returns { name, description } for each.",
  inputSchema: z.object({}),
  execute: async () => ({
    ok: true as const,
    skills: SKILL_REGISTRY.map(({ name, description }) => ({ name, description })),
  }),
});

const loadSkillInputSchema = z.object({
  name: z.string().describe("The skill name, from list_skills — e.g. 'valuation-analysis'"),
});

export const loadSkillTool = tool({
  name: "load_skill",
  description:
    "Loads the full step-by-step instructions for a named research workflow (skill) — " +
    "which tools to use, what to calculate, what evidence/citations are required, and how " +
    "to structure the final answer. Call this once you've identified the user's request " +
    "matches a known skill (e.g. 'valuation-analysis' for a valuation question), before " +
    "using the tools it recommends. Input: { name }.",
  inputSchema: loadSkillInputSchema,
  execute: async ({ name }) => {
    const content = loadSkillContent(name);
    if (!content) {
      return { ok: false as const, error: `No skill named "${name}". Call list_skills to see available skills.` };
    }
    return { ok: true as const, name, content };
  },
});
