"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

const faqs = [
  {
    q: "How is this different from just using ChatGPT?",
    a: "A single model answers from one pass of its own reasoning. Anvay decomposes your question, runs specialised agents against it — live search, your documents, a code sandbox — then has a separate validator check each claim against its source before you see it.",
  },
  {
    q: "Where do the citations come from?",
    a: "Only from pages and documents an agent actually opened during that run. If the Validator can't ground a sentence in a retrieved source, it gets flagged rather than quietly included.",
  },
  {
    q: "Can I choose which model runs?",
    a: "Yes. Pick one explicitly from the composer, or let the Gateway route each step to the cheapest model that can handle it — usually a fast model for retrieval and a stronger one for synthesis.",
  },
  {
    q: "What happens to documents I upload?",
    a: "They're indexed into your own workspace and used only to answer your questions. They aren't used to train any model, and you can delete them along with their embeddings at any time.",
  },
  {
    q: "Is there a free tier?",
    a: "Early access includes a monthly allowance that covers normal research use. Open-weight models like Llama run at no usage cost, so you can stay on the free tier longer by routing to them.",
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
