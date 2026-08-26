"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const faqs = [
  {
    q: "How is this different from a normal AI chatbot?",
    a: "A chatbot guesses at financial figures from training data, which are often outdated or wrong. Anvay reads the actual SEC filing and cites the exact section.",
  },
  {
    q: "Which companies can I research?",
    a: "Any US public company that files with the SEC — 10-Ks, 10-Qs, and 8-Ks are pulled automatically. Non-US filings coming later.",
  },
  {
    q: "Can I upload my own research?",
    a: "Yes — analyst reports, models, or presentations. Anvay can compare them against the company's own filings to spot differences.",
  },
  {
    q: "Does this replace Bloomberg or a terminal?",
    a: "No. Anvay is for research and investigation, not trading, real-time pricing, or portfolio management. It's a research assistant, not a terminal.",
  },
  {
    q: "Is my research private?",
    a: "Yes — your uploads and chats are private to your account, never used to train a model, and deleted permanently when you choose.",
  },
  {
    q: "Is it free to try?",
    a: "Yes. Early access includes a monthly allowance that covers normal research use.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="section-padding">
      <div className="section-container">
        <div className="section-head">
          <span className="pill-badge">
            <Icon name="sparkle" size={13} />
            FAQ
          </span>
          <h2 className="display-lg">Questions, answered</h2>
        </div>

        <div className="mt-12 mx-auto flex flex-col gap-2.5" style={{ maxWidth: 780 }}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="surface-flat overflow-hidden transition-colors duration-200"
                style={{ borderColor: isOpen ? "var(--blue-200)" : "var(--line)" }}
              >
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center gap-4 text-left px-6 py-5 cursor-pointer"
                  >
                    <span
                      className="text-[15px] font-medium flex-1"
                      style={{ color: "var(--ink-900)" }}
                    >
                      {f.q}
                    </span>
                    <span
                      className="shrink-0 flex items-center justify-center rounded-full transition-transform duration-300"
                      style={{
                        width: 26,
                        height: 26,
                        background: isOpen ? "var(--blue-500)" : "var(--paper-sunk)",
                        color: isOpen ? "#fff" : "var(--ink-500)",
                        transform: isOpen ? "rotate(180deg)" : "none",
                      }}
                    >
                      <Icon name="chevronDown" size={14} strokeWidth={2} />
                    </span>
                  </button>
                </h3>
                {/* Grid-rows trick animates to intrinsic height without JS measurement */}
                <div
                  className="grid transition-all duration-300"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p
                      className="px-6 pb-5 text-[14px] leading-relaxed"
                      style={{ color: "var(--ink-500)", maxWidth: "68ch" }}
                    >
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
