"use client";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer"
      style={{
        width: 42,
        height: 42,
        background: disabled
          ? "rgba(0, 0, 0, 0.05)"
          : "linear-gradient(135deg, #1A1F3C 0%, #2D3250 100%)",
        border: "none",
        opacity: disabled ? 0.3 : 1,
        boxShadow: disabled ? "none" : "0 4px 12px rgba(26, 31, 60, 0.25)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(26, 31, 60, 0.3)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 31, 60, 0.25)";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.96)";
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
      }}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <path d="M3 8h10M13 8l-4-4M13 8l-4 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
