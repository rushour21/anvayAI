/**
 * The Anvay mark — a stylised "A" built from two leaning ellipses that meet
 * at the apex. The solid stroke carries the brand blue; the pale one is the
 * counterform, sitting behind it so the overlap reads as translucency.
 *
 * Drawn on a 40×40 grid with ~3 units of optical padding, so it aligns with
 * cap height when set beside the wordmark.
 */

interface AnvayMarkProps {
  size?: number;
  /** Light treatment for dark grounds. */
  tone?: "brand" | "light";
  className?: string;
}

export default function AnvayMark({
  size = 28,
  tone = "brand",
  className = "",
}: AnvayMarkProps) {
  const solid = tone === "light" ? "#FFFFFF" : "var(--blue-500)";
  /* A solid tint holds its value at 20px far better than a low-opacity
     fill of the brand blue, which washes out against a glass navbar. */
  const pale = tone === "light" ? "#FFFFFF" : "var(--blue-200)";
  const paleOpacity = tone === "light" ? 0.45 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Right leg — shorter, leans left at the top. Drawn first so the
          solid stroke overlaps it at the apex. */}
      <ellipse
        cx="33"
        cy="22.4"
        rx="5.8"
        ry="15.6"
        fill={pale}
        opacity={paleOpacity}
        transform="rotate(-19 33 22.4)"
      />
      {/* Left stroke — the long diagonal. Its top end is the apex. */}
      <ellipse
        cx="15.4"
        cy="21.2"
        rx="7"
        ry="21"
        fill={solid}
        transform="rotate(37 15.4 21.2)"
      />
    </svg>
  );
}
