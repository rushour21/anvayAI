import { ModelMeta, ModelProvider } from "@/types/llm";

/* Model IDs here are catalogue/display data. Verify each against the
   provider's current docs when the Model Gateway is wired (Phase 2). */

const TAG_COLOR = {
  Frontier: "#4F46E5",
  Fast: "#0E9AA7",
  Free: "#10A37F",
  Local: "#8B5CF0",
} as const;

const BRAND = {
  openai: "#10A37F",
  google: "#3B6EF5",
  deepseek: "#4D6BFE",
  meta: "#6D7FF0",
} as const;

export const MODELS: ModelMeta[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    access: "direct",
    description: "Strong all-rounder. Good default for most questions.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.openai,
    contextK: 128,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    access: "direct",
    description: "Handles very long documents without slowing down.",
    tag: "Fast",
    tagColor: TAG_COLOR.Fast,
    iconColor: BRAND.google,
    contextK: 1000,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "deepseek",
    access: "router",
    description: "Especially sharp on maths, code, and step-by-step logic.",
    tag: "Frontier",
    tagColor: TAG_COLOR.Frontier,
    iconColor: BRAND.deepseek,
    contextK: 128,
  },
  {
    id: "meta-llama/llama-4-scout:free",
    name: "Llama 4 Scout",
    provider: "meta",
    access: "router",
    description: "Open weights, long context, and free to use.",
    tag: "Free",
    tagColor: TAG_COLOR.Free,
    iconColor: BRAND.meta,
    contextK: 512,
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
};

export const FREE_MODELS = MODELS.filter((m) => m.free);
