"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Reveals children once they scroll into view, then stops observing.
 *
 * Two things most scroll-reveal implementations get wrong and this doesn't:
 * it unobserves after firing (so nothing re-animates when you scroll back up),
 * and it renders visible immediately when the user prefers reduced motion —
 * rather than animating faster, which still moves.
 */

type Direction = "up" | "left" | "right" | "none";

const OFFSET: Record<Direction, string> = {
  up: "translateY(22px)",
  left: "translateX(-24px)",
  right: "translateX(24px)",
  none: "none",
};

interface RevealProps {
  children: React.ReactNode;
  /** Seconds. Stagger siblings with this rather than nesting. */
  delay?: number;
  direction?: Direction;
  /** Fraction of the element that must be visible before firing. */
  amount?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
  style?: React.CSSProperties;
}

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  amount = 0.15,
  className = "",
  as = "div",
  style,
}: RevealProps) {
  /* Widening to ElementType keeps the ref assignable across the tag union;
     a concrete union type makes the ref intersection unsatisfiable. */
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);
  const reduced = usePrefersReducedMotion();

  /* Reduced motion renders visible immediately — animating faster is still
     animating, which is not what the preference asks for. */
  const shown = seen || reduced;

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    /* Hiding content until an observer fires means that if the observer
       never fires, the content is invisible permanently. That happens for
       real: a document that isn't being rendered (backgrounded tab, hidden
       pane) delivers no IntersectionObserver callbacks at all.

       The observer always delivers an initial entry once it can — even a
       non-intersecting one — so "no entry at all within a beat" is a
       reliable signal that it isn't running, and we fail open. */
    let delivered = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        delivered = true;
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect(); // fire once
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);

    const failOpen = setTimeout(() => {
      if (!delivered) setSeen(true);
    }, 1500);

    return () => {
      clearTimeout(failOpen);
      io.disconnect();
    };
  }, [amount, reduced]);

  return (
    <Tag
      ref={ref}
      /* The `reveal` hook lets the no-JS stylesheet in the document head
         force this visible — without it, a JS failure hides the page. */
      className={`reveal ${className}`.trim()}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : OFFSET[direction],
        transition: `opacity 0.7s var(--ease-out) ${delay}s, transform 0.7s var(--ease-out) ${delay}s`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/** Reports whether the element is on screen — used to pause off-screen loops. */
export function useInView<T extends HTMLElement>(amount = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: amount,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);

  return { ref, inView };
}
