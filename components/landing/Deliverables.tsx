import Reveal from "@/components/ui/Reveal";
import Icon, { type IconName } from "@/components/ui/Icon";

/* The differentiator no other section shows: a chat turns into the exact
   document an analyst is evaluated on at work. Three mocked document
   previews — skeleton lines standing in for prose, real-looking metric
   rows for the numbers — so this reads as "output", not another feature
   card. */

type Doc = {
  tag: string;
  tint: string;
  icon: IconName;
  title: string;
  lines: number[];
  metrics: { label: string; value: string }[];
  footer: string;
};

const docs: Doc[] = [
  {
    tag: "Earnings note",
    tint: "#3B6EF5",
    icon: "document",
    title: "NVDA — Q3 FY25",
    lines: [92, 78, 60],
    metrics: [
      { label: "Operating margin", value: "62.5%" },
      { label: "Revenue", value: "$35.1B" },
    ],
    footer: "Exported to PDF",
  },
  {
    tag: "Flash report",
    tint: "#8B5CF0",
    icon: "zap",
    title: "AAPL — supply update",
    lines: [85, 55],
    metrics: [{ label: "Source", value: "8-K, filed today" }],
    footer: "One page, same day",
  },
  {
    tag: "Comp sheet",
    tint: "#0E9AA7",
    icon: "layers",
    title: "NVDA vs AMD",
    lines: [70],
    metrics: [
      { label: "Gross margin", value: "75% vs 47%" },
      { label: "R&D spend", value: "$8.7B vs $6.5B" },
    ],
    footer: "Exported to Excel",
  },
];

export default function Deliverables() {
  return (
    <section className="section-padding">
      <div className="section-container">
        <Reveal>
          <div className="section-head">
            <h2 className="display-lg">
              From conversation to{" "}
              <span className="serif-accent serif-accent-blue">deliverable.</span>
            </h2>
            <p className="lede mt-4">
              Turn an investigation into the document you actually have to hand in.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {docs.map((d, i) => (
            <Reveal
              key={d.tag}
              delay={i * 0.1}
              as="article"
              className="surface-card card-hover p-6"
              style={{ borderRadius: 20 }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full text-[12px] font-medium"
                  style={{
                    background: `color-mix(in srgb, ${d.tint} 12%, transparent)`,
                    color: d.tint,
                  }}
                >
                  <Icon name={d.icon} size={12} strokeWidth={2.4} />
                  {d.tag}
                </span>
              </div>

              <p
                className="text-[14.5px] font-medium mt-4"
                style={{ color: "var(--ink-800)" }}
              >
                {d.title}
              </p>

              <div className="flex flex-col gap-2 mt-4">
                {d.lines.map((w, li) => (
                  <span
                    key={li}
                    className="block rounded-full"
                    style={{ width: `${w}%`, height: 7, background: "var(--line)" }}
                  />
                ))}
              </div>

              <div
                className="flex flex-col gap-2 mt-5 pt-4"
                style={{ borderTop: "1px solid var(--line-soft)" }}
              >
                {d.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px]" style={{ color: "var(--ink-500)" }}>
                      {m.label}
                    </span>
                    <span
                      className="text-[12.5px] font-mono font-medium"
                      style={{ color: "var(--ink-800)" }}
                    >
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="flex items-center gap-1.5 mt-5 text-[12px]"
                style={{ color: "var(--ink-400)" }}
              >
                <Icon name="share" size={12} strokeWidth={2.4} />
                {d.footer}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
