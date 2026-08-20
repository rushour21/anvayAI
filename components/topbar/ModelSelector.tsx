"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import Icon from "@/components/ui/Icon";
import ModelDropdown from "./ModelDropdown";

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = useChatStore((s) => s.selectedModel);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-full cursor-pointer transition-all duration-150"
        style={{
          background: isOpen ? "var(--paper-sunk)" : "transparent",
          border: "1px solid var(--line)",
          fontSize: 13.5,
          fontWeight: 500,
          color: "var(--ink-800)",
        }}
      >
        <span
          className="relative flex items-center justify-center shrink-0"
          style={{ width: 8, height: 8 }}
        >
          <span
            className="absolute rounded-full animate-model-pulse"
            style={{ width: 8, height: 8, background: "#10A37F" }}
          />
          <span
            className="relative rounded-full"
            style={{ width: 6, height: 6, background: "#10A37F" }}
          />
        </span>
        {selectedModel.name}
        <Icon
          name="chevronDown"
          size={13}
          strokeWidth={2}
          className="transition-transform duration-200"
          style={{
            color: "var(--ink-400)",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 animate-slide-down"
          style={{ zIndex: 100 }}
        >
          <ModelDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
