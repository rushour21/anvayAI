"use client";

import Link from "next/link";
import Icon, { type IconName } from "@/components/ui/Icon";

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

      <Link
        href="/login"
        onClick={onClose}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-colors duration-150"
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
      </Link>
    </div>
  );
}
