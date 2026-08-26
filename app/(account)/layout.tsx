import Wordmark from "@/components/ui/Wordmark";
import BackToChat from "@/components/layout/BackToChat";
import AuthGuard from "@/components/auth/AuthGuard";

/* A standalone shell for account pages (settings, profile, help) — no
   sidebar, no chat topbar. These aren't part of the workspace, so they
   don't borrow its chrome. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-dvh" style={{ background: "var(--paper)" }}>
        <header
          className="flex items-center justify-between px-6"
          style={{ height: 60, borderBottom: "1px solid var(--line)", background: "var(--surface)" }}
        >
          <Wordmark size={19} href="/chat/new" />
          <BackToChat />
        </header>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
