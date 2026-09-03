"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useProjectStore } from "@/stores/projectStore";

/* "Check this when the 10-K lands." Analyst work is full of these, and they
   are normally lost in a notebook. The agent can add them mid-conversation
   via add_open_question; this is where they get resolved. */
export default function OpenQuestions({
  projectId,
  questions,
}: {
  projectId: string;
  questions: string[];
}) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const [draft, setDraft] = useState("");

  const add = async () => {
    const cleaned = draft.trim();
    if (!cleaned) return;
    setDraft("");
    await updateProject(projectId, { openQuestions: [...questions, cleaned] });
  };

  const remove = async (index: number) => {
    await updateProject(projectId, { openQuestions: questions.filter((_, i) => i !== index) });
  };

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <h2 className="text-[12px] font-medium mb-2" style={{ color: "var(--ink-500)" }}>
        Open questions
      </h2>

      {questions.length === 0 && (
        <p className="text-[12.5px] mb-2" style={{ color: "var(--ink-400)" }}>
          Nothing outstanding.
        </p>
      )}

      <ul className="flex flex-col gap-1 mb-2">
        {questions.map((question, i) => (
          <li key={i} className="flex items-start gap-2 group">
            <span className="mt-[5px] shrink-0" style={{ color: "var(--ink-300)" }}>
              <Icon name="check" size={11} />
            </span>
            <span className="text-[12.5px] flex-1" style={{ color: "var(--ink-700)" }}>
              {question}
            </span>
            <button
              onClick={() => remove(i)}
              aria-label="Resolve question"
              title="Resolve"
              className="opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
              style={{ color: "var(--ink-300)" }}
            >
              <Icon name="close" size={11} />
            </button>
          </li>
        ))}
      </ul>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && add()}
        placeholder="Add something to verify…"
        className="w-full px-2.5 py-1.5 rounded-lg text-[12.5px] outline-none"
        style={{ border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-800)" }}
      />
    </section>
  );
}
