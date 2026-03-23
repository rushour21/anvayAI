"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import ModelDropdown from "./ModelDropdown";

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer transition-all duration-200 hover:shadow-md border border-divider-grey"
        style={{
          background: "var(--surface-pure)",
          boxShadow: "var(--shadow-soft)",
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--text-primary)",
        }}
      >
        {/* Pulsing green dot */}
        <span className="relative flex items-center justify-center" style={{ width: 10, height: 10 }}>
          <span
            className="absolute rounded-full animate-model-pulse"
            style={{ width: 10, height: 10, background: "#10B981", opacity: 0.3 }}
          />
          <span className="relative rounded-full" style={{ width: 6, height: 6, background: "#10B981" }} />
        </span>
        <span className="opacity-90">{selectedModel.name}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-slate)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 animate-slide-down" style={{ zIndex: 100 }}>
          <ModelDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
