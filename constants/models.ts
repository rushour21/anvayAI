import { ModelMeta, ModelProvider } from "@/types/llm";

/* `id` here is a MODE string ("auto" | "openai" | "gemma" | "nemotron" |
   "minimax"), not a raw OpenRouter model id — the frontend never learns the
   real model id (AGENTS.md Phase 2 §1). The mode→model mapping lives in
   lib/ai/models.ts, the one place both sides agree on. */

const TAG_COLOR = {
  Frontier: "#4F46E5",
  Fast: "#0E9AA7",
  Free: "#10A37F",
  Local: "#8B5CF0",
} as const;

const BRAND = {
  auto: "#4F46E5",
  openai: "#10A37F",
  google: "#3B6EF5",
  nvidia: "#76B900",
  minimax: "#F5544D",
} as const;

export const MODELS: ModelMeta[] = [
  {
    id: "auto",
    name: "Auto",
    provider: "auto",
    access: "router",
    description: "Picks a fast free model for simple questions, OpenAI for complex ones.",
    tag: "Fast",
    tagColor: TAG_COLOR.Fast,
    iconColor: BRAND.auto,
    contextK: 128,
  },
  {
    id: "openai",
    name: "OpenAI",
    provider: "openai",
    access: "router",
    description: "Strong all-rounder. Good default for complex questions.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.openai,
    contextK: 128,
  },
  {
    id: "gemma",
    name: "Gemma",
    provider: "google",
    access: "router",
    description: "Google's free model. Fast and free to use.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.google,
    contextK: 128,
    free: true,
  },
  {
    id: "nemotron",
    name: "Nemotron",
    provider: "nvidia",
    access: "router",
    description: "NVIDIA's free model. Fast and free to use.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.nvidia,
    contextK: 128,
    free: true,
  },
  {
    id: "minimax",
    name: "MiniMax",
    provider: "minimax",
    access: "router",
    description: "MiniMax's free model. Fast and free to use.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.minimax,
    contextK: 128,
    free: true,
  },
];

export const DEFAULT_MODEL = MODELS[0];

export const PROVIDER_LABEL: Record<ModelProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  meta: "Meta",
  deepseek: "DeepSeek",
  qwen: "Alibaba",
  mistral: "Mistral",
  ollama: "Ollama",
  nvidia: "NVIDIA",
  minimax: "MiniMax",
  auto: "Auto",
};

export const FREE_MODELS = MODELS.filter((m) => m.free);
