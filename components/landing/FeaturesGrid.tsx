const features = [
  {
    title: "Web Search",
    description:
      "Research agents scour the live web to find the most relevant and up-to-date information for your query.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: "var(--primary-indigo)",
  },
  {
    title: "PDF Upload",
    description:
      "Upload documents and let our agents extract, summarize, and cross-reference information instantly.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    color: "var(--secondary-gold)",
  },
  {
    title: "Image Understanding",
    description:
      "Analyze images, charts, and diagrams with vision-capable agents that understand visual context.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    color: "var(--indigo-muted)",
  },
  {
    title: "Memory",
    description:
      "Persistent context across conversations so your AI assistant remembers your preferences and prior research.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22l-.75-12.07A4.001 4.001 0 0 1 12 2z" />
        <path d="M8 6a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M16 6a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
      </svg>
    ),
    color: "var(--secondary-gold)",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="section-padding bg-[var(--bg-deep)]">
      <div className="section-container">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--secondary-gold)] mb-3">
            Capabilities
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--primary-indigo)] mb-4">
            Everything you need to research smarter
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[var(--text-slate)] opacity-70">
            Four powerful tools working together to give you comprehensive, verified answers.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="surface-card card-hover p-8 rounded-2xl flex flex-col gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--primary-indigo)]">
                {f.title}
              </h3>
              <p className="text-[var(--text-slate)] opacity-70 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
