import AnvayMark from "@/components/ui/AnvayMark";

/** The assistant's avatar in the transcript — the brand mark in a tile. */
export default function AssistantAvatar({ size = 28 }: { size?: number }) {
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
      <AnvayMark size={size * 0.72} />
    </span>
  );
}
