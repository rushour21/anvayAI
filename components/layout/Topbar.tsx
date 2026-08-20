"use client";

import ModelSelector from "@/components/topbar/ModelSelector";
import TopbarActions from "@/components/topbar/TopbarActions";
import Wordmark from "@/components/ui/Wordmark";

export default function Topbar() {
  return (
    <header
      className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6"
      style={{
        height: 62,
        background: "var(--surface)",
        borderBottom: "1px solid var(--line)",
        zIndex: 20,
      }}
    >
      {/* Wordmark stands in for the sidebar below the lg breakpoint */}
      <div className="flex-1 flex items-center">
        <span className="lg:hidden">
          <Wordmark size={19} />
        </span>
      </div>

      <ModelSelector />

      <div className="flex-1 flex justify-end">
        <TopbarActions />
      </div>
    </header>
  );
}
