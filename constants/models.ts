import { ModelMeta, ModelProvider } from "@/types/llm";

/* Model IDs here are catalogue/display data. Verify each against the
   provider's current docs when the Model Gateway is wired (Phase 3). */

const TAG_COLOR = {
  Frontier: "#4F46E5",
  Fast: "#0E9AA7",
  Free: "#10A37F",
  Local: "#8B5CF0",
} as const;

const BRAND = {
  anthropic: "#D97757",
  openai: "#10A37F",
  google: "#3B6EF5",
  meta: "#6D7FF0",
  deepseek: "#4D6BFE",
  qwen: "#7C4DFF",
  mistral: "#F2760D",
  ollama: "#5A616E",
} as const;

export const MODELS: ModelMeta[] = [
  /* ── Anthropic ─────────────────────────────────────────── */
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    provider: "anthropic",
    access: "direct",
    description: "Deepest reasoning. Best for long research and hard synthesis.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.anthropic,
    contextK: 200,
  },
  {
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "anthropic",
    access: "direct",
    description: "Balanced speed and intelligence — the everyday default.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.anthropic,
    contextK: 200,
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    access: "direct",
    description: "Cheap and quick. Anvay routes validation and triage here.",
    tag: "Fast",
    tagColor: TAG_COLOR.Fast,
    iconColor: BRAND.anthropic,
    contextK: 200,
  },

  /* ── OpenAI ────────────────────────────────────────────── */
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    access: "direct",
    description: "Strong multimodal generalist with wide tool support.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.openai,
    contextK: 128,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    access: "direct",
    description: "Low-latency workhorse for extraction and reranking.",
    tag: "Fast",
    tagColor: TAG_COLOR.Fast,
    iconColor: BRAND.openai,
    contextK: 128,
  },

  /* ── Google ────────────────────────────────────────────── */
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    access: "direct",
    description: "Huge context window. Best choice for whole-document reasoning.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.google,
    contextK: 1000,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    access: "direct",
    description: "Long context at low latency, with a generous free tier.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.google,
    contextK: 1000,
    free: true,
  },

  /* ── Open weights, free at Anvay's tier ────────────────── */
  {
    id: "meta-llama/llama-4-scout:free",
    name: "Llama 4 Scout",
    provider: "meta",
    access: "router",
    description: "Open weights, long context, no usage cost.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.meta,
    contextK: 512,
    free: true,
  },
  {
    id: "deepseek/deepseek-chat:free",
    name: "DeepSeek V3",
    provider: "deepseek",
    access: "router",
    description: "Very strong at maths and code for an open model.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.deepseek,
    contextK: 128,
    free: true,
  },
  {
    id: "qwen/qwen3-32b:free",
    name: "Qwen3 32B",
    provider: "qwen",
    access: "router",
    description: "Broad multilingual coverage. Good default for non-English.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.qwen,
    contextK: 128,
    free: true,
  },
  {
    id: "mistralai/mistral-small:free",
    name: "Mistral Small",
    provider: "mistral",
    access: "router",
    description: "Lightweight European model with permissive licensing.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.mistral,
    contextK: 128,
    free: true,
  },

  /* ── Self-hosted ───────────────────────────────────────── */
  {
    id: "llama3.1:8b",
    name: "Llama 3.1 8B",
    provider: "ollama",
    access: "local",
    description: "Runs in your own Ollama container. Private and free.",
    tag: "Local",
    tagColor: TAG_COLOR.Local,
    iconColor: BRAND.ollama,
    contextK: 128,
    free: true,
  },
];

export const DEFAULT_MODEL =
  MODELS.find((m) => m.id === "claude-sonnet-5") ?? MODELS[0];

export const PROVIDER_LABEL: Record<ModelProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  meta: "Meta",
  deepseek: "DeepSeek",
  qwen: "Alibaba",
  mistral: "Mistral",
  ollama: "Ollama",
};

export const FREE_MODELS = MODELS.filter((m) => m.free);
