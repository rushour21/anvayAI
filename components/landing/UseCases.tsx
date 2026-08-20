import Icon, { type IconName } from "@/components/ui/Icon";

const useCases: {
  title: string;
  body: string;
  icon: IconName;
  agents: string[];
}[] = [
  {
    title: "Literature review",
    body: "Sweep across arXiv, journals, and the open web, then get one synthesis with every claim traced back to a paper.",
    icon: "book",
    agents: ["Web Search", "Synthesizer", "Validator"],
  },
  {
    title: "Studying",
    body: "Upload lecture notes and textbooks, then work through them by asking questions instead of re-reading chapters.",
    icon: "document",
    agents: ["Documents", "Memory"],
  },
  {
    title: "Technical decisions",
    body: "Compare tools and architectures with current benchmarks, and run the numbers in a sandbox rather than trusting a summary.",
    icon: "code",
    agents: ["Web Search", "Code Runner"],
  },
  {
    title: "Team knowledge",
    body: "Point Anvay at your shared docs so answers come from what your organisation actually wrote down.",
    icon: "users",
    agents: ["Documents", "Memory", "Validator"],
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <div className="section-head">
          <span className="pill-badge">
            <Icon name="sparkle" size={13} />
            Use cases
          </span>
          <h2 className="display-lg">Built for how you actually work</h2>
          <p className="lede">
            The same orchestra, pointed at different problems.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-14">
          {useCases.map((u, i) => (
            <article
              key={u.title}
              className="surface-card card-hover p-7 animate-fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span
                className="flex items-center justify-center rounded-xl mb-4"
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--blue-50)",
                  color: "var(--blue-600)",
                }}
              >
                <Icon name={u.icon} size={19} />
              </span>
              <h3 className="text-[17px] font-semibold mb-2">{u.title}</h3>
              <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-500)" }}>
                {u.body}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-5">
                {u.agents.map((a) => (
                  <span
                    key={a}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{
                      background: "var(--paper-sunk)",
                      color: "var(--ink-500)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
