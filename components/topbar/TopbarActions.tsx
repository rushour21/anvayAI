"use client";

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      className="flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
      style={{
        width: 34,
        height: 34,
        background: "rgba(255,255,255,0.4)",
        border: "1px solid rgba(255,255,255,0.6)",
        color: "var(--text-secondary)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.65)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.4)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </button>
  );
}

export default function TopbarActions() {
  return (
    <div className="flex items-center gap-2">
      <IconButton label="Share">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M4.5 6.5L7.5 3.5L10.5 6.5M7.5 3.5V10.5M3 12H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </IconButton>
      <IconButton label="Search">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </IconButton>
      <IconButton label="Settings">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7.5 2V4M7.5 11V13M12.5 7.5H11M4 7.5H2.5M10.9 4.1L9.8 5.2M5.2 9.8L4.1 10.9M10.9 10.9L9.8 9.8M5.2 5.2L4.1 4.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </IconButton>
    </div>
  );
}
