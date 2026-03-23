import { ModelMeta } from "@/types/llm";

export const MODELS: ModelMeta[] = [
  {
    id: "claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast & efficient for everyday tasks",
    tag: "Fast",
    tagColor: "#10B981",
    iconColor: "#D97706",
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Balanced performance and intelligence",
    tag: "Smart",
    tagColor: "#8B5CF6",
    iconColor: "#D97706",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "OpenAI's flagship multimodal model",
    tag: "Smart",
    tagColor: "#8B5CF6",
    iconColor: "#10B981",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description: "Google's fastest reasoning model",
    tag: "Fast",
    tagColor: "#10B981",
    iconColor: "#4A7CF7",
  },
  {
    id: "llama-4-scout",
    name: "Llama 4 Scout",
    provider: "meta",
    description: "Open-source model by Meta",
    tag: "Free",
    tagColor: "#F59E0B",
    iconColor: "#4A7CF7",
  },
];

export const DEFAULT_MODEL = MODELS[0];
