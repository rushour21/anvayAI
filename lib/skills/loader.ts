import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SKILL_REGISTRY } from "./registry";

export function loadSkillContent(name: string): string | null {
  const entry = SKILL_REGISTRY.find((s) => s.name === name);
  if (!entry) return null;
  try {
    return readFileSync(join(process.cwd(), entry.path), "utf-8");
  } catch {
    return null;
  }
}
