export type ModelProvider =
  | "anthropic"
  | "openai"
  | "google"
  | "meta"
  | "deepseek"
  | "qwen"
  | "mistral"
  | "ollama"
  | "nvidia"
  | "minimax"
  /* Not a real provider — the Auto mode tile (Phase 2). */
  | "auto";

/** How the model is reached at runtime. Drives routing and cost accounting. */
export type ModelAccess =
  | "direct" // first-party API key (best rate limits, prompt caching)
  | "router" // via OpenRouter — one key, long tail, free tiers
  | "local"; // self-hosted (Ollama in Docker) — no usage cost

export type ModelTag = "Frontier" | "Fast" | "Free" | "Local";

export interface ModelMeta {
  id: string;
  name: string;
  provider: ModelProvider;
  access: ModelAccess;
  description: string;
  tag: ModelTag;
  tagColor: string;
  iconColor: string;
  /** Context window in thousands of tokens, for display. */
  contextK: number;
  /** True when the model costs nothing to run at Anvay's tier. */
  free?: boolean;
}

export interface ModelConfig {
  model: ModelMeta;
  temperature?: number;
  maxTokens?: number;
}
