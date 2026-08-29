import { MODELS, AUTO_FAST_MODE, AUTO_COMPLEX_MODE, type ModelMode } from "./models";

/* AGENTS.md Phase 2 §4 — deterministic, cheap keyword check. No LLM call to
   decide which LLM to use. */
const COMPLEX_KEYWORDS = [
  "analyze",
  "compare",
  "calculate",
  "explain why",
  "evaluate",
  "forecast",
  "valuation",
];

function selectAutoMode(task: string): Exclude<ModelMode, "auto"> {
  const text = task.toLowerCase();
  const isComplex = COMPLEX_KEYWORDS.some((keyword) => text.includes(keyword));
  return isComplex ? AUTO_COMPLEX_MODE : AUTO_FAST_MODE;
}

/** Resolves a mode to the OpenRouter model id that should actually be called. */
export function selectModel(mode: ModelMode, task: string): string {
  const resolvedMode = mode === "auto" ? selectAutoMode(task) : mode;
  return MODELS[resolvedMode].model;
}
