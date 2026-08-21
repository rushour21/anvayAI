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
    id: "students",
    tab: "Students",
    icon: "book",
    headline: "Understand it, don't just find it",
    body: "Upload the lecture notes and the textbook chapter, then ask until it actually makes sense. Every explanation points back at the page it came from, so revision is checkable.",
    bullets: ["Ask your own course material", "Answers cite the page", "Follow-ups keep the thread"],
  },
  {
    id: "researchers",
    tab: "Researchers",
    icon: "search",
    headline: "A literature scan in minutes",
    body: "Sweep the open web and the papers you already have, and get one synthesis instead of forty tabs. Anything that can't be traced to a source is flagged rather than asserted.",
    bullets: ["Cross-checks between sources", "Flags what it can't ground", "Keeps the citation trail"],
  },
  {
    id: "analysts",
    tab: "Analysts",
    icon: "layers",
    headline: "Get to the number faster",
    body: "Drop in the report and ask what changed. Anvay pulls the figure, tells you which page it sat on, and shows what it compared it against.",
    bullets: ["Long reports, straight answers", "Points at the exact page", "Switch models for hard maths"],
  },
  {
    id: "teams",
    tab: "Teams",
    icon: "users",
    headline: "Answers from what your team wrote down",
    body: "Point Anvay at your shared docs so people stop asking the same question twice — and so the answer comes from your own material, not the open internet.",
    bullets: ["Shared workspace", "Private to your team", "Never used for training"],
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
              Built for whoever needs to{" "}
              <span className="serif-accent serif-accent-blue">be sure.</span>
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13.5px] font-medium cursor-pointer transition-all duration-200"
                    style={{
                      background: on ? "var(--blue-500)" : "transparent",
                      color: on ? "#fff" : "var(--ink-500)",
                      boxShadow: on ? "var(--shadow-blue)" : "none",
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
