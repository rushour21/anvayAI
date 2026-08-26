"use client";

import { useCallback, useRef } from "react";
import { useUIStore } from "@/stores/uiStore";

/* A 5px hit-zone around a 1px visible line, dragged to resize the right
   panel. Width is measured from the viewport's right edge since the panel
   is pinned there, so the pointer position converts directly to width. */
export default function ResizeHandle() {
  const setRightPanelWidth = useUIStore((s) => s.setRightPanelWidth);
  const draggingRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      setRightPanelWidth(window.innerWidth - e.clientX);
    },
    [setRightPanelWidth]
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize workspace panel"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="hidden lg:flex items-center justify-center shrink-0 group"
      style={{ width: 9, cursor: "col-resize", touchAction: "none" }}
    >
      <div
        className="h-full transition-colors duration-150 group-hover:bg-[var(--blue-300)]"
        style={{ width: 1, background: "var(--line)" }}
      />
    </div>
  );
}
