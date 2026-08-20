"use client";

import { useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";

export default function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (insecure context) — leave the label alone */
    }
  };

  const actions: { label: string; icon: IconName; onClick?: () => void }[] = [
    { label: copied ? "Copied" : "Copy", icon: copied ? "check" : "copy", onClick: copy },
    { label: "Retry", icon: "refresh" },
    { label: "Share", icon: "share" },
  ];

  return (
    <div className="flex items-center gap-0.5">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          title={a.label}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors duration-150 cursor-pointer"
          style={{ background: "transparent", color: "var(--ink-400)", fontSize: 11.5 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--paper-sunk)";
            e.currentTarget.style.color = "var(--ink-700)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--ink-400)";
          }}
        >
          <Icon name={a.icon} size={13} />
          {a.label}
        </button>
      ))}
    </div>
  );
}
