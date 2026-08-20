import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import Icon from "@/components/ui/Icon";
import OAuthButtons from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Same atmosphere as the hero, dialled well down */}
      <div
        className="orb orb-1"
        style={{
          width: 640,
          height: 640,
          top: "-22%",
          left: "-14%",
          background: "radial-gradient(circle, rgba(146,176,246,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb orb-2"
        style={{
          width: 560,
          height: 560,
          bottom: "-24%",
          right: "-12%",
          background: "radial-gradient(circle, rgba(180,201,250,0.42) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center" style={{ maxWidth: 420 }}>
        <Wordmark size={26} />

        <div className="surface-card w-full p-8 mt-8 animate-fade-up" style={{ borderRadius: 24 }}>
          <h1 className="text-[26px] font-semibold tracking-tight">Welcome back</h1>
          <p className="text-[14px] mt-1.5 mb-7" style={{ color: "var(--ink-500)" }}>
            Pick up where your research left off.
          </p>

          <OAuthButtons label="Continue with Google" />

          <form className="flex flex-col gap-4" action="/chat/new">
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
                placeholder="you@company.com"
                className="field"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="field-label mb-0" htmlFor="password">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[12.5px] font-medium"
                  style={{ color: "var(--blue-600)" }}
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="field"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer mt-0.5">
              <input
                type="checkbox"
                className="rounded"
                style={{ accentColor: "var(--blue-600)", width: 15, height: 15 }}
              />
              <span className="text-[13.5px]" style={{ color: "var(--ink-500)" }}>
                Keep me signed in
              </span>
            </label>

            <button type="submit" className="btn btn-primary w-full py-3 mt-2">
              Sign in
              <Icon name="arrowRight" size={16} />
            </button>
          </form>

          <p
            className="text-[13.5px] text-center mt-7 pt-6"
            style={{ color: "var(--ink-500)", borderTop: "1px solid var(--line)" }}
          >
            New to Anvay?{" "}
            <Link href="/register" className="font-medium" style={{ color: "var(--blue-600)" }}>
              Create an account
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="text-[13px] mt-7 inline-flex items-center gap-1.5"
          style={{ color: "var(--ink-400)" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
