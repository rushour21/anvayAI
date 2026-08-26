"use client";

export default function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 rounded-full transition-colors duration-200 cursor-pointer"
      style={{
        width: 38,
        height: 22,
        background: checked ? "var(--blue-500)" : "var(--line-strong)",
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-200"
        style={{
          width: 16,
          height: 16,
          top: 3,
          left: 3,
          transform: checked ? "translateX(16px)" : "translateX(0)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
        }}
      />
    </button>
  );
}
