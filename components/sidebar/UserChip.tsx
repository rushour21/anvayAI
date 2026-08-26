"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/initials";

export default function UserChip() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl transition-colors duration-150 cursor-pointer text-left"
        style={{ background: isOpen ? "var(--hover-surface)" : "transparent" }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = "var(--hover-surface)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
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
          {getInitials(user.name)}
        </span>
        <span className="flex flex-col min-w-0 flex-1">
          <span
            className="truncate text-[13px] font-medium"
            style={{ color: "var(--ink-900)" }}
          >
            {user.name}
          </span>
          <span className="text-[11px]" style={{ color: "var(--ink-400)" }}>
            {user.plan === "pro" ? "Pro plan" : "Free plan"}
          </span>
        </span>
        <Icon name="dots" size={16} style={{ color: "var(--ink-300)" }} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 animate-slide-down"
          style={{ zIndex: 100 }}
        >
          <UserMenu onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
