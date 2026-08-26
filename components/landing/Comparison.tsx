import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

/* The comparison a reader is already running in their head. Naming the
   generic category rather than a competitor keeps it honest — and avoids
   claiming things about a named product we haven't tested. */

const rows = [
  {
    label: "Why a metric changed",
    chatbot: "Guesses from training data",
    anvay: "Reads the actual MD&A section",
  },
  {
    label: "Comparing companies",
    chatbot: "You build the spreadsheet",
    anvay: "Auto-generated comparison table",
  },
  {
    label: "Citing a number",
    chatbot: "Might be outdated or invented",
    anvay: "Traced to the exact filing",
  },
  {
    label: "Your own research",
    chatbot: "Paste and hope it fits",
    anvay: "Compared against the company's filing",
  },
  {
    label: "The deliverable",
    chatbot: "A paragraph you format yourself",
    anvay: "An earnings note, ready to export",
  },
];

export default function Comparison() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <Reveal>
          <div className="section-head">
            <h2 className="display-lg">
              Anvay vs. a{" "}
              <span className="serif-accent serif-accent-blue">regular chatbot.</span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="mx-auto mt-14 overflow-hidden surface-card"
            style={{ maxWidth: 880, borderRadius: 22 }}
          >
            {/* Header */}
            <div
              className="grid items-center gap-4 px-5 sm:px-7 py-4"
              style={{
                gridTemplateColumns: "1.15fr 1fr 1fr",
                borderBottom: "1px solid var(--line)",
                background: "var(--paper-alt)",
              }}
            >
              <span />
              <span
                className="text-[12.5px] font-medium"
                style={{ color: "var(--ink-400)" }}
              >
                A normal AI chatbot
              </span>
              <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                <Icon name="sparkle" size={13} style={{ color: "var(--blue-500)" }} />
                Anvay
              </span>
            </div>

            {rows.map((r, i) => (
              <div
                key={r.label}
                className="grid items-center gap-4 px-5 sm:px-7 py-4"
                style={{
                  gridTemplateColumns: "1.15fr 1fr 1fr",
                  borderTop: i === 0 ? "none" : "1px solid var(--line-soft)",
                }}
              >
                <span
                  className="text-[13px] font-medium"
                  style={{ color: "var(--ink-800)" }}
                >
                  {r.label}
                </span>
                <span className="text-[13px]" style={{ color: "var(--ink-400)" }}>
                  {r.chatbot}
                </span>
                <span className="flex items-start gap-2 text-[13px]" style={{ color: "var(--ink-700)" }}>
                  <Icon
                    name="check"
                    size={13}
                    strokeWidth={2.6}
                    className="shrink-0 mt-1 animate-pulse-soft"
                    style={{ color: "var(--blue-500)", animationDuration: "2s" }}
                  />
                  {r.anvay}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
