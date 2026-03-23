export type ModelProvider = "anthropic" | "openai" | "google" | "meta";

export interface ModelMeta {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  tag: "Fast" | "Smart" | "Free";
  tagColor: string;
  iconColor: string;
}

export interface ModelConfig {
  model: ModelMeta;
  temperature?: number;
  maxTokens?: number;
}
