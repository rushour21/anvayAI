"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: IconName;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-150"
      style={{ color: "var(--ink-700)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--paper-sunk)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon name={icon} size={15} style={{ color: "var(--ink-400)" }} />
      {label}
    </Link>
  );
}

export default function UserMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = async () => {
    onClose();
    await signOut();
    router.push("/login");
  };

  return (
    <div
      role="menu"
      aria-label="Account menu"
      className="p-1.5"
      style={{
        width: 208,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        boxShadow: "var(--shadow-tall)",
      }}
    >
      <MenuLink href="/settings" icon="settings" label="Settings" onClick={onClose} />
      <MenuLink href="/profile" icon="users" label="Profile" onClick={onClose} />
      <MenuLink href="/help" icon="message" label="Help" onClick={onClose} />

      <div className="my-1.5" style={{ height: 1, background: "var(--line-soft)" }} />

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-150 text-left"
        style={{ color: "var(--ink-700)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--paper-sunk)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Icon name="logout" size={15} style={{ color: "var(--ink-400)" }} />
        Log out
      </button>
    </div>
  );
}
