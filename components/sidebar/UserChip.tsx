"use client";

export default function UserChip({ isDark = false }: { isDark?: boolean }) {
  return (
    <div 
      className="flex items-center gap-3 px-2 py-1.5 rounded-xl transition-colors duration-200 cursor-pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Dynamic Avatar */}
      <div
        className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-[10px]"
        style={{
          width: 34,
          height: 34,
          background: "linear-gradient(135deg, #1A1F3C 0%, #C5A039 100%)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "none",
        }}
      >
        RI
      </div>
      <div className="flex flex-col min-w-0">
        <span
          className="truncate"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: isDark ? "#FFFFFF" : "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        >
          Rushabh Ingle
        </span>
        <span
          style={{
            fontSize: 11,
            color: isDark ? "rgba(255,255,255,0.5)" : "var(--text-slate)",
            fontFamily: "var(--font-body)",
          }}
        >
          Pro Plan
        </span>
      </div>
      <button
        className="ml-auto p-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
        style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
        aria-label="Settings"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="3" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="13" cy="8" r="1.5" />
        </svg>
      </button>
    </div>
  );
}
