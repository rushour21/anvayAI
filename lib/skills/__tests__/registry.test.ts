import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { SKILL_REGISTRY } from "../registry";
import { loadSkillContent } from "../loader";

describe("skill registry", () => {
  it("every registered skill file exists on disk", () => {
    for (const skill of SKILL_REGISTRY) {
      expect(existsSync(join(process.cwd(), skill.path))).toBe(true);
    }
  });

  it("loadSkillContent returns non-empty markdown containing the required sections for each registered skill", () => {
    for (const skill of SKILL_REGISTRY) {
      const content = loadSkillContent(skill.name);
      expect(content).not.toBeNull();
      expect(content).toContain("## Purpose");
      expect(content).toContain("## Relevant tools");
      expect(content).toContain("## Limitations");
    }
  });

  it("loadSkillContent returns null for an unknown skill", () => {
    expect(loadSkillContent("not-a-real-skill")).toBeNull();
  });
});
