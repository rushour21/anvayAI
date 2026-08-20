import Icon from "@/components/ui/Icon";
import { MODELS, PROVIDER_LABEL } from "@/constants/models";

export default function ModelsGrid() {
  return (
    <section id="models" className="section-padding">
      <div className="section-container">
        <div className="section-head">
          <span className="pill-badge">
            <Icon name="sparkle" size={13} />
            Models
          </span>
          <h2 className="display-lg">
            Every frontier model, <span className="serif-accent serif-accent-blue">one interface.</span>
          </h2>
          <p className="lede">
            Anthropic, OpenAI, and Google alongside open-weight models that cost
            nothing to run. Switch mid-conversation without losing context, or let
            the Gateway pick the cheapest model that can still answer correctly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {MODELS.map((m, i) => (
            <article
              key={m.id}
              className="surface-card card-hover p-5 animate-fade-up"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="flex items-center justify-center rounded-xl font-mono text-[13px] font-bold"
                  style={{
                    width: 36,
                    height: 36,
                    background: `color-mix(in srgb, ${m.iconColor} 12%, transparent)`,
                    color: m.iconColor,
                  }}
                >
                  {PROVIDER_LABEL[m.provider]?.[0] ?? m.provider[0].toUpperCase()}
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    color: m.tagColor,
                    background: `color-mix(in srgb, ${m.tagColor} 12%, transparent)`,
                  }}
                >
                  {m.tag}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-1.5">
                <h3 className="text-[15.5px] font-semibold">{m.name}</h3>
                <span className="text-[11px]" style={{ color: "var(--ink-400)" }}>
                  {PROVIDER_LABEL[m.provider]}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink-500)" }}>
                {m.description}
              </p>

              <div
                className="flex items-center gap-3 mt-4 pt-3 text-[11px] font-mono"
                style={{ borderTop: "1px solid var(--line-soft)", color: "var(--ink-400)" }}
              >
                <span>{m.contextK >= 1000 ? `${m.contextK / 1000}M` : `${m.contextK}K`} ctx</span>
                <span style={{ color: "var(--ink-200)" }}>|</span>
                <span>
                  {m.access === "local"
                    ? "self-hosted"
                    : m.access === "router"
                      ? "via router"
                      : "direct API"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
