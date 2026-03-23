"use client";

import { useState } from "react";

interface ChatHistoryItemProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatHistoryItem({ title, isActive, onClick }: ChatHistoryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full text-left px-3 py-2.5 rounded-xl relative overflow-hidden transition-all duration-200 cursor-pointer flex items-center mb-1"
      style={{
        height: 40,
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.65)",
        fontFamily: "var(--font-body)",
        background: isActive ? "rgba(255, 255, 255, 0.08)" : isHovered ? "rgba(255, 255, 255, 0.04)" : "transparent",
      }}
    >
      {/* Active Indicator */}
      {isActive && (
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r"
          style={{ background: "var(--secondary-gold)" }}
        />
      )}
      
      <span className="relative truncate pr-2">
        {title}
      </span>
    </button>
  );
}
