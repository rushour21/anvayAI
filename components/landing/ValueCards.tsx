import Reveal from "@/components/ui/Reveal";
import GradientPanel, {
  SymbolOrbit,
  SymbolLeaves,
  SymbolPrism,
  type PanelTone,
} from "./GradientPanel";

/* Three cards, each earning its space — outcomes in the headline, the
   mechanism only as far as it reassures. The rows at the bottom are the
   concrete proof behind the claim above them. */

type Card = {
  tone: PanelTone;
  symbol: React.ReactNode;
  title: string;
  body: string;
  rows: { label: string; meta: string }[];
};

const cards: Card[] = [
  {
    tone: "indigo",
    symbol: SymbolOrbit,
    title: "Investigate, don't just retrieve",
    body: "Ask why a number moved and get the actual cause, cited to the filing section — not a plausible-sounding guess.",
    rows: [
      { label: "Finds the filing section", meta: "MD&A or notes" },
      { label: "Cites management's explanation", meta: "Real quote" },
      { label: "Flags what it can't verify", meta: "Honest gaps" },
    ],
  },
  {
    tone: "azure",
    symbol: SymbolLeaves,
    title: "Compare companies properly",
    body: "Ask to compare two or five companies and get a real side-by-side metric table — revenue, margins, FCF, R&D, debt.",
    rows: [
      { label: "Auto-fetched from SEC filings", meta: "Live data" },
      { label: "Export to Excel", meta: "For your model" },
      { label: "Explains key differences", meta: "Context included" },
    ],
  },
  {
    tone: "teal",
    symbol: SymbolPrism,
    title: "Combine your research with the filing",
    body: "Upload an analyst report and ask how it stacks up against the company's own 10-K.",
    rows: [
      { label: "PDFs and Excel files", meta: "Any length" },
      { label: "Cited by page", meta: "Check it yourself" },
      { label: "Stays private", meta: "Your workspace only" },
    ],
  },
];

export default function ValueCards() {
  return (
    <section id="features" className="section-padding">
      <div className="section-container">
        <Reveal>
        <div className="section-head">
          <h2 className="display-lg">
            What makes Anvay{" "}
            <span className="serif-accent serif-accent-blue">different.</span>
          </h2>
        </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {cards.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.1}
              as="article"
              className="surface-card card-hover card-lift p-3 flex flex-col"
              style={{ borderRadius: 22 }}
            >
              <GradientPanel tone={c.tone} symbol={c.symbol} />

              <div className="px-3 pt-6 pb-2 flex flex-col flex-1">
                <h3 className="text-[19px] font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed mt-2.5"
                  style={{ color: "var(--ink-500)" }}
                >
                  {c.body}
                </p>

                <ul className="mt-6 flex flex-col">
                  {c.rows.map((r) => (
                    <li
                      key={r.label}
                      className="flex items-center justify-between gap-3 py-2.5"
                      style={{ borderTop: "1px solid var(--line-soft)" }}
                    >
                      <span
                        className="text-[13.5px] font-medium"
                        style={{ color: "var(--ink-800)" }}
                      >
                        {r.label}
                      </span>
                      <span
                        className="text-[11.5px] font-mono shrink-0"
                        style={{ color: "var(--ink-400)" }}
                      >
                        {r.meta}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
