"use client";

interface AgentPillProps {
  emoji: string;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

export default function AgentPill({ emoji, label, color, isActive, onClick }: AgentPillProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer overflow-hidden border"
      style={{
        background: isActive ? "var(--primary-indigo)" : "var(--surface-pure)",
        borderColor: isActive ? "var(--primary-indigo)" : "var(--divider-grey)",
        boxShadow: isActive ? "0 4px 12px rgba(26, 31, 60, 0.15)" : "var(--shadow-soft)",
        fontSize: 13,
        fontWeight: 600,
        color: isActive ? "#FFFFFF" : "var(--text-primary)",
        fontFamily: "var(--font-body)",
      }}
    >
      <span className="relative" style={{ fontSize: 16 }}>{emoji}</span>
      <span className="relative">{label}</span>
      
      {/* Subtle accent glow when active */}
      {isActive && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at center, ${color} 0%, transparent 80%)`,
          }}
        />
      )}
    </button>
  );
}
