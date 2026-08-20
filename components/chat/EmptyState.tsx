"use client";

import HeroTitle from "@/components/empty/HeroTitle";
import AgentPills from "@/components/empty/AgentPills";
import SuggestionGrid from "@/components/empty/SuggestionGrid";

export default function EmptyState() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
        <HeroTitle />
        <div className="mt-8 animate-fade-up delay-1">
          <AgentPills />
        </div>
        <div className="mt-8 w-full animate-fade-up delay-2" style={{ maxWidth: 620 }}>
          <SuggestionGrid />
        </div>
      </div>
    </div>
  );
}
