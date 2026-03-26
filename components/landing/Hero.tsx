import Link from "next/link";

const featureChips = [
  { label: "Web Search", icon: "🌐" },
  { label: "PDF Upload", icon: "📄" },
  { label: "Image Understanding", icon: "🖼️" },
  { label: "Memory", icon: "🧠" },
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        {/* Full-section moving gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(26,31,60,0.06) 0%, rgba(197,160,89,0.08) 25%, rgba(248,249,250,0.02) 50%, rgba(45,50,80,0.06) 75%, rgba(197,160,89,0.05) 100%)",
            backgroundSize: "400% 400%",
            animation: "hero-gradient-shift 15s ease infinite",
          }}
        />
        {/* Orb 1 — indigo, top-left */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(26,31,60,0.18) 0%, rgba(26,31,60,0.05) 40%, transparent 70%)",
            top: "-15%",
            left: "-10%",
            animation: "hero-drift-1 18s ease-in-out infinite",
          }}
        />
        {/* Orb 2 — gold, right */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(197,160,89,0.2) 0%, rgba(197,160,89,0.06) 40%, transparent 70%)",
            top: "10%",
            right: "-12%",
            animation: "hero-drift-2 22s ease-in-out infinite",
          }}
        />
        {/* Orb 3 — muted indigo, bottom-center */}
        <div
          className="hero-orb absolute rounded-full"
          style={{
            width: "800px",
            height: "800px",
            background: "radial-gradient(circle, rgba(45,50,80,0.14) 0%, rgba(45,50,80,0.04) 40%, transparent 70%)",
            bottom: "-25%",
            left: "25%",
            animation: "hero-drift-3 25s ease-in-out infinite",
          }}
        />
      </div>
      <div className="max-w-5xl mx-auto text-center animate-fade-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--secondary-gold)]/10 border border-[var(--secondary-gold)]/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-[var(--secondary-gold)] animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--secondary-gold)]">
            Next Generation Research
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold text-[var(--primary-indigo)] leading-[1.05] tracking-tight mb-8">
          Deep insights through <br />
          <span className="text-[var(--secondary-gold)]">Connected</span> Intelligence.
        </h1>

        {/* Supporting text */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-slate)] opacity-80 leading-relaxed mb-10">
          Anvay AI orchestrates specialized agents to search, verify, and
          synthesize information — delivering clarity where others only provide
          links.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all btn-indigo"
          >
            Start Researching Free
          </Link>
          <Link
            href="/chat/new"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[var(--primary-indigo)] bg-white border border-[var(--divider-grey)] rounded-2xl hover:bg-[var(--bg-deep)] transition-all"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            Try a Demo
          </Link>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          {featureChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[var(--divider-grey)] text-sm font-medium text-[var(--text-slate)]"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              <span>{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>

        {/* Product preview mockup */}
        <div className="relative px-4">
          <div
            className="surface-card p-5 rounded-[32px] max-w-4xl mx-auto overflow-hidden border border-[var(--divider-grey)]/50"
            style={{ boxShadow: "var(--shadow-medium)" }}
          >
            <div className="bg-[var(--bg-deep)] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 min-h-[320px]">
              {/* Top bar */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[var(--divider-grey)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--divider-grey)]" />
                <div className="w-3 h-3 rounded-full bg-[var(--divider-grey)]" />
                <div className="ml-4 flex-1 h-4 max-w-xs rounded bg-[var(--divider-grey)]" />
              </div>

              {/* Chat messages skeleton */}
              <div className="space-y-4 flex-1">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-indigo)]/10 shrink-0" />
                  <div className="space-y-2 flex-1 max-w-md">
                    <div className="w-full h-4 rounded bg-white" style={{ boxShadow: "var(--shadow-soft)" }} />
                    <div className="w-4/5 h-4 rounded bg-white" style={{ boxShadow: "var(--shadow-soft)" }} />
                  </div>
                </div>
                <div className="flex gap-3 items-start justify-end">
                  <div className="space-y-2 max-w-sm">
                    <div className="w-full h-4 rounded bg-[var(--primary-indigo)]/5" />
                    <div className="w-3/4 h-4 rounded bg-[var(--primary-indigo)]/5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--secondary-gold)]/20 shrink-0" />
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary-indigo)]/10 shrink-0" />
                  <div className="space-y-2 flex-1 max-w-lg">
                    <div className="w-full h-4 rounded bg-white" style={{ boxShadow: "var(--shadow-soft)" }} />
                    <div className="w-5/6 h-4 rounded bg-white" style={{ boxShadow: "var(--shadow-soft)" }} />
                    <div className="w-2/3 h-4 rounded bg-white" style={{ boxShadow: "var(--shadow-soft)" }} />
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-[var(--primary-indigo)]/5"
                    />
                  ))}
                </div>
                <div className="flex-1" />
                <div className="w-28 h-10 rounded-full bg-[var(--secondary-gold)]/20" />
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[var(--secondary-gold)]/5 via-transparent to-[var(--primary-indigo)]/5 -z-10 blur-3xl rounded-full pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
