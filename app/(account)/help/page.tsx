import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function HelpPage() {
  return (
    <div className="mx-auto px-6 py-10" style={{ maxWidth: 560 }}>
      <h1 className="text-[22px] font-semibold" style={{ color: "var(--ink-900)" }}>
        Help
      </h1>
      <p className="mt-1 text-[13px]" style={{ color: "var(--ink-500)" }}>
        Support isn&apos;t live yet — start with the common questions below.
      </p>

      <Link
        href="/#faq"
        className="mt-6 flex items-center gap-3 px-4 py-3.5 transition-colors duration-150"
        style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--blue-200)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
      >
        <span
          className="flex items-center justify-center rounded-xl shrink-0"
          style={{ width: 36, height: 36, background: "var(--blue-50)", color: "var(--blue-600)" }}
        >
          <Icon name="message" size={16} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[13.5px] font-medium" style={{ color: "var(--ink-800)" }}>
            Frequently asked questions
          </span>
          <span className="block text-[12px]" style={{ color: "var(--ink-400)" }}>
            What Anvay covers, your data, and pricing
          </span>
        </span>
        <Icon name="arrowRight" size={14} style={{ color: "var(--ink-300)" }} />
      </Link>
    </div>
  );
}
