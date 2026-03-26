const useCases = [
  {
    title: "Research",
    description: "Explore topics deeply with multi-source search, fact-checking, and synthesized summaries.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    title: "Study",
    description: "Upload textbooks and study materials to get instant explanations, quizzes, and key takeaways.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 10 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: "Team Knowledge",
    description: "Build a shared knowledge base from documents, links, and conversations across your organization.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Document Q&A",
    description: "Ask natural-language questions about your documents and get precise, cited answers in seconds.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
      </svg>
    ),
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="section-padding bg-white">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--secondary-gold)] mb-3">
            Use Cases
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--primary-indigo)] mb-4">
            Built for how you work
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[var(--text-slate)] opacity-70">
            Whether you&apos;re a solo researcher or a global team, Anvay adapts to your workflow.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => (
            <div
              key={uc.title}
              className="surface-card card-hover p-8 rounded-2xl flex flex-col gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-indigo)]/5 flex items-center justify-center text-[var(--primary-indigo)]">
                {uc.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--primary-indigo)]">
                {uc.title}
              </h3>
              <p className="text-[var(--text-slate)] opacity-70 text-sm leading-relaxed">
                {uc.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
