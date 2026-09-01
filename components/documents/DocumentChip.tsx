"use client";

import { DocumentAttachment } from "@/types/document";
import Icon from "@/components/ui/Icon";

/** Mirrors the ring-spinner already used in components/auth/AuthGuard.tsx
    and components/landing/Hero.tsx, sized down for an inline chip. */
function Spinner() {
  return (
    <span
      className="shrink-0 rounded-full animate-spin"
      style={{
        width: 12,
        height: 12,
        border: "1.6px solid var(--line)",
        borderTopColor: "var(--blue-500)",
        animationDuration: "0.8s",
      }}
    />
  );
}

export default function DocumentChip({
  document,
  onDelete,
}: {
  document: DocumentAttachment;
  onDelete: () => void;
}) {
  const isError = document.status === "error";
  const isPending =
    document.status === "uploading" || document.status === "uploaded" || document.status === "processing";
  const isReady = document.status === "ready";

  const statusLabel =
    document.status === "uploading"
      ? "Uploading…"
      : document.status === "uploaded"
        ? "Processing…"
        : document.status === "processing"
          ? "Processing…"
          : isError
            ? document.error || "Failed to process"
            : undefined;

  return (
    <div
      className="group flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-xl"
      style={{
        background: "var(--surface)",
        border: `1px solid ${isError ? "var(--red-200, rgba(239,68,68,0.35))" : "var(--line)"}`,
        maxWidth: 220,
      }}
      title={statusLabel ? `${document.filename} — ${statusLabel}` : document.filename}
    >
      <span
        className="shrink-0 flex items-center justify-center rounded-md"
        style={{
          width: 17,
          height: 17,
          background: "color-mix(in srgb, var(--agent-rag) 14%, transparent)",
          color: "var(--agent-rag)",
        }}
      >
        <Icon name="document" size={11} strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex flex-col leading-tight">
        <span
          className="truncate text-[11.5px] font-medium"
          style={{ color: "var(--ink-700)" }}
        >
          {document.filename}
        </span>
        {statusLabel && (
          <span
            className="truncate text-[10px]"
            style={{ color: isError ? "var(--red-500, #ef4444)" : "var(--ink-400)" }}
          >
            {statusLabel}
          </span>
        )}
      </span>

      <span className="shrink-0 flex items-center justify-center" style={{ width: 14, height: 14 }}>
        {isPending && <Spinner />}
        {isReady && <Icon name="check" size={13} strokeWidth={2} style={{ color: "var(--agent-validator)" }} />}
        {isError && <Icon name="close" size={12} strokeWidth={2} style={{ color: "var(--red-500, #ef4444)" }} />}
      </span>

      <button
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${document.filename}`}
        title="Remove"
        className="shrink-0 flex items-center justify-center rounded-md cursor-pointer transition-all duration-150"
        style={{ width: 18, height: 18, color: "var(--ink-300)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--red-500, #ef4444)";
          e.currentTarget.style.background = "var(--red-50, rgba(239,68,68,0.08))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--ink-300)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Icon name="close" size={11} strokeWidth={2} />
      </button>
    </div>
  );
}
