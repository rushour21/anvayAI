"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useProjectStore } from "@/stores/projectStore";

/* The one thing an analyst carries between quarters that isn't a file: their
   current view. Writing it down is what makes "what changed since last time"
   answerable, and what lets the agent compare new evidence against the
   position already on record. */
export default function ThesisCard({ projectId, thesis }: { projectId: string; thesis: string | null }) {
  const updateProject = useProjectStore((s) => s.updateProject);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thesis ?? "");

  const save = async () => {
    await updateProject(projectId, { thesis: draft.trim() || null });
    setEditing(false);
  };

  return (
    <section
      className="rounded-xl p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[12px] font-medium" style={{ color: "var(--ink-500)" }}>
          Current view
        </h2>
        {!editing && (
          <button
            onClick={() => {
              setDraft(thesis ?? "");
              setEditing(true);
            }}
            className="text-[11.5px] cursor-pointer"
            style={{ color: "var(--ink-400)" }}
          >
            {thesis ? "Edit" : "Add"}
          </button>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Overweight. PT $180. The debate is CoWoS capacity — I'm wrong if hyperscaler capex guides down."
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-y"
            style={{ border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-800)" }}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-2.5 py-1 rounded-lg text-[12px] cursor-pointer"
              style={{ border: "1px solid var(--line)", color: "var(--ink-600)" }}
            >
              Cancel
            </button>
            <button onClick={save} className="btn btn-primary px-2.5 py-1 rounded-lg text-[12px] cursor-pointer">
              Save
            </button>
          </div>
        </>
      ) : thesis ? (
        <p className="text-[13px] whitespace-pre-wrap" style={{ color: "var(--ink-700)" }}>
          {thesis}
        </p>
      ) : (
        <p className="text-[12.5px] flex items-center gap-1.5" style={{ color: "var(--ink-400)" }}>
          <Icon name="target" size={12} />
          No view recorded yet. Anvay compares new evidence against it once you add one.
        </p>
      )}
    </section>
  );
}
