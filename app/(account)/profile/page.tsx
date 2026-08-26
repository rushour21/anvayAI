"use client";

import Icon from "@/components/ui/Icon";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { getInitials } from "@/lib/initials";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[17px] font-semibold" style={{ color: "var(--ink-900)" }}>
        {value}
      </p>
      <p className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-400)" }}>
        {label}
      </p>
    </div>
  );
}

function formatMonthYear(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const chatCount = useChatStore((s) => s.chatHistory.length);

  if (!user) return null;

  return (
    <div className="mx-auto px-6 py-10" style={{ maxWidth: 480 }}>
      <div className="text-center">
        <span
          className="mx-auto rounded-full flex items-center justify-center text-white text-[22px] font-semibold"
          style={{
            width: 72,
            height: 72,
            background: "linear-gradient(140deg, var(--blue-400) 0%, var(--blue-600) 100%)",
          }}
        >
          {getInitials(user.name)}
        </span>
        <h1 className="mt-4 text-[19px] font-semibold" style={{ color: "var(--ink-900)" }}>
          {user.name}
        </h1>
        <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-500)" }}>
          {user.email}
        </p>
        <span
          className="inline-flex items-center gap-1.5 mt-3 pl-2.5 pr-3 py-1 rounded-full text-[12px] font-medium"
          style={{ background: "var(--blue-50)", color: "var(--blue-700)" }}
        >
          <Icon name="star" size={11} />
          {user.plan === "pro" ? "Pro plan" : "Free plan"}
        </span>
      </div>

      <div
        className="mt-8 py-4 flex items-center"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}
      >
        <Stat label="Chats" value={String(chatCount)} />
        <div style={{ width: 1, height: 32, background: "var(--line-soft)" }} />
        <Stat label="Documents" value="0" />
        <div style={{ width: 1, height: 32, background: "var(--line-soft)" }} />
        <Stat label="Member since" value={formatMonthYear(user.createdAt)} />
      </div>
    </div>
  );
}
