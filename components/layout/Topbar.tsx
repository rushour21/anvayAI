"use client";

import ModelSelector from "@/components/topbar/ModelSelector";
import TopbarActions from "@/components/topbar/TopbarActions";

export default function Topbar() {
  return (
    <header
      className="sticky top-0 flex items-center justify-between px-8"
      style={{
        height: 70,
        background: "var(--surface-pure)",
        borderBottom: "1px solid var(--divider-grey)",
        boxShadow: "0 1px 1px rgba(0,0,0,0.02)",
        zIndex: 20,
      }}
    >
      {/* Left section: breadcrumbs or empty */}
      <div className="flex-1" />

      {/* Center: model selector capsule */}
      <div className="flex-1 flex justify-center">
        <ModelSelector />
      </div>

      {/* Right: action icons */}
      <div className="flex-1 flex justify-end">
        <TopbarActions />
      </div>
    </header>
  );
}
