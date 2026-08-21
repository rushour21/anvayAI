import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import GradientPanel, { SymbolLeaves } from "./GradientPanel";

/* The single objection worth answering on a landing page for this product:
   "why should I believe the answer?" Everything here is phrased as what the
   reader gets, not how the system achieves it. */

const points = [
  {
    title: "Every answer shows its work",
    body: "Sources sit under each answer, linked to the original. Nothing asks you to take it on faith.",
  },
  {
    title: "It tells you when it isn't sure",
    body: "Anything Anvay can't back up with a real source gets flagged rather than slipped in alongside the rest.",
  },
  {
    title: "Your files stay yours",
    body: "Documents live in your workspace, are never used to train a model, and go when you delete them.",
  },
];

export default function TrustSection() {
  return (
    <section id="trust" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <Reveal>
        <div className="section-head">
          <h2 className="display-lg">
            Answers you can{" "}
            <span className="serif-accent serif-accent-blue">check yourself.</span>
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
              {points.map((p) => (
                <div key={p.title} className="flex gap-3.5">
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
