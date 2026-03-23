"use client";

import { Source } from "@/types/chat";
import SourceChip from "./SourceChip";

interface SourcesStripProps {
  sources: Source[];
}

export default function SourcesStrip({ sources }: SourcesStripProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => (
        <SourceChip key={source.id} source={source} />
      ))}
    </div>
  );
}
