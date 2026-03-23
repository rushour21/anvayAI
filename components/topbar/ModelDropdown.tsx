"use client";

import { MODELS } from "@/constants/models";
import { useChatStore } from "@/stores/chatStore";
import ModelOption from "./ModelOption";

interface ModelDropdownProps {
  onClose: () => void;
}

export default function ModelDropdown({ onClose }: ModelDropdownProps) {
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);

  return (
    <div
      className="rounded-2xl p-2 border border-divider-grey"
      style={{
        width: 320,
        background: "var(--surface-pure)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Select Model
      </div>
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
  );
}
