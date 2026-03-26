const items = [
  {
    title: "Private Workspaces",
    description: "Your data stays in your workspace. No cross-user training, no shared models.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Secure File Handling",
    description: "Files are encrypted in transit and at rest. We never store your documents after processing.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Source Visibility",
    description: "Every answer links back to its source. Full transparency on where information comes from.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="section-padding bg-[var(--primary-indigo)]">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--secondary-gold)] mb-3">
            Security & Privacy
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-white mb-4">
            Enterprise-grade trust
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/60">
            Your data. Your control. Always.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="rounded-2xl p-8 bg-white/5 border border-white/10 backdrop-blur-sm card-hover animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--secondary-gold)]/15 flex items-center justify-center text-[var(--secondary-gold)] mb-5">
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-3">
                {item.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
