"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import Wordmark from "@/components/ui/Wordmark";

const links = [
  { href: "#features", label: "Product" },
  { href: "#how", label: "How it works" },
  { href: "#demo", label: "See it" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  /* The bar floats as a capsule over the hero, then tightens and gains a
     stronger glass fill once you scroll past it. */
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Highlight whichever section is currently crossing the upper third. */
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector(l.href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(`#${hit.target.id}`);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none">
      <div
        className="mx-auto px-4 transition-all duration-300"
        style={{ maxWidth: scrolled ? 1000 : 1200, paddingTop: scrolled ? 10 : 18 }}
      >
        <nav
          className="pointer-events-auto flex items-center justify-between gap-4 transition-all duration-300"
          style={{
            height: 58,
            paddingInline: 10,
            paddingLeft: 20,
            borderRadius: 999,
            background: scrolled ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.42)",
            border: `1px solid ${scrolled ? "var(--line)" : "rgba(255,255,255,0.7)"}`,
            boxShadow: scrolled ? "var(--shadow-medium)" : "var(--shadow-soft)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
          }}
        >
          <Wordmark size={21} />

          {/* Centre links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => {
              const isActive = active === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="relative px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? "var(--ink-900)" : "var(--ink-500)",
                    background: isActive ? "rgba(255,255,255,0.85)" : "transparent",
                    boxShadow: isActive ? "var(--shadow-hair)" : "none",
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-2 rounded-full text-[14px] font-medium transition-colors"
              style={{ color: "var(--ink-600)" }}
            >
              Log in
            </Link>
            <Link href="/chat/new" className="btn btn-primary pl-4 pr-3.5 py-2 text-[14px]">
              Try Now
              <Icon name="arrowRight" size={15} />
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
              className="md:hidden flex items-center justify-center rounded-full ml-0.5"
              style={{
                width: 38,
                height: 38,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid var(--line)",
                color: "var(--ink-700)",
              }}
            >
              <Icon name={open ? "close" : "menu"} size={18} />
            </button>
          </div>
        </nav>

        {/* Mobile sheet */}
        {open && (
          <div
            className="pointer-events-auto md:hidden mt-2 p-2 rounded-3xl animate-slide-down"
            style={{
              background: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              border: "1px solid var(--line)",
              boxShadow: "var(--shadow-medium)",
            }}
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-2xl text-[15px] font-medium"
                style={{ color: "var(--ink-700)" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-2xl text-[15px] font-medium"
              style={{ color: "var(--ink-700)" }}
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
