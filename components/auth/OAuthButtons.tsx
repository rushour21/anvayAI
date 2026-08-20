import GoogleMark from "@/components/ui/GoogleMark";

/**
 * Provider sign-in. The button is a plain <button> with no handler until
 * Auth.js lands in Phase 1 — at that point this becomes a server action
 * calling `signIn("google")`. It is deliberately not wired to a fake
 * endpoint in the meantime.
 */
export default function OAuthButtons({ label }: { label: string }) {
  return (
    <>
      <button
        type="button"
        disabled
        title="Google sign-in arrives with Phase 1 (Auth.js)"
        className="btn btn-ghost w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <GoogleMark size={17} />
        {label}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-5" aria-hidden="true">
        <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
        <span className="text-[12px]" style={{ color: "var(--ink-400)" }}>
          or
        </span>
        <span className="flex-1 h-px" style={{ background: "var(--line)" }} />
      </div>
    </>
  );
}
