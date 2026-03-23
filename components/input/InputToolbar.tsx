"use client";

import InputToolButton from "./InputToolButton";

const TOOLS = [
  { id: "search", label: "Search", emoji: "🔍", defaultActive: true },
  { id: "upload", label: "Upload", emoji: "📎", defaultActive: false },
  { id: "code", label: "Code", emoji: "💻", defaultActive: false },
  { id: "focus", label: "Focus", emoji: "🎯", defaultActive: false },
];

export default function InputToolbar() {
  return (
    <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.4)" }}>
      <div className="flex items-center gap-1.5">
        {TOOLS.map((t) => (
          <InputToolButton key={t.id} label={t.label} emoji={t.emoji} defaultActive={t.defaultActive} />
        ))}
      </div>
      <span
        style={{
          fontSize: 11,
          color: "var(--text-placeholder)",
          fontFamily: "var(--font-body)",
        }}
      >
        ⌘↵ to send
      </span>
    </div>
  );
}
