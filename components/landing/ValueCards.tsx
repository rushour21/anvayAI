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
    title: "Finish the research in one go",
    body: "Ask once and get a written answer with its sources attached — instead of ten tabs you still have to read and reconcile yourself.",
    rows: [
      { label: "Reads the live web", meta: "Up to date" },
      { label: "Shows every source", meta: "One click away" },
      { label: "Remembers the thread", meta: "Ask follow-ups" },
    ],
  },
  {
    tone: "azure",
    symbol: SymbolLeaves,
    title: "Ask your own documents",
    body: "Drop in a report, contract, or paper and ask about it in plain language. Answers point back to the page they came from.",
    rows: [
      { label: "PDFs and reports", meta: "Any length" },
      { label: "Answers cite the page", meta: "Check it yourself" },
      { label: "Stays in your workspace", meta: "Private" },
    ],
  },
  {
    tone: "teal",
    symbol: SymbolPrism,
    title: "Use the model that suits the job",
    body: "Switch between the best models mid-conversation without losing your place — or let Anvay pick and keep the cost down for you.",
    rows: [
      { label: "GPT-4o", meta: "Everyday" },
      { label: "Gemini 2.5 Flash", meta: "Long documents" },
      { label: "DeepSeek V3", meta: "Maths & code" },
      { label: "Llama 4 Scout", meta: "Free" },
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
            Everything you need to{" "}
            <span className="serif-accent serif-accent-blue">know for certain.</span>
          </h2>
        </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {cards.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 0.1}
              as="article"
              className="surface-card card-hover p-3 flex flex-col"
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
