/* Shared result shape for every deterministic calculation function
   (AGENTS.md Phase 4 §4.4) — the LLM explains these, it never computes them. */
export type CalcResult =
  | {
      ok: true;
      metric: string;
      inputs: Record<string, number>;
      result: number;
      unit: "percent" | "ratio";
      formula: string;
    }
  | { ok: false; error: string };

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
