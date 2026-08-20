"use client";

import Icon from "@/components/ui/Icon";

export default function UserChip() {
  return (
    <button
      className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors duration-150 cursor-pointer text-left"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hover-surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        className="shrink-0 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(140deg, var(--blue-400) 0%, var(--blue-600) 100%)",
        }}
      >
        RI
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span
          className="truncate text-[13px] font-medium"
          style={{ color: "var(--ink-900)" }}
        >
          Rushabh Ingle
        </span>
        <span className="text-[11px]" style={{ color: "var(--ink-400)" }}>
          Pro plan
        </span>
      </span>
      <Icon name="dots" size={16} style={{ color: "var(--ink-300)" }} />
    </button>
  );
}
