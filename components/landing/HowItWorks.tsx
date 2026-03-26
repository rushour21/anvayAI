const steps = [
  {
    number: "01",
    title: "Upload",
    description: "Drop a PDF, paste a link, or simply type your research question into the chat.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Analyze",
    description: "Specialized agents search, read, verify, and cross-reference information in real time.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Answer",
    description: "Get a clear, cited answer synthesized from multiple verified sources — ready to use.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-padding bg-[var(--bg-deep)]">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--secondary-gold)] mb-3">
            How It Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--primary-indigo)]">
            Three steps to clarity
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-px bg-[var(--divider-grey)]" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative text-center animate-fade-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Icon circle */}
              <div className="w-16 h-16 rounded-2xl bg-white border border-[var(--divider-grey)] flex items-center justify-center mx-auto mb-6 text-[var(--primary-indigo)] relative z-10"
                style={{ boxShadow: "var(--shadow-soft)" }}
              >
                {step.icon}
              </div>
              <span className="inline-block text-xs font-bold text-[var(--secondary-gold)] tracking-wider mb-2">
                STEP {step.number}
              </span>
              <h3 className="font-display font-bold text-xl text-[var(--primary-indigo)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--text-slate)] opacity-70 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
