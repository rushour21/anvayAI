import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Wordmark from "@/components/ui/Wordmark";

const navGroups = [
  { label: "Features", href: "#features" },
  { label: "Agents", href: "#agents" },
  { label: "Models", href: "#models" },
  { label: "FAQ", href: "#faq" },
];

const socials: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.22-6.82-5.96 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.11z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden mt-8">
      {/* Blue wash that rises into the wordmark */}
      <div
        className="relative"
        style={{
          background:
            "radial-gradient(90% 110% at 50% 118%, var(--peri-500) 0%, var(--peri-400) 30%, transparent 70%), linear-gradient(180deg, var(--paper) 0%, #E4EDFE 55%, #C9DBFC 100%)",
        }}
      >
        <div className="section-container pt-16 pb-10 relative z-10">
          {/* Link pill */}
          <div className="flex justify-center">
            <div
              className="flex flex-wrap items-center justify-center gap-1 p-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "var(--shadow-hair)",
              }}
            >
              {navGroups.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-4 py-2 rounded-full text-[13.5px] font-medium transition-colors"
                  style={{ color: "var(--ink-600)" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Oversized wordmark — the reference's "GET IN TOUCH" moment */}
          <div className="mt-14 mb-10 select-none flex justify-center">
            <span
              className="leading-none text-center"
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "clamp(4rem, 17vw, 13rem)",
                fontWeight: 400,
                letterSpacing: "-0.035em",
                color: "rgba(255,255,255,0.66)",
                textShadow: "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              Anvay
            </span>
          </div>

          {/* Socials */}
          <div className="flex justify-center gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex items-center justify-center rounded-full transition-transform hover:-translate-y-0.5"
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  color: "var(--ink-700)",
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Legal row */}
          <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.55)" }}
          >
            <div className="flex items-center gap-3">
              <Wordmark size={17} href={null} />
              <span className="text-[13px]" style={{ color: "var(--ink-500)" }}>
                © 2026
              </span>
            </div>
            <div className="flex items-center gap-5 text-[13px]">
              <Link href="#" style={{ color: "var(--ink-600)" }}>
                Privacy
              </Link>
              <Link href="#" style={{ color: "var(--ink-600)" }}>
                Terms
              </Link>
              <Link
                href="/chat/new"
                className="inline-flex items-center gap-1.5"
                style={{ color: "var(--blue-600)" }}
              >
                Try Anvay
                <Icon name="arrowUpRight" size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
