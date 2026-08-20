"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

/* Honest substitute for the usual fake client-logo row: the model
   providers Anvay actually routes to. */
const PROVIDERS = ["Anthropic", "OpenAI", "Google DeepMind", "Meta AI", "Mistral", "Cohere"];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/chat/new?q=${encodeURIComponent(q)}` : "/chat/new");
  };

  return (
    <section className="relative">
      <div
        className="hero-wash relative overflow-hidden"
        style={{ minHeight: "min(100vh, 920px)" }}
      >
        {/* ── Atmosphere ────────────────────────────────────── */}
        <div className="petal-field absolute inset-0 overflow-hidden">
          {/* Left petals */}
          <div
            className="petal petal-l"
            style={{
              width: "clamp(280px, 34vw, 560px)",
              height: "clamp(340px, 42vw, 680px)",
              top: "-14%",
              left: "-13%",
              opacity: 0.92,
            }}
          />
          <div
            className="petal petal-l"
            style={{
              width: "clamp(160px, 18vw, 300px)",
              height: "clamp(180px, 22vw, 360px)",
              top: "34%",
              left: "-7%",
              opacity: 0.6,
              animationDelay: "-8s",
            }}
          />
          {/* Right petals */}
          <div
            className="petal petal-r"
            style={{
              width: "clamp(240px, 28vw, 460px)",
              height: "clamp(300px, 36vw, 580px)",
              top: "6%",
              right: "-12%",
              opacity: 0.88,
            }}
          />
          <div
            className="petal petal-r"
            style={{
              width: "clamp(140px, 16vw, 260px)",
              height: "clamp(160px, 19vw, 310px)",
              top: "46%",
              right: "-5%",
              opacity: 0.55,
              animationDelay: "-11s",
            }}
          />

          {/* Soft diffusion so the petals melt into the wash */}
          <div
            className="orb orb-1"
            style={{
              width: 620,
              height: 620,
              left: "-8%",
              top: "10%",
              background:
                "radial-gradient(circle, rgba(146,176,246,0.55) 0%, transparent 68%)",
            }}
          />
          <div
            className="orb orb-2"
            style={{
              width: 560,
              height: 560,
              right: "-6%",
              top: "18%",
              background:
                "radial-gradient(circle, rgba(180,201,250,0.5) 0%, transparent 68%)",
            }}
          />
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className="relative z-10 section-container flex flex-col items-center text-center pt-32 pb-14">
          <div className="animate-fade-up">
            <span className="pill-badge">
              <Icon name="sparkle" size={13} />
              Multi-agent intelligence
            </span>
          </div>

          <h1
            className="display-xl mt-7 animate-fade-up delay-1"
            style={{ color: "var(--ink-900)", maxWidth: 940 }}
          >
            Search. Verify.{" "}
            <span className="serif-accent">Understand.</span>
            <br />
            All in One{" "}
            <span className="serif-accent serif-accent-blue">AI Workspace.</span>
          </h1>

          <p
            className="lede mt-6 animate-fade-up delay-2"
            style={{ maxWidth: "58ch", color: "var(--ink-600)" }}
          >
            Anvay runs a team of specialised agents on every question — they search,
            read, cross-check, and synthesise, so you get a cited answer instead of ten
            blue links.
          </p>

          <div className="mt-8 animate-fade-up delay-3">
            <Link href="/register" className="btn btn-primary px-6 py-3">
              Start free
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          {/* ── Prompt bar ──────────────────────────────────── */}
          <form
            onSubmit={submit}
            className="w-full mt-10 animate-fade-up delay-4"
            style={{ maxWidth: 620 }}
          >
            <div
              className="flex items-center gap-3 pl-4 pr-2 py-2"
              style={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: 999,
                boxShadow: "var(--shadow-medium)",
              }}
            >
              {/* Prism mark — the one place colour beyond blue is allowed,
                  signalling "many models behind one box". */}
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  background:
                    "conic-gradient(from 210deg, #3B6EF5, #8B5CF0, #0E9AA7, #3B6EF5)",
                  filter: "blur(0.2px)",
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything — agents will collaborate on it"
                aria-label="Ask a question"
                className="flex-1 bg-transparent outline-none text-[15px] min-w-0"
                style={{ color: "var(--ink-900)" }}
              />
              <button
                type="submit"
                aria-label="Send"
                className="btn-orb shrink-0"
                style={{ width: 38, height: 38 }}
              >
                <Icon name="arrowUp" size={17} />
              </button>
            </div>
          </form>

          {/* ── Provider marquee ────────────────────────────── */}
          <div className="w-full mt-16 animate-fade-in delay-5">
            <p
              className="text-[13px] mb-6"
              style={{ color: "var(--ink-600)", opacity: 0.75 }}
            >
              One workspace, every frontier model
            </p>
            <div className="relative overflow-hidden mask-fade-x">
              <div className="flex animate-marquee w-max">
                {[0, 1].map((dup) => (
                  <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
                    {PROVIDERS.map((name) => (
                      <span
                        key={`${dup}-${name}`}
                        className="font-display px-8 sm:px-12 whitespace-nowrap"
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          color: "var(--ink-700)",
                          opacity: 0.42,
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
