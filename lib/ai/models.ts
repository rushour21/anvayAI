/* Mode → OpenRouter model id map (AGENTS.md Phase 2 §2). The frontend only
   ever knows a mode string (constants/models.ts, stores/chatStore.ts) — this
   file is the one place that maps a mode to a real OpenRouter id. Ids
   verified against https://openrouter.ai/api/v1/models when this was written. */

export type ModelMode = "auto" | "openai" | "gemma" | "nemotron" | "minimax";

export const MODEL_MODES: ModelMode[] = ["auto", "openai", "gemma", "nemotron", "minimax"];

export const MODELS: Record<Exclude<ModelMode, "auto">, { model: string; label: string }> = {
  openai: { model: "openai/gpt-4o-mini", label: "OpenAI" },
  gemma: { model: "google/gemma-4-26b-a4b-it:free", label: "Gemma" },
  nemotron: { model: "nvidia/nemotron-3.5-lightning:free", label: "Nemotron" },
  minimax: { model: "minimax/minimax-m3:free", label: "MiniMax" },
};

/* Auto's deterministic, keyword-based pick (AGENTS.md §4) — not another LLM
   call. Simple questions get the free/fast model; complex ones escalate.
   Using nemotron here since free-tier model availability on OpenRouter's
   shared pool rotates — gemma was rate-limited upstream when this was set. */
export const AUTO_FAST_MODE: Exclude<ModelMode, "auto"> = "nemotron";
export const AUTO_COMPLEX_MODE: Exclude<ModelMode, "auto"> = "openai";

/* Every mode falls back to this if its own model errors or hangs — free-tier
   models (gemma/nemotron/minimax) share OpenRouter's unmetered pool and can
   be rate-limited or slow at any time; OpenAI is the one paid, reliable model. */
export const FALLBACK_MODEL = MODELS.openai.model;

export function isModelMode(value: unknown): value is ModelMode {
  return typeof value === "string" && (MODEL_MODES as string[]).includes(value);
}
