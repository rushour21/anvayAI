"use client";

import { ModelMeta } from "@/types/llm";

interface ModelOptionProps {
  model: ModelMeta;
  isSelected: boolean;
  onClick: () => void;
}

export default function ModelOption({ model, isSelected, onClick }: ModelOptionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer mb-0.5"
      style={{
        background: isSelected ? "rgba(26, 31, 60, 0.05)" : "transparent",
        fontFamily: "var(--font-body)",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "rgba(0,0,0,0.025)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected ? "rgba(26, 31, 60, 0.05)" : "transparent";
      }}
    >
      {/* Provider icon square */}
      <div
        className="flex-shrink-0 rounded-lg flex items-center justify-center"
        style={{
          width: 36,
          height: 36,
          background: isSelected ? "var(--primary-indigo)" : `${model.iconColor}15`,
          color: isSelected ? "white" : model.iconColor,
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}
      >
        {model.provider[0].toUpperCase()}
      </div>
      <div className="flex flex-col items-start min-w-0 flex-1">
        <span
          className="truncate"
          style={{ 
            fontSize: 13.5, 
            fontWeight: 600, 
            color: isSelected ? "var(--primary-indigo)" : "var(--text-primary)" 
          }}
        >
          {model.name}
        </span>
        <span
          className="truncate"
          style={{ fontSize: 11.5, color: "var(--text-slate)", opacity: 0.7 }}
        >
          {model.description}
        </span>
      </div>
      {/* Tag */}
      {model.tag && (
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-md"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.4px",
            textTransform: "uppercase",
            color: model.tagColor,
            background: `${model.tagColor}15`,
            fontFamily: "var(--font-body)",
          }}
        >
          {model.tag}
        </span>
      )}
    </button>
  );
}
