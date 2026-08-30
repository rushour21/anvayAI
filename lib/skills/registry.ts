export interface SkillMeta {
  name: string;
  description: string;
  path: string;
}

/* Lightweight metadata only (AGENTS.md Phase 5 §5.4) — the agent sees just
   name+description via list_skills, and only pulls the full SKILL.md via
   load_skill for the one it actually needs, so most requests never load
   any skill content into context. */
export const SKILL_REGISTRY: SkillMeta[] = [
  {
    name: "financial-analysis",
    description: "General company financial analysis — revenue, profitability, and financial health trends over time.",
    path: "skills/financial-analysis/SKILL.md",
  },
  {
    name: "equity-research",
    description: "Broad equity research combining company fundamentals, market data, valuation, and recent news into one investor-facing rundown.",
    path: "skills/equity-research/SKILL.md",
  },
  {
    name: "valuation-analysis",
    description: "Analyze a company's current valuation using standard multiples (P/E, P/B, EV/EBITDA), optionally against its own history.",
    path: "skills/valuation-analysis/SKILL.md",
  },
  {
    name: "earnings-analysis",
    description: "Analyze a company's reported earnings for a period — revenue/profit results, period-over-period change, and market reaction.",
    path: "skills/earnings-analysis/SKILL.md",
  },
];
