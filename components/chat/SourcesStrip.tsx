"use client";

import { Source } from "@/types/chat";
import SourceChip from "./SourceChip";

export default function SourcesStrip({ sources }: { sources: Source[] }) {
  return (
    <div>
      <p
        className="text-[11px] font-medium mb-1.5"
        style={{ color: "var(--ink-400)", letterSpacing: "0.04em" }}
      >
        {sources.length} sources
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, i) => (
          <SourceChip key={source.id} source={source} index={i} />
        ))}
      </div>
    </div>
  );
}
