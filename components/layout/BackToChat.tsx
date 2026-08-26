"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function BackToChat() {
  return (
    <Link
      href="/chat/new"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-150"
      style={{ color: "var(--ink-500)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-900)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-500)")}
    >
      <Icon name="arrowRight" size={14} style={{ transform: "rotate(180deg)" }} />
      Back to chat
    </Link>
  );
}
