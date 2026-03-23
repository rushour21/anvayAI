"use client";

import QueryInput from "./QueryInput";
import InputToolbar from "./InputToolbar";

export default function InputCard() {
  return (
    <div
      className="w-full px-10 pb-8 pt-4 animate-fade-up"
      style={{ maxWidth: 880, margin: "0 auto", background: "transparent" }}
    >
      <div
        className="p-5 pb-3 border border-divider-grey"
        style={{
          background: "var(--surface-pure)",
          borderRadius: 24,
          boxShadow: "var(--shadow-medium)",
        }}
      >
        <QueryInput />
        <div className="mt-2 border-t pt-2" style={{ borderColor: "rgba(0,0,0,0.03)" }}>
          <InputToolbar />
        </div>
      </div>
    </div>
  );
}
