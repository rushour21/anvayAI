"use client";

import { useSyncExternalStore } from "react";
import Icon from "@/components/ui/Icon";
import { THEME_KEY } from "@/components/theme/ThemeScript";

type Theme = "light" | "dark";

/* Same DOM-is-source-of-truth approach as ThemeToggle, just presented as a
   two-option segmented control instead of a single icon button. */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

const getServerSnapshot = () => null;

export default function ThemeSegment() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = (next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode — the choice just won't survive a reload */
    }
  };

  const options: { value: Theme; label: string; icon: "sun" | "moon" }[] = [
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
  ];

  return (
    <div
      className="inline-flex items-center p-1 rounded-full"
      style={{ background: "var(--paper-sunk)", border: "1px solid var(--line)" }}
    >
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full cursor-pointer transition-all duration-150"
            style={{
              background: active ? "var(--surface)" : "transparent",
              boxShadow: active ? "var(--shadow-soft)" : "none",
              color: active ? "var(--ink-900)" : "var(--ink-400)",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <Icon name={opt.icon} size={13} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
