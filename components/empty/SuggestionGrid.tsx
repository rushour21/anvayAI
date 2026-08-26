"use client";

import SuggestionCard from "./SuggestionCard";
import type { IconName } from "@/components/ui/Icon";

const SUGGESTIONS: { label: string; icon: IconName; prompt: string }[] = [
  {
    label: "Research",
    icon: "globe",
    prompt: "What's driving NVIDIA's revenue growth this year?",
  },
  {
    label: "Compare",
    icon: "layers",
    prompt: "Compare NVIDIA and AMD on margins and R&D spend",
  },
  {
    label: "Investigate",
    icon: "search",
    prompt: "Why did Apple's operating margin decline last quarter?",
  },
  {
    label: "Filing",
    icon: "document",
    prompt: "What are the biggest risks in Microsoft's latest 10-K?",
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
