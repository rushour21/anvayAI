"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const faqs = [
  {
    q: "How is this different from a normal AI chatbot?",
    a: "A chatbot answers from memory and sounds equally confident whether it is right or wrong. Anvay looks things up first, shows you where each part of the answer came from, and flags anything it could not verify.",
  },
  {
    q: "Can I trust the sources?",
    a: "They are real pages and documents that were actually opened while answering your question, not titles invented to look convincing. Every one is a link you can click and check.",
  },
  {
    q: "What can I upload?",
    a: "PDFs, reports, papers, and contracts, including long ones. Ask about them in plain language and the answer will tell you which page it came from.",
  },
  {
    q: "Which AI model does it use?",
    a: "Whichever suits the question. You can pick one yourself and switch mid-conversation, or leave it to Anvay, which uses a cheaper model for simple steps and a stronger one where it matters.",
  },
  {
    q: "What happens to my documents?",
    a: "They stay in your workspace, are used only to answer your questions, are never used to train any model, and are deleted permanently whenever you say so.",
  },
  {
    q: "Is it free to try?",
    a: "Yes. Early access includes a monthly allowance that covers normal research use, and some models cost nothing to run at all.",
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
