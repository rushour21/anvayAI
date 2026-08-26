"use client";

import { useState } from "react";
import Icon, { type IconName } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

/* Lets the reader self-identify. Tabs keep four audiences on the page
   without spending four cards of vertical space on them. */

const audiences: {
  id: string;
  tab: string;
  icon: IconName;
  headline: string;
  body: string;
  bullets: string[];
}[] = [
  {
    id: "equity",
    tab: "Equity research",
    icon: "target",
    headline: "Cover more companies, write faster",
    body: "Ask why a metric moved and get the MD&A section that explains it, not a guess. Turn the finding straight into an earnings note or flash report.",
    bullets: ["Cites the exact filing section", "Generates earnings notes", "Track your research history"],
  },
  {
    id: "investment",
    tab: "Investment/portfolio",
    icon: "layers",
    headline: "Monitor holdings without the manual scan",
    body: "Ask what changed since your last look at a company. Anvay remembers what you've already investigated and flags what's new.",
    bullets: ["Remembers your research", "Flash reports on breaking news", "Cross-checks filings vs. calls"],
  },
  {
    id: "pevc",
    tab: "PE/VC research",
    icon: "search",
    headline: "Public comps, without the busywork",
    body: "Build a comparison table across competitors in one prompt instead of rebuilding the same spreadsheet for every deal.",
    bullets: ["Side-by-side metrics", "Export to Excel", "Market context for due diligence"],
  },
  {
    id: "individual",
    tab: "Individual investors",
    icon: "sparkle",
    headline: "Do the homework before you buy",
    body: "Ask why a stock moved, not just that it did. Every claim traces back to a real filing you can check yourself.",
    bullets: ["No Bloomberg terminal needed", "Cited, not guessed", "Research at your own pace"],
  },
];

export default function Audience() {
  const [active, setActive] = useState(0);
  const a = audiences[active];

  return (
    <section id="audience" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <Reveal>
          <div className="section-head">
            <h2 className="display-lg">
              Built for financial{" "}
              <span className="serif-accent serif-accent-blue">professionals.</span>
            </h2>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.08}>
          <div className="flex justify-center mt-12">
            <div
              role="tablist"
              aria-label="Audiences"
              className="inline-flex flex-wrap justify-center gap-1 p-1.5 rounded-full"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              {audiences.map((x, i) => {
                const on = i === active;
                return (
                  <button
                    key={x.id}
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(i)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-medium cursor-pointer transition-all duration-200 animate-fade-up"
                    style={{
                      background: on ? "var(--blue-500)" : "transparent",
                      color: on ? "#fff" : "var(--ink-500)",
                      boxShadow: on ? "var(--shadow-blue)" : "none",
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    <Icon name={x.icon} size={14} />
                    {x.tab}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Panel — keyed so it re-animates on tab change */}
        <Reveal delay={0.14}>
          <div
            key={a.id}
            role="tabpanel"
            className="surface-card mx-auto mt-9 p-8 sm:p-11 animate-fade-up"
            style={{ maxWidth: 780, borderRadius: 24 }}
          >
            <h3 className="text-[24px] sm:text-[27px] font-semibold tracking-tight">
              {a.headline}
            </h3>
            <p
              className="text-[15px] leading-relaxed mt-3.5"
              style={{ color: "var(--ink-500)", maxWidth: "62ch" }}
            >
              {a.body}
            </p>
            <ul className="flex flex-wrap gap-2 mt-7">
              {a.bullets.map((b) => (
                <li
                  key={b}
                  className="inline-flex items-center gap-1.5 pl-2 pr-3.5 py-1.5 rounded-full text-[12.5px] font-medium"
                  style={{
                    background: "var(--blue-50)",
                    border: "1px solid var(--blue-100)",
                    color: "var(--blue-700)",
                  }}
                >
                  <Icon name="check" size={12} strokeWidth={2.6} />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
