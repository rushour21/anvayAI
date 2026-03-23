"use client";

import React from "react";

type SurfaceIntensity = "low" | "medium" | "high";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: SurfaceIntensity;
  children: React.ReactNode;
}

const intensityStyles: Record<SurfaceIntensity, React.CSSProperties> = {
  low: {
    background: "var(--surface-pure)",
    boxShadow: "var(--shadow-soft)",
    border: "1px solid var(--divider-grey)",
  },
  medium: {
    background: "var(--surface-pure)",
    boxShadow: "var(--shadow-medium)",
    border: "1px solid var(--divider-grey)",
  },
  high: {
    background: "var(--surface-pure)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    border: "1px solid var(--divider-grey)",
  },
};

export default function GlassPanel({
  intensity = "medium",
  children,
  className = "",
  style,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${className}`}
      style={{ ...intensityStyles[intensity], ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
