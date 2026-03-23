"use client";

import HeroTitle from "@/components/empty/HeroTitle";
import AgentPills from "@/components/empty/AgentPills";
import SuggestionGrid from "@/components/empty/SuggestionGrid";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 animate-fade-up">
      <HeroTitle />
      <div className="mt-10">
        <AgentPills />
      </div>
      <div className="mt-10 w-full" style={{ maxWidth: 560 }}>
        <SuggestionGrid />
      </div>
    </div>
  );
}
