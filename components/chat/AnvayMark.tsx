/** The assistant avatar — a small prism echoing the hero's model mark. */
export default function AnvayMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        boxShadow: "var(--shadow-hair)",
      }}
    >
      <span
        className="rounded-full"
        style={{
          width: size * 0.46,
          height: size * 0.46,
          background:
            "conic-gradient(from 210deg, #3B6EF5, #8B5CF0, #0E9AA7, #3B6EF5)",
        }}
      />
    </span>
  );
}
