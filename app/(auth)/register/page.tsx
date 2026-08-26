"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import Icon from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password });
      router.push("/chat/new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      data-theme="light"
      className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      style={{ background: "var(--paper)" }}
    >
      <div
        className="orb orb-1"
        style={{
          width: 640,
          height: 640,
          top: "-22%",
          right: "-14%",
          background: "radial-gradient(circle, rgba(146,176,246,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb orb-2"
        style={{
          width: 560,
          height: 560,
          bottom: "-24%",
          left: "-12%",
          background: "radial-gradient(circle, rgba(180,201,250,0.42) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 460 }}>
        <Wordmark size={26} />

        <div className="surface-card w-full p-8 mt-8 animate-fade-up" style={{ borderRadius: 24 }}>
          <h1 className="text-[26px] font-semibold tracking-tight">Create your account</h1>
          <p className="text-[14px] mt-1.5 mb-7" style={{ color: "var(--ink-500)" }}>
            Free while we&apos;re in early access.
          </p>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <label className="field-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                placeholder="Jane Doe"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="jane@company.com"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </div>

            {error && (
              <p className="text-[13px]" style={{ color: "#B3261E" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account…" : "Create account"}
              {!submitting && <Icon name="arrowRight" size={16} />}
            </button>

            <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-400)" }}>
              By creating an account you agree to our{" "}
              <Link href="#" className="underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <p
            className="text-[13.5px] text-center mt-7 pt-6"
            style={{ color: "var(--ink-500)", borderTop: "1px solid var(--line)" }}
          >
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--blue-600)" }}>
              Sign in
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="text-[13px] mt-7"
          style={{ color: "var(--ink-400)" }}
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
