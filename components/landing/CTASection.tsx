"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  /* No backend yet — this only acknowledges locally so the UI is honest
     about what it does. Wire to the waitlist endpoint when it exists. */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setDone(true);
  };

  return (
    <section className="pb-4">
      <div className="section-container">
        <div className="surface-wash relative overflow-hidden px-6 py-16 sm:px-14 text-center">
          <div
            className="orb orb-3"
            style={{
              width: 420,
              height: 420,
              right: "-8%",
              bottom: "-45%",
              background: "radial-gradient(circle, rgba(109,147,240,0.35) 0%, transparent 68%)",
            }}
          />

          <div className="relative z-10">
            <h2 className="display-md" style={{ maxWidth: "20ch", margin: "0 auto" }}>
              Work smarter and faster{" "}
              <span className="serif-accent serif-accent-blue">with Anvay.</span>
            </h2>
            <p className="lede mt-4 mx-auto" style={{ maxWidth: "48ch" }}>
              Join the early access list. We&apos;re onboarding researchers, students,
              and teams in small batches.
            </p>

            <form onSubmit={submit} className="mt-8 mx-auto" style={{ maxWidth: 460 }}>
              <div
                className="flex items-center gap-2 pl-5 pr-1.5 py-1.5"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: 999,
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  disabled={done}
                  className="flex-1 bg-transparent outline-none text-[14.5px] min-w-0"
                  style={{ color: "var(--ink-900)" }}
                />
                <button
                  type="submit"
                  aria-label="Join the early access list"
                  className="btn-orb shrink-0"
                  style={{ width: 38, height: 38 }}
                  disabled={done}
                >
                  <Icon name={done ? "check" : "arrowUpRight"} size={16} />
                </button>
              </div>
              <p
                className="text-[12.5px] mt-3"
                style={{ color: done ? "var(--blue-600)" : "var(--ink-400)" }}
                role={done ? "status" : undefined}
              >
                {done
                  ? "You're on the list — we'll be in touch."
                  : "No spam. Unsubscribe any time."}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
