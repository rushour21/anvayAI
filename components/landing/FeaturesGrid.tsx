import Icon from "@/components/ui/Icon";

/* ── Mock illustrations ──────────────────────────────────────
   Each card gets a small, *plausible* product vignette rather than
   grey skeleton bars. Real strings and real colour read as a shipped
   product; wireframes read as an unfinished Figma file.            */

function WebResearchMock() {
  const results = [
    { host: "arxiv.org", title: "Sparse attention at long context", tint: "#3B6EF5" },
    { host: "nature.com", title: "Retrieval benchmarks, 2026 review", tint: "#0E9AA7" },
    { host: "github.com", title: "reference implementation", tint: "#8B5CF0" },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <Icon name="search" size={14} style={{ color: "var(--ink-400)" }} />
        <span className="text-[12px]" style={{ color: "var(--ink-700)" }}>
          how does sparse attention scale?
        </span>
        <span
          className="animate-caret ml-px"
          style={{ width: 1.5, height: 13, background: "var(--blue-500)" }}
        />
      </div>
      {results.map((r, i) => (
        <div
          key={r.host}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl animate-fade-up"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            animationDelay: `${0.15 + i * 0.1}s`,
          }}
        >
          <span
            className="shrink-0 rounded-md"
            style={{ width: 16, height: 16, background: r.tint, opacity: 0.85 }}
          />
          <span
            className="text-[11px] truncate"
            style={{ color: "var(--ink-700)" }}
          >
            {r.title}
          </span>
          <span
            className="ml-auto text-[10px] shrink-0 font-mono"
            style={{ color: "var(--ink-400)" }}
          >
            {r.host}
          </span>
        </div>
      ))}
    </div>
  );
}

function DocumentMock() {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
      >
        <span
          className="shrink-0 flex items-center justify-center rounded-lg"
          style={{ width: 28, height: 28, background: "var(--blue-100)", color: "var(--blue-600)" }}
        >
          <Icon name="document" size={15} />
        </span>
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium truncate" style={{ color: "var(--ink-800)" }}>
            q3-market-report.pdf
          </p>
          <p className="text-[10px]" style={{ color: "var(--ink-400)" }}>
            84 pages · indexed
          </p>
        </div>
        <span
          className="ml-auto shrink-0 flex items-center justify-center rounded-full"
          style={{ width: 18, height: 18, background: "#10A37F", color: "#fff" }}
        >
          <Icon name="check" size={11} strokeWidth={2.6} />
        </span>
      </div>
      <div className="flex justify-end">
        <div
          className="px-3 py-2 text-[11px] max-w-[80%]"
          style={{
            background: "var(--blue-500)",
            color: "#fff",
            borderRadius: "14px 14px 4px 14px",
          }}
        >
          What changed vs Q2?
        </div>
      </div>
      <div
        className="px-3 py-2 text-[11px] max-w-[88%]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink-600)",
          borderRadius: "14px 14px 14px 4px",
        }}
      >
        Margin rose 4.1pts, driven by EMEA
        <span
          className="ml-1 px-1 rounded font-mono text-[9px] align-middle"
          style={{ background: "var(--blue-100)", color: "var(--blue-600)" }}
        >
          p.42
        </span>
      </div>
    </div>
  );
}

function TraceMock() {
  const steps = [
    { c: "#6366E8", done: true },
    { c: "#3B6EF5", done: true },
    { c: "#8B5CF0", done: true },
    { c: "#4F46E5", done: false },
    { c: "#10A37F", done: false },
  ];
  return (
    <div className="flex items-center justify-center h-full gap-0">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center">
          <span
            className="rounded-full animate-dot-pop"
            style={{
              width: 11,
              height: 11,
              background: s.done ? s.c : "transparent",
              border: `1.5px ${s.done ? "solid" : "dashed"} ${s.done ? s.c : "var(--ink-300)"}`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
          {i < steps.length - 1 && (
            <span
              style={{
                width: 22,
                height: 1.5,
                background: s.done ? s.c : "var(--ink-200)",
                opacity: s.done ? 0.45 : 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CitationMock() {
  return (
    <div className="flex flex-col justify-center h-full gap-1.5">
      {[
        { d: "arxiv.org", c: "#3B6EF5" },
        { d: "nature.com", c: "#0E9AA7" },
        { d: "who.int", c: "#8B5CF0" },
      ].map((s, i) => (
        <div
          key={s.d}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderLeft: `2.5px solid ${s.c}`,
            marginLeft: i * 10,
          }}
        >
          <span className="text-[10px] font-mono" style={{ color: "var(--ink-600)" }}>
            {s.d}
          </span>
          <Icon
            name="arrowUpRight"
            size={11}
            className="ml-auto"
            style={{ color: "var(--ink-300)" }}
          />
        </div>
      ))}
    </div>
  );
}

function MemoryMock() {
  const chips = ["prefers TypeScript", "works in fintech", "reads arXiv weekly"];
  return (
    <div className="flex flex-col justify-center h-full gap-1.5">
      {chips.map((c, i) => (
        <span
          key={c}
          className="self-start px-2.5 py-1 rounded-full text-[10px] animate-fade-up"
          style={{
            background: "var(--blue-50)",
            border: "1px solid var(--blue-100)",
            color: "var(--blue-700)",
            animationDelay: `${i * 0.12}s`,
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

const features = [
  {
    span: "lg" as const,
    title: "Live web research",
    body: "Search agents read the open web in real time, then rank what actually answers your question — not what ranks highest.",
    mock: <WebResearchMock />,
  },
  {
    span: "lg" as const,
    title: "Chat with your documents",
    body: "Drop in a PDF, contract, or paper. Anvay indexes it and answers with the exact page it came from.",
    mock: <DocumentMock />,
  },
  {
    span: "sm" as const,
    title: "Watch it think",
    body: "Every answer shows which agents ran, in what order, and what each one contributed.",
    mock: <TraceMock />,
  },
  {
    span: "sm" as const,
    title: "Every claim cited",
    body: "Source cards sit under each answer, linked back to the original.",
    mock: <CitationMock />,
  },
  {
    span: "sm" as const,
    title: "Memory that persists",
    body: "Anvay carries context between sessions so you never re-explain yourself.",
    mock: <MemoryMock />,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="section-padding">
      <div className="section-container">
        <div className="section-head">
          <span className="pill-badge">
            <Icon name="sparkle" size={13} />
            Capabilities
          </span>
          <h2 className="display-lg">Smarter research, fewer tabs</h2>
          <p className="lede">
            Five capabilities that work as one system — each answer is searched,
            grounded, cited, and remembered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-14">
          {features.map((f, i) => (
            <article
              key={f.title}
              className={`surface-card card-hover p-4 flex flex-col animate-fade-up ${
                f.span === "lg" ? "md:col-span-3" : "md:col-span-2"
              }`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Vignette */}
              <div
                className="surface-sunk p-3.5 mb-4"
                style={{ minHeight: f.span === "lg" ? 178 : 132 }}
              >
                {f.mock}
              </div>
              <h3 className="text-[17px] font-semibold mb-1.5">{f.title}</h3>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-500)" }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
