import Link from "next/link";
import AnvayMark from "./AnvayMark";

/**
 * The Anvay logo lockup: the two-ellipse "A" mark plus the wordmark.
 *
 * The name is set as a single word with a colour break rather than a size
 * break — a superscript "AI" collapses into visual noise below ~20px, where
 * this logo actually lives (navbar, sidebar, topbar).
 *
 * Optical notes: the grotesk needs negative tracking at logo sizes, and the
 * mark carries its own padding, so the gap is measured off cap height rather
 * than the SVG box.
 */

interface WordmarkProps {
  /** Cap height in px. The mark and gap scale from this. */
  size?: number;
  /** Light treatment for dark grounds. */
  tone?: "dark" | "light";
  /** Hide the mark when something else already establishes the brand. */
  showMark?: boolean;
  /** Render as a link to home. Pass null for a bare lockup. */
  href?: string | null;
  className?: string;
}

export default function Wordmark({
  size = 20,
  tone = "dark",
  showMark = true,
  href = "/",
  className = "",
}: WordmarkProps) {
  const ink = tone === "light" ? "#FFFFFF" : "var(--ink-900)";
  const accent = tone === "light" ? "rgba(255,255,255,0.7)" : "var(--blue-500)";

  const inner = (
    <span
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap: size * 0.26, lineHeight: 1 }}
    >
      {showMark && (
        <AnvayMark
          size={size * 1.7}
          tone={tone === "light" ? "light" : "brand"}
        />
      )}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "-0.035em",
          color: ink,
          whiteSpace: "nowrap",
        }}
      >
        Anvay<span style={{ color: accent }}>AI</span>
      </span>
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} aria-label="Anvay AI — home" className="inline-flex shrink-0">
      {inner}
    </Link>
  );
}
