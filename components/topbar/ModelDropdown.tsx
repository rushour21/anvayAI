"use client";

import { MODELS } from "@/constants/models";
import { useChatStore } from "@/stores/chatStore";
import ModelOption from "./ModelOption";

export default function ModelDropdown({ onClose }: { onClose: () => void }) {
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);

  return (
    <div
      role="listbox"
      aria-label="Select model"
      className="p-1.5"
      style={{
        width: 336,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        boxShadow: "var(--shadow-tall)",
      }}
    >
      <p
        className="px-2.5 pt-2 pb-1.5 text-[11px] font-medium"
        style={{ color: "var(--ink-400)", letterSpacing: "0.04em" }}
      >
        Model
      </p>
      <div className="flex flex-col gap-0.5">
        {MODELS.map((model) => (
          <ModelOption
            key={model.id}
            model={model}
            isSelected={selectedModel.id === model.id}
            onClick={() => {
              setSelectedModel(model);
              onClose();
            }}
          />
        ))}
      </div>
    </div>
  );
}
