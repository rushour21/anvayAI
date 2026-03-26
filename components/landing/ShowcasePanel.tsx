export default function ShowcasePanel() {
  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text side */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[var(--secondary-gold)] mb-3">
              Product
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--primary-indigo)] mb-6 leading-tight">
              Research, redefined for the AI era
            </h2>
            <p className="text-lg text-[var(--text-slate)] opacity-80 mb-8 leading-relaxed">
              Upload documents, ask complex questions, and get answers backed by
              verified sources — all in one intelligent workspace.
            </p>
            <ul className="space-y-4">
              {[
                "Multi-source chat with real-time web data",
                "Upload and interrogate any PDF or document",
                "Source cards with citation links for every claim",
                "Persistent memory across sessions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[var(--secondary-gold)]/15 flex items-center justify-center shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span> 
                  <span className="text-[var(--text-slate)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mock UI side */}
          <div
            className="surface-card rounded-3xl p-5 border border-[var(--divider-grey)]"
            style={{ boxShadow: "var(--shadow-medium)" }}
          >
            <div className="bg-[var(--bg-deep)] rounded-2xl p-6 space-y-4 min-h-[380px] flex flex-col">
              {/* Search bar */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-[var(--divider-grey)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-slate)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div className="w-48 h-3 rounded bg-[var(--divider-grey)]" />
              </div>

              {/* Source cards */}
              <div className="grid grid-cols-3 gap-2">
                {["Wikipedia", "arXiv", "PubMed"].map((s) => (
                  <div
                    key={s}
                    className="bg-white rounded-lg px-3 py-2 border border-[var(--divider-grey)]"
                  >
                    <div className="w-4 h-4 rounded bg-[var(--primary-indigo)]/10 mb-2" />
                    <p className="text-[10px] font-semibold text-[var(--text-slate)] opacity-60">
                      {s}
                    </p>
                  </div>
                ))}
              </div>

              {/* Response skeleton */}
              <div className="flex-1 space-y-3">
                <div className="w-full h-3 rounded bg-white" />
                <div className="w-5/6 h-3 rounded bg-white" />
                <div className="w-4/6 h-3 rounded bg-white" />
                <div className="mt-4 w-full h-3 rounded bg-white" />
                <div className="w-3/4 h-3 rounded bg-white" />
              </div>

              {/* File upload hint */}
              <div className="flex items-center gap-2 border border-dashed border-[var(--divider-grey)] rounded-xl px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-xs text-[var(--text-slate)] opacity-50">
                  Drop files here or click to upload
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
