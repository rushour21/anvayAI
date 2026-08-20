"use client";

import QueryInput from "./QueryInput";
import InputToolbar from "./InputToolbar";

export default function InputCard() {
  return (
    <div className="shrink-0 px-4 sm:px-8 pb-5 pt-2">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mx-auto px-3.5 pt-2.5 pb-2"
        style={{
          maxWidth: 760,
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          boxShadow: "var(--shadow-medium)",
        }}
      >
        <QueryInput />
        <div className="mt-1.5 pt-1.5" style={{ borderTop: "1px solid var(--line-soft)" }}>
          <InputToolbar />
        </div>
      </form>
      <p
        className="text-center text-[11px] mt-2.5"
        style={{ color: "var(--ink-300)" }}
      >
        Anvay cites its sources. Verify anything that matters.
      </p>
    </div>
  );
}
