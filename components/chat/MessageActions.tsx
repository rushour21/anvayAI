"use client";

export default function MessageActions() {
  const actions = [
    { label: "Copy", icon: "📋" },
    { label: "Retry", icon: "🔄" },
    { label: "Share", icon: "📤" },
  ];

  return (
    <div className="flex items-center gap-1 animate-fade-up">
      {actions.map((action) => (
        <button
          key={action.label}
          className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.4)",
            border: "1px solid rgba(255,255,255,0.5)",
            fontSize: 11,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.7)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.4)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <span style={{ fontSize: 11 }}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
