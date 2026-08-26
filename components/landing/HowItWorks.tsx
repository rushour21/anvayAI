"use client";

import Icon, { type IconName } from "@/components/ui/Icon";
import Reveal, { useInView } from "@/components/ui/Reveal";

/* Three steps, told from the reader's side of the screen. What *they* do,
   and what they get back — not what the system does in between. */

const steps: { n: string; title: string; body: string; icon: IconName }[] = [
  {
    n: "01",
    title: "Ask what changed",
    body: "'Why did operating margin fall?' Type it the way you'd ask a colleague. Pick a company or upload a report.",
    icon: "message",
  },
  {
    n: "02",
    title: "It investigates, not just searches",
    body: "Anvay finds the metric, locates the filing section, pulls management's explanation — while you watch each step.",
    icon: "search",
  },
  {
    n: "03",
    title: "Get a cited answer",
    body: "Every explanation traces back to the exact filing and section. Turn it into an earnings note in one click.",
    icon: "check",
  },
];

export default function HowItWorks() {
  /* The rail draws itself once the row is on screen — a small piece of
     motion that also communicates the left-to-right sequence. */
  const { ref, inView } = useInView<HTMLDivElement>(0.4);

  return (
    <section id="how" className="section-padding">
      <div className="section-container">
        <Reveal>
          <div className="section-head">
            <h2 className="display-lg">
              From question to{" "}
              <span className="serif-accent serif-accent-blue">cited answer.</span>
            </h2>
          </div>
        </Reveal>

        <div ref={ref} className="relative mt-16">
          {/* Connector rail, desktop only */}
          <div
            className="hidden md:block absolute pointer-events-none"
            style={{ top: 27, left: "16%", right: "16%", height: 2 }}
          >
            <div
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg, var(--blue-200), var(--blue-300), var(--blue-200))",
                transform: `scaleX(${inView ? 1 : 0})`,
                transformOrigin: "left",
                transition: "transform 1.1s var(--ease-out) 0.15s",
                borderRadius: 2,
              }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={0.12 * i} className="relative text-center">
                <div
                  className="mx-auto flex items-center justify-center rounded-2xl relative z-10"
                  style={{
                    width: 56,
                    height: 56,
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    boxShadow: "var(--shadow-soft)",
                    color: "var(--blue-500)",
                  }}
                >
                  <Icon name={s.icon} size={22} />
                </div>

                <span
                  className="block mt-5 text-[11px] font-mono tracking-widest"
                  style={{ color: "var(--ink-400)" }}
                >
                  {s.n}
                </span>
                <h3 className="text-[18px] font-semibold tracking-tight mt-1.5">
                  {s.title}
                </h3>
                <p
                  className="text-[14px] leading-relaxed mt-2.5 mx-auto"
                  style={{ color: "var(--ink-500)", maxWidth: "34ch" }}
                >
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
