import Image from "next/image";


export default function SidebarLogo({ isDark = false }: { isDark?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex-shrink-0">
        <Image
          src="/asset/logo.png"
          alt="Anvay AI Logo"
          width={34}
          height={34}
          className="rounded-lg object-contain"
        />
      </div>
      <span
        className="font-bold tracking-tight"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 19,
          color: isDark ? "#FFFFFF" : "var(--text-primary)",
        }}
      >
        Anvay AI
      </span>
    </div>
  );
}
