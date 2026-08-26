import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import GradientPanel, { SymbolLeaves } from "./GradientPanel";

/* The single objection worth answering on a landing page for this product:
   "why should I believe the answer?" Everything here is phrased as what the
   reader gets, not how the system achieves it. */

const points = [
  {
    title: "Every claim links to the source",
    body: "Not a paraphrase — every claim traces back to the specific 10-K, 10-Q, or transcript section it came from.",
  },
  {
    title: "It won't guess at a number",
    body: "If a filing doesn't support a claim, Anvay says so instead of inventing a number that sounds plausible.",
  },
  {
    title: "Your research stays private",
    body: "Your uploads and chats are private to your account, never used to train a model, and gone when you delete them.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <Reveal>
        <div className="section-head">
          <h2 className="display-lg">
            Built on{" "}
            <span className="serif-accent serif-accent-blue">trust.</span>
          </h2>
        </div>
        </Reveal>

        <Reveal delay={0.1}>
        <div
          className="surface-card mt-14 p-3 md:p-4"
          style={{ borderRadius: 26 }}
        >
          <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] gap-4 lg:gap-10 items-center">
            <GradientPanel tone="indigo" symbol={SymbolLeaves} height="100%" className="min-h-[280px]" />

            <div className="px-3 py-6 lg:pr-10 flex flex-col gap-8">
              {points.map((p, i) => (
                <div key={p.title} className="flex gap-3.5 animate-slide-left" style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="shrink-0 mt-0.5" style={{ color: "var(--blue-500)" }}>
                    <Icon name="sparkle" size={17} />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p
                      className="text-[14px] leading-relaxed mt-1.5"
                      style={{ color: "var(--ink-500)", maxWidth: "46ch" }}
                    >
                      {p.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
