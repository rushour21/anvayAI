"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { useChatStore } from "@/stores/chatStore";
import { MODELS } from "@/constants/models";

/* ── Attachment menu items ─────────────────────────────────────────── */
const ATTACH_OPTIONS = [
  { key: "web",   label: "Web search",     icon: "globe"    as const },
  { key: "deep",  label: "Deep research",  icon: "brain"    as const },
  { key: "pdf",   label: "Upload PDF",     icon: "upload"   as const },
  { key: "image", label: "Upload image",   icon: "image"    as const },
] as const;

export default function InputToolbar() {
  const [attachOpen, setAttachOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const attachRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);

  /* Close popups on outside click / escape */
  useEffect(() => {
    if (!attachOpen && !modelOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (attachOpen && attachRef.current && !attachRef.current.contains(e.target as Node))
        setAttachOpen(false);
      if (modelOpen && modelRef.current && !modelRef.current.contains(e.target as Node))
        setModelOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setAttachOpen(false); setModelOpen(false); }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [attachOpen, modelOpen]);

  return (
    <div className="flex items-center justify-between gap-2">
      {/* ── Left: + button with popup ──────────────────────────── */}
      <div ref={attachRef} className="relative">
        <button
          type="button"
          onClick={() => setAttachOpen((v) => !v)}
          aria-label="Attach or search"
          className="flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer"
          style={{
            width: 30,
            height: 30,
            background: attachOpen ? "var(--blue-50)" : "transparent",
            border: `1px solid ${attachOpen ? "var(--blue-200)" : "transparent"}`,
            color: attachOpen ? "var(--blue-600)" : "var(--ink-400)",
          }}
          onMouseEnter={(e) => {
            if (!attachOpen) e.currentTarget.style.background = "var(--paper-sunk)";
          }}
          onMouseLeave={(e) => {
            if (!attachOpen) e.currentTarget.style.background = "transparent";
          }}
        >
          <Icon name="plus" size={16} strokeWidth={2} />
        </button>

        {attachOpen && (
          <div
            className="absolute bottom-full mb-2 left-0 animate-slide-down"
            style={{ zIndex: 100 }}
          >
            <div
              className="p-1"
              style={{
                width: 200,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                boxShadow: "var(--shadow-tall)",
              }}
            >
              {ATTACH_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    /* TODO: wire each action */
                    setAttachOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors duration-100 cursor-pointer"
                  style={{ fontSize: 13, color: "var(--ink-700)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--hover-surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon name={opt.icon} size={15} style={{ color: "var(--ink-400)" }} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: compact model selector ──────────────────────── */}
      <div ref={modelRef} className="relative">
        <button
          type="button"
          onClick={() => setModelOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={modelOpen}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
          style={{
            background: modelOpen ? "var(--paper-sunk)" : "transparent",
            border: `1px solid ${modelOpen ? "var(--line)" : "transparent"}`,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--ink-500)",
          }}
          onMouseEnter={(e) => {
            if (!modelOpen) e.currentTarget.style.background = "var(--paper-sunk)";
          }}
          onMouseLeave={(e) => {
            if (!modelOpen) e.currentTarget.style.background = modelOpen ? "var(--paper-sunk)" : "transparent";
          }}
        >
          <span
            className="relative flex items-center justify-center shrink-0"
            style={{ width: 6, height: 6 }}
          >
            <span
              className="absolute rounded-full animate-model-pulse"
              style={{ width: 6, height: 6, background: selectedModel.iconColor ?? "#10A37F" }}
            />
            <span
              className="relative rounded-full"
              style={{ width: 5, height: 5, background: selectedModel.iconColor ?? "#10A37F" }}
            />
          </span>
          {selectedModel.name}
          <Icon
            name="chevronDown"
            size={11}
            strokeWidth={2}
            className="transition-transform duration-200"
            style={{
              color: "var(--ink-300)",
              transform: modelOpen ? "rotate(180deg)" : "none",
            }}
          />
        </button>

        {modelOpen && (
          <div
            className="absolute bottom-full mb-2 right-0 animate-slide-down"
            style={{ zIndex: 100 }}
          >
            <div
              className="p-1.5"
              style={{
                width: 260,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                boxShadow: "var(--shadow-tall)",
              }}
            >
              <p
                className="px-2.5 pt-1.5 pb-1 text-[10px] font-medium"
                style={{ color: "var(--ink-400)", letterSpacing: "0.04em" }}
              >
                MODEL
              </p>
              <div className="flex flex-col gap-0.5">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model);
                      setModelOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors duration-100 cursor-pointer"
                    style={{
                      fontSize: 13,
                      fontWeight: selectedModel.id === model.id ? 600 : 400,
                      color: selectedModel.id === model.id ? "var(--ink-900)" : "var(--ink-600)",
                      background: selectedModel.id === model.id ? "var(--hover-surface)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedModel.id !== model.id)
                        e.currentTarget.style.background = "var(--hover-surface)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedModel.id !== model.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      className="shrink-0 rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: model.iconColor ?? "var(--ink-300)",
                      }}
                    />
                    <span className="flex-1 truncate">{model.name}</span>
                    {selectedModel.id === model.id && (
                      <Icon name="check" size={14} style={{ color: "var(--blue-500)" }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
