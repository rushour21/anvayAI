"use client";

export default function HeroTitle() {
  return (
    <div className="text-center animate-fade-up">
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: "-1.5px",
          color: "var(--primary-indigo)",
          lineHeight: 1.1,
        }}
      >
        What do you want to know?
      </h1>
      <p
        className="mt-4 max-w-lg mx-auto"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 17,
          fontWeight: 500,
          color: "var(--text-slate)",
          opacity: 0.8,
        }}
      >
        Your personal multi-agent research assistant. Search, verify, and synthesize in seconds.
      </p>
    </div>
  );
}
