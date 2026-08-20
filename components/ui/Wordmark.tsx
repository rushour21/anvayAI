import Link from "next/link";

/**
 * The Anvay wordmark — type only, no bitmap.
 *
 * "Anvay" is set in Instrument Serif italic (the same face that carries the
 * accent words in every headline, so the logo and the copy share a voice),
 * locked up with a small grotesk "AI" tag. Optical tweaks: the serif italic
 * needs negative tracking at small sizes, and the tag sits on the cap line
 * rather than the baseline.
 */

interface WordmarkProps {
  /** Cap height in px. Everything else scales from this. */
  size?: number;
  /** Light text for dark grounds. */
  tone?: "dark" | "light";
  /** Render as a link to home. */
  href?: string | null;
  className?: string;
}

export default function Wordmark({
  size = 22,
  tone = "dark",
  href = "/",
  className = "",
}: WordmarkProps) {
  const ink = tone === "light" ? "#FFFFFF" : "var(--ink-900)";
  const tag = tone === "light" ? "rgba(255,255,255,0.75)" : "var(--blue-600)";

  const inner = (
    <span
      className={`inline-flex items-baseline select-none ${className}`}
      style={{ gap: size * 0.16, lineHeight: 1 }}
    >
      <span
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: size,
          letterSpacing: "-0.02em",
          color: ink,
        }}
      >
        Anvay
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: size * 0.44,
          letterSpacing: "0.08em",
          color: tag,
          transform: `translateY(${-size * 0.28}px)`,
          display: "inline-block",
        }}
      >
        AI
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
