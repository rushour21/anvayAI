"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useProjectStore } from "@/stores/projectStore";

/* Deliberately three fields and only one required. A project is created in
   seconds mid-thought, not filled in like a form — structure should be the
   reward for doing work, never a toll before it. */
export default function CreateProjectDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const createProject = useProjectStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [tickers, setTickers] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const created = await createProject({ name: name.trim(), tickers });
    setSaving(false);
    if (created) {
      onClose();
      router.push(`/projects/${created.id}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-2xl p-5"
        style={{ maxWidth: 400, background: "var(--surface)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium" style={{ color: "var(--ink-800)" }}>
            New project
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer"
            style={{ color: "var(--ink-400)" }}
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        <label className="block text-[12px] mb-1" style={{ color: "var(--ink-600)" }}>
          Name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="US Semis coverage"
          className="w-full px-3 py-2 rounded-lg text-[13px] mb-3 outline-none"
          style={{ border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-800)" }}
        />

        <label className="block text-[12px] mb-1" style={{ color: "var(--ink-600)" }}>
          Tickers <span style={{ color: "var(--ink-400)" }}>— optional</span>
        </label>
        <input
          value={tickers}
          onChange={(e) => setTickers(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="NVDA, AMD, INTC"
          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-800)" }}
        />
        <p className="text-[11px] mt-1.5" style={{ color: "var(--ink-400)" }}>
          A project can cover as many companies as you follow.
        </p>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-[12.5px] cursor-pointer"
            style={{ border: "1px solid var(--line)", color: "var(--ink-600)" }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!name.trim() || saving}
            className="btn btn-primary px-3 py-1.5 rounded-lg text-[12.5px] cursor-pointer"
            style={{ opacity: !name.trim() || saving ? 0.5 : 1 }}
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
