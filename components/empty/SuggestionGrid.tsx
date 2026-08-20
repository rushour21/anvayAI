"use client";

import SuggestionCard from "./SuggestionCard";
import type { IconName } from "@/components/ui/Icon";

const SUGGESTIONS: { label: string; icon: IconName; prompt: string }[] = [
  {
    label: "Research",
    icon: "globe",
    prompt: "What changed in long-context retrieval methods this year?",
  },
  {
    label: "Compare",
    icon: "layers",
    prompt: "Postgres vs. ClickHouse for event analytics at 10B rows",
  },
  {
    label: "Explain",
    icon: "brain",
    prompt: "Explain how speculative decoding actually speeds up inference",
  },
  {
    label: "Build",
    icon: "code",
    prompt: "Design a rate limiter that survives a multi-region failover",
  },
];

export default function SuggestionGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {SUGGESTIONS.map((s) => (
        <SuggestionCard key={s.label} {...s} />
      ))}
    </div>
  );
}
