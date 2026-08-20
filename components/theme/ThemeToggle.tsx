"use client";

import { useEffect, useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import { THEME_KEY } from "./ThemeScript";

type Theme = "light" | "dark";

/* The active theme lives on <html data-theme>, written by ThemeScript before
   first paint. That makes the DOM the source of truth, not React state — so
   this subscribes to it rather than keeping a second copy that could drift. */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

/* The server can't know the theme. Returning null renders no icon during
   hydration, which avoids a visible icon swap if the user is on dark. */
const getServerSnapshot = () => null;

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /* Track the OS while the user hasn't chosen explicitly. This writes to the
     DOM, not to state — the subscription above picks the change up. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch {
        return;
      }
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark";

  const toggle = () => {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — the choice just won't survive a reload */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      className="flex items-center justify-center rounded-xl transition-colors duration-150 cursor-pointer"
      style={{ width: 34, height: 34, background: "transparent", color: "var(--ink-500)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--paper-sunk)";
        e.currentTarget.style.color = "var(--ink-800)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--ink-500)";
      }}
    >
      {theme && <Icon name={isDark ? "sun" : "moon"} size={17} />}
    </button>
  );
}
