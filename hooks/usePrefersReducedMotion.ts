"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;

/* The server can't know, and assuming "no preference" matches the CSS
   default — so a reduced-motion user gets a still first paint either way. */
const getServerSnapshot = () => false;

/**
 * Whether the user has asked the OS to reduce motion.
 *
 * The media query is an external store, so this reads it directly rather
 * than mirroring it into state — which would mean a synchronous setState
 * in an effect and an extra render on every mount.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
