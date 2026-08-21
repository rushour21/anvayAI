"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import Icon from "@/components/ui/Icon";
import Reveal, { useInView } from "@/components/ui/Reveal";

/* A looping mock of a real answer being produced. Everything here is
   scripted — it exists to show the shape of the product, not to run it.

   The loop only advances while the section is on screen; a demo animating
   in a background tab is wasted battery. */

const QUERY = "Is intermittent fasting actually better than calorie counting?";

const ANSWER =
  "Across the head-to-head trials, the two produce about the same weight loss once total calories match. Fasting wins on adherence for some people and loses it for others.";

const STEPS = [
  { label: "Searching", icon: "globe" as const },
  { label: "Reading 9 sources", icon: "document" as const },
  { label: "Cross-checking", icon: "shield" as const },
];

const SOURCES = [
  { domain: "nih.gov", tint: "#3B6EF5" },
  { domain: "nature.com", tint: "#0E9AA7" },
  { domain: "bmj.com", tint: "#8B5CF0" },
];

type Phase = "typing" | "working" | "sources" | "answering" | "hold";

export default function LiveDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [rawPhase, setPhase] = useState<Phase>("typing");
  const [qChars, setQChars] = useState(0);
  const [aChars, setAChars] = useState(0);
  const [step, setStep] = useState(-1);
  const reduced = usePrefersReducedMotion();

  /* With reduced motion the demo is shown as a finished, static answer
     rather than a faster loop. Derived, so no state is written for it. */
  const phase: Phase = reduced ? "hold" : rawPhase;
  const shownQ = reduced ? QUERY.length : qChars;
  const shownA = reduced ? ANSWER.length : aChars;
  const shownStep = reduced ? STEPS.length : step;

  useEffect(() => {
    if (!inView || reduced) return;
    let t: ReturnType<typeof setTimeout>;
    let iv: ReturnType<typeof setInterval>;

    switch (rawPhase) {
      case "typing":
        iv = setInterval(() => {
          setQChars((n) => {
            if (n >= QUERY.length) {
              clearInterval(iv);
              t = setTimeout(() => setPhase("working"), 380);
              return n;
            }
            return n + 1;
          });
        }, 26);
        break;

      case "working":
        iv = setInterval(() => {
          setStep((s) => {
            if (s >= STEPS.length - 1) {
              clearInterval(iv);
              t = setTimeout(() => setPhase("sources"), 520);
              return s;
            }
            return s + 1;
          });
        }, 620);
        break;

      case "sources":
        t = setTimeout(() => setPhase("answering"), 900);
        break;

      case "answering":
        iv = setInterval(() => {
          setAChars((n) => {
            if (n >= ANSWER.length) {
              clearInterval(iv);
              t = setTimeout(() => setPhase("hold"), 200);
              return n;
            }
            return n + 1;
          });
        }, 16);
        break;

      case "hold":
        t = setTimeout(() => {
          setQChars(0);
          setAChars(0);
          setStep(-1);
          setPhase("typing");
        }, 3800);
        break;
    }

    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [rawPhase, inView, reduced]);

  const showSources = phase === "sources" || phase === "answering" || phase === "hold";
  const showAnswer = phase === "answering" || phase === "hold";

  return (
    <section id="demo" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <Reveal>
          <div className="section-head">
            <h2 className="display-lg">
              Watch one question{" "}
              <span className="serif-accent serif-accent-blue">get answered.</span>
            </h2>
            <p className="lede mt-4">
              No tabs, no skimming, no wondering where the number came from.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            ref={ref}
            className="surface-card mx-auto mt-14 overflow-hidden"
            style={{ maxWidth: 820, borderRadius: 24, boxShadow: "var(--shadow-tall)" }}
          >
            {/* Window chrome */}
            <div
              className="flex items-center gap-2 px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              {["#E5E8EF", "#E5E8EF", "#E5E8EF"].map((c, i) => (
                <span key={i} className="rounded-full" style={{ width: 9, height: 9, background: c }} />
              ))}
              <span
                className="ml-3 text-[12px] font-mono"
                style={{ color: "var(--ink-300)" }}
              >
                anvay.ai
              </span>
            </div>

            <div className="p-5 sm:p-7 flex flex-col gap-5" style={{ minHeight: 340 }}>
              {/* Query */}
              <div className="flex justify-end">
                <div
                  className="px-4 py-2.5 text-[14px] leading-relaxed"
                  style={{
                    maxWidth: "82%",
                    background: "var(--blue-500)",
                    color: "#fff",
                    borderRadius: "16px 16px 5px 16px",
                    minHeight: 22,
                  }}
                >
                  {QUERY.slice(0, shownQ)}
                  {phase === "typing" && (
                    <span
                      className="inline-block animate-caret align-middle ml-px"
                      style={{ width: 1.5, height: 14, background: "#fff" }}
                    />
                  )}
                </div>
              </div>

              {/* Working steps */}
              {phase !== "typing" && (
                <div className="flex flex-wrap gap-2">
                  {STEPS.map((s, i) => {
                    const done = i < shownStep || phase !== "working";
                    const active = i === shownStep && phase === "working";
                    if (i > shownStep && phase === "working") return null;
                    return (
                      <span
                        key={s.label}
                        className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full text-[12px] font-medium animate-fade-up"
                        style={{
                          background: "var(--surface)",
                          border: `1px solid ${active ? "var(--blue-200)" : "var(--line)"}`,
                          color: active ? "var(--blue-600)" : "var(--ink-500)",
                        }}
                      >
                        <span
                          className="flex items-center justify-center rounded-full"
                          style={{
                            width: 17,
                            height: 17,
                            background: done ? "var(--blue-50)" : "var(--paper-sunk)",
                            color: done ? "var(--blue-600)" : "var(--ink-400)",
                          }}
                        >
                          <Icon name={done ? "check" : s.icon} size={10} strokeWidth={2.4} />
                        </span>
                        {s.label}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Sources */}
              {showSources && (
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((s, i) => (
                    <span
                      key={s.domain}
                      className="inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl text-[11.5px] font-medium animate-fade-up"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        color: "var(--ink-700)",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    >
                      <span
                        className="flex items-center justify-center rounded-md font-mono text-[9px] font-bold"
                        style={{
                          width: 16,
                          height: 16,
                          background: `color-mix(in srgb, ${s.tint} 14%, transparent)`,
                          color: s.tint,
                        }}
                      >
                        {i + 1}
                      </span>
                      {s.domain}
                    </span>
                  ))}
                </div>
              )}

              {/* Answer */}
              {showAnswer && (
                <p
                  className="text-[14.5px] leading-[1.75]"
                  style={{ color: "var(--ink-700)" }}
                >
                  {ANSWER.slice(0, shownA)}
                  {phase === "answering" && (
                    <span
                      className="inline-block animate-caret align-middle ml-px"
                      style={{ width: 1.5, height: 15, background: "var(--blue-500)" }}
                    />
                  )}
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
