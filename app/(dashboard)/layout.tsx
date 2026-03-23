import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* App grid: sidebar | main */}
      <div
        className="relative grid h-full"
        style={{
          gridTemplateColumns: "280px 1fr",
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main column */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <Topbar />
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
