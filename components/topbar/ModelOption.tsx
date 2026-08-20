"use client";

import { ModelMeta } from "@/types/llm";
import { PROVIDER_LABEL } from "@/constants/models";
import Icon from "@/components/ui/Icon";

interface ModelOptionProps {
  model: ModelMeta;
  isSelected: boolean;
  onClick: () => void;
}

export default function ModelOption({ model, isSelected, onClick }: ModelOptionProps) {
  return (
    <button
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors duration-150 cursor-pointer text-left"
      style={{ background: isSelected ? "var(--blue-50)" : "transparent" }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.background = "var(--paper-sunk)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isSelected ? "var(--blue-50)" : "transparent";
      }}
    >
      <span
        className="shrink-0 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold"
        style={{
          width: 32,
          height: 32,
          background: `color-mix(in srgb, ${model.iconColor} 14%, transparent)`,
          color: model.iconColor,
        }}
      >
        {PROVIDER_LABEL[model.provider]?.[0] ?? model.provider[0].toUpperCase()}
      </span>

      <span className="flex flex-col min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className="truncate text-[13.5px] font-medium"
            style={{ color: "var(--ink-900)" }}
          >
            {model.name}
          </span>
          <span
            className="shrink-0 px-1.5 py-px rounded text-[9.5px] font-semibold uppercase tracking-wide"
            style={{
              color: model.tagColor,
              background: `color-mix(in srgb, ${model.tagColor} 13%, transparent)`,
            }}
          >
            {model.tag}
          </span>
        </span>
        <span className="truncate text-[11.5px]" style={{ color: "var(--ink-400)" }}>
          {model.description}
        </span>
      </span>

      {isSelected && (
        <Icon
          name="check"
          size={15}
          strokeWidth={2.4}
          className="shrink-0"
          style={{ color: "var(--blue-600)" }}
        />
      )}
    </button>
  );
}
