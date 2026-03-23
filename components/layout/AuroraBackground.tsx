"use client";

export default function AuroraBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Sky blue blob — top-left */}
      <div
        className="animate-aurora-1 absolute rounded-full"
        style={{
          width: 900,
          height: 900,
          top: "-15%",
          left: "-10%",
          background: "radial-gradient(circle, var(--aurora-blue) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.7,
        }}
      />
      {/* Lavender blob — center */}
      <div
        className="animate-aurora-2 absolute rounded-full"
        style={{
          width: 850,
          height: 850,
          top: "20%",
          left: "30%",
          background: "radial-gradient(circle, var(--aurora-lavender) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.6,
        }}
      />
      {/* Sage mint blob — bottom-right */}
      <div
        className="animate-aurora-3 absolute rounded-full"
        style={{
          width: 950,
          height: 950,
          bottom: "-20%",
          right: "-10%",
          background: "radial-gradient(circle, var(--aurora-mint) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.7,
        }}
      />
      {/* Warm peach blob — top-right */}
      <div
        className="animate-aurora-4 absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          top: "-5%",
          right: "5%",
          background: "radial-gradient(circle, var(--aurora-peach) 0%, transparent 70%)",
          filter: "blur(80px)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
