import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import RightPanel from "@/components/layout/RightPanel";
import AuthGuard from "@/components/auth/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-dvh overflow-hidden" style={{ background: "var(--paper)" }}>
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <Topbar />
          <main className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {children}
          </main>
        </div>
        <RightPanel />
      </div>
    </AuthGuard>
  );
}
