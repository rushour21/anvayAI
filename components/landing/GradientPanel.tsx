import React from "react";

/**
 * The illustration block that heads each value card.
 *
 * A saturated gradient, a faint concentric guilloche, a grain wash, and one
 * oversized white line symbol. The grain matters more than it looks: a large
 * flat gradient banded on 8-bit displays reads as cheap, and the noise breaks
 * the bands up.
 *
 * All three variants stay inside the blue/periwinkle family and separate by
 * temperature rather than hue, so three cards side by side read as a set.
 */

export type PanelTone = "indigo" | "azure" | "teal";

const TONES: Record<PanelTone, string> = {
  indigo:
    "linear-gradient(150deg, #A9B6FB 0%, #7B8EF5 38%, #5566E8 72%, #4348C9 100%)",
  azure:
    "linear-gradient(150deg, #9EC6FB 0%, #5FA0F4 38%, #3B7BE8 72%, #2B5BD2 100%)",
  teal:
    "linear-gradient(150deg, #9AD8DE 0%, #56B4C4 38%, #2E8FAB 72%, #26719A 100%)",
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

interface GradientPanelProps {
  tone: PanelTone;
  symbol: React.ReactNode;
  height?: number | string;
  className?: string;
}

export default function GradientPanel({
  tone,
  symbol,
  height = 210,
  className = "",
}: GradientPanelProps) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height, borderRadius: 16, background: TONES[tone] }}
      aria-hidden="true"
    >
      {/* Concentric guilloche — barely visible, gives the fill some structure */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle
            key={i}
            cx="200"
            cy="130"
            r={40 + i * 34}
            stroke="#fff"
            strokeWidth="1"
            opacity={0.07 - i * 0.008}
          />
        ))}
      </svg>

      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: GRAIN, opacity: 0.28 }}
      />

      {/* Light catching the top-left, as if lit from above */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 18% 8%, rgba(255,255,255,0.34) 0%, transparent 55%)",
        }}
      />

      {/* Symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ color: "#fff", opacity: 0.94 }}>{symbol}</div>
      </div>
    </div>
  );
}

/* ── Symbols ──────────────────────────────────────────────────
   Drawn at 84×84 with a 1.4 stroke — thin enough to feel drawn
   rather than iconographic at this size.                        */

export const SymbolOrbit = (
  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="42" cy="42" r="21" />
    <ellipse cx="42" cy="42" rx="33" ry="13" />
    <ellipse cx="42" cy="42" rx="33" ry="13" transform="rotate(60 42 42)" />
    <ellipse cx="42" cy="42" rx="33" ry="13" transform="rotate(120 42 42)" />
    <circle cx="42" cy="42" r="3.4" fill="currentColor" stroke="none" />
  </svg>
);

export const SymbolLeaves = (
  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="1.4">
    {[0, 60, 120, 180, 240, 300].map((r) => (
      <path
        key={r}
        d="M42 42 C 30 30, 30 14, 42 6 C 54 14, 54 30, 42 42 Z"
        transform={`rotate(${r} 42 42)`}
      />
    ))}
    <circle cx="42" cy="42" r="5" />
  </svg>
);

export const SymbolPrism = (
  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M42 8 L74 63 H10 Z" />
    <path d="M42 8 V63" />
    <path d="M10 63 L42 40 L74 63" />
    <circle cx="42" cy="8" r="3" fill="currentColor" stroke="none" />
    <circle cx="10" cy="63" r="3" fill="currentColor" stroke="none" />
    <circle cx="74" cy="63" r="3" fill="currentColor" stroke="none" />
  </svg>
);
