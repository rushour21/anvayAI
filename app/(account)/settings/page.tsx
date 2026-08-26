"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chatStore";
import { MODELS } from "@/constants/models";
import ModelOption from "@/components/topbar/ModelOption";
import ThemeSegment from "@/components/settings/ThemeSegment";
import Switch from "@/components/settings/Switch";
import Icon, { type IconName } from "@/components/ui/Icon";

type SectionId = "account" | "model" | "notifications" | "appearance" | "billing" | "data";

const SECTIONS: { id: SectionId; label: string; icon: IconName }[] = [
  { id: "account", label: "Account", icon: "users" },
  { id: "model", label: "Default model", icon: "brain" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "appearance", label: "Appearance", icon: "sun" },
  { id: "billing", label: "Plan and billing", icon: "star" },
  { id: "data", label: "Data", icon: "document" },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-[12.5px]" style={{ color: "var(--ink-400)" }}>
        {label}
      </span>
      <span className="text-[13px] font-medium truncate" style={{ color: "var(--ink-800)" }}>
        {value}
      </span>
    </div>
  );
}

function Card({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  return (
    <div
      className={padded ? "px-4" : "p-1.5"}
      style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line-soft)" }} />;
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-[13px] font-medium" style={{ color: "var(--ink-800)" }}>
          {title}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--ink-400)" }}>
          {description}
        </p>
      </div>
      {control}
    </div>
  );
}

function DisabledButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      disabled
      className="px-3.5 py-1.5 rounded-full text-[12.5px] font-medium cursor-not-allowed shrink-0"
      style={{ background: "var(--paper-sunk)", color: "var(--ink-400)" }}
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>("account");
  const selectedModel = useChatStore((s) => s.selectedModel);
  const setSelectedModel = useChatStore((s) => s.setSelectedModel);
  const [productUpdates, setProductUpdates] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <div className="mx-auto flex" style={{ maxWidth: 880 }}>
      {/* Left nav — plain page content, not an overlay */}
      <nav className="shrink-0 px-4 py-10" style={{ width: 220 }}>
        <h1 className="px-2 text-[18px] font-semibold" style={{ color: "var(--ink-900)" }}>
          Settings
        </h1>
        <div className="mt-5 flex flex-col gap-0.5">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer"
                style={{
                  background: isActive ? "var(--surface)" : "transparent",
                  border: `1px solid ${isActive ? "var(--line)" : "transparent"}`,
                  boxShadow: isActive ? "var(--shadow-hair)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--paper-sunk)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon
                  name={s.icon}
                  size={15}
                  style={{ color: isActive ? "var(--blue-500)" : "var(--ink-400)" }}
                />
                <span
                  className="text-[13px]"
                  style={{
                    color: isActive ? "var(--ink-900)" : "var(--ink-600)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Divider between nav and content */}
      <div style={{ width: 1, background: "var(--line)" }} />

      {/* Content — only the active section, no modal, just a route */}
      <div className="flex-1 min-w-0 px-8 py-10">
        {active === "account" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Account
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              Your basic account details.
            </p>
            <Card>
              <Row label="Name" value="Rushabh Ingle" />
              <Divider />
              <Row label="Email" value="rushabh.ingle2111@gmail.com" />
              <Divider />
              <Row label="Plan" value="Pro" />
            </Card>
            {/* No backend yet — account fields are read-only until auth lands. */}
          </section>
        )}

        {active === "model" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Default model
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              Used for new chats. You can still switch models per conversation.
            </p>
            <Card padded={false}>
              <div className="flex flex-col gap-0.5">
                {MODELS.map((model) => (
                  <ModelOption
                    key={model.id}
                    model={model}
                    isSelected={selectedModel.id === model.id}
                    onClick={() => setSelectedModel(model)}
                  />
                ))}
              </div>
            </Card>
          </section>
        )}

        {active === "notifications" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Notifications
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              What Anvay can email you about.
            </p>
            <Card>
              <SettingRow
                title="Product updates"
                description="New features and changes, sent occasionally."
                control={
                  <Switch checked={productUpdates} onChange={setProductUpdates} label="Product updates" />
                }
              />
              <Divider />
              <SettingRow
                title="Weekly research digest"
                description="A summary of what changed in companies you've researched."
                control={
                  <Switch checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly research digest" />
                }
              />
            </Card>
          </section>
        )}

        {active === "appearance" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Appearance
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              Choose how Anvay looks on this device.
            </p>
            <Card>
              <SettingRow
                title="Theme"
                description="Light or dark — applies immediately."
                control={<ThemeSegment />}
              />
            </Card>
          </section>
        )}

        {active === "billing" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Plan and billing
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              Manage your subscription.
            </p>
            <Card>
              <SettingRow
                title="Pro plan"
                description="Billing isn't live yet."
                control={<DisabledButton>Manage</DisabledButton>}
              />
            </Card>
          </section>
        )}

        {active === "data" && (
          <section>
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--ink-900)" }}>
              Data
            </h2>
            <p className="mt-1 mb-4 text-[13px]" style={{ color: "var(--ink-500)" }}>
              Your chats and uploaded documents.
            </p>
            <Card>
              <SettingRow
                title="Export your data"
                description="Download your chats and uploaded documents."
                control={<DisabledButton>Coming soon</DisabledButton>}
              />
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}
