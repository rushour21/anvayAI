"use client";

import { useState } from "react";

interface InputToolButtonProps {
  label: string;
  emoji: string;
  defaultActive?: boolean;
}

export default function InputToolButton({ label, emoji, defaultActive = false }: InputToolButtonProps) {
  const [isActive, setIsActive] = useState(defaultActive);

  return (
    <button
      onClick={() => setIsActive(!isActive)}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer"
      style={{
        background: isActive ? "rgba(74,124,247,0.08)" : "rgba(255,255,255,0.3)",
        border: isActive ? "1px solid rgba(74,124,247,0.2)" : "1px solid rgba(255,255,255,0.5)",
        fontSize: 12,
        fontWeight: 500,
        color: isActive ? "var(--accent-blue)" : "var(--text-muted)",
        fontFamily: "var(--font-body)",
      }}
    >
      <span style={{ fontSize: 12 }}>{emoji}</span>
      {label}
    </button>
  );
}
