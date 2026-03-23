"use client";

import SuggestionCard from "./SuggestionCard";

const SUGGESTIONS = [
  {
    label: "Research",
    description: "What are the latest breakthroughs in quantum computing?",
  },
  {
    label: "Compare",
    description: "Compare PostgreSQL vs MongoDB for real-time apps",
  },
  {
    label: "Explain",
    description: "How does transformer attention mechanism work?",
  },
  {
    label: "Build",
    description: "Design a microservices architecture for e-commerce",
  },
];

export default function SuggestionGrid() {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
    >
      {SUGGESTIONS.map((s) => (
        <SuggestionCard key={s.label} label={s.label} description={s.description} />
      ))}
    </div>
  );
}
