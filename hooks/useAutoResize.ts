"use client";

import { useCallback, useRef, useEffect } from "react";

export function useAutoResize(maxRows: number = 5) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 22;
    const maxHeight = lineHeight * maxRows;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [maxRows]);

  useEffect(() => {
    resize();
  }, [resize]);

  return { textareaRef, resize };
}
