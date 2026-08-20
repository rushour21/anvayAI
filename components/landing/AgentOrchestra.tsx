import Icon from "@/components/ui/Icon";
import { AGENT_MAP, PIPELINE_ORDER } from "@/constants/agents";

export default function AgentOrchestra() {
  return (
    <section id="agents" className="section-padding" style={{ background: "var(--paper-alt)" }}>
      <div className="section-container">
        <div className="section-head">
          <span className="pill-badge">
            <Icon name="sparkle" size={13} />
            The orchestra
          </span>
          <h2 className="display-lg">
            One question, <span className="serif-accent serif-accent-blue">seven specialists.</span>
          </h2>
          <p className="lede">
            Most tools send your prompt to a single model. Anvay decomposes it and
            routes each part to the agent best suited to it.
          </p>
        </div>

        {/* ── Pipeline rail ─────────────────────────────────── */}
        <div className="mt-14 overflow-x-auto pb-2 mask-fade-x">
          <div className="flex items-center justify-start md:justify-center gap-0 min-w-max px-6">
            {PIPELINE_ORDER.map((role, i) => {
              const a = AGENT_MAP[role];
              return (
                <div key={role} className="flex items-center">
                  <div
                    className="flex flex-col items-center gap-2 animate-fade-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <span
                      className="flex items-center justify-center rounded-2xl"
                      style={{
                        width: 46,
                        height: 46,
                        background: "var(--surface)",
                        border: "1px solid var(--line)",
                        boxShadow: "var(--shadow-soft)",
                        color: a.color,
                      }}
                    >
                      <Icon name={a.icon} size={20} />
                    </span>
                    <span
                      className="text-[11px] font-medium whitespace-nowrap"
                      style={{ color: "var(--ink-500)" }}
                    >
                      {a.label}
                    </span>
                  </div>
                  {i < PIPELINE_ORDER.length - 1 && (
                    <span
                      className="mb-6 mx-1.5 shrink-0"
                      style={{
                        width: 26,
                        height: 1.5,
                        background:
                          "linear-gradient(90deg, var(--ink-200), var(--blue-300))",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Agent cards ───────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {PIPELINE_ORDER.map((role, i) => {
            const a = AGENT_MAP[role];
            return (
              <article
                key={role}
                className="surface-card card-hover p-6 animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex items-center gap-3 mb-3.5">
                  <span
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{
                      width: 38,
                      height: 38,
                      background: "var(--paper-sunk)",
                      color: a.color,
                    }}
                  >
                    <Icon name={a.icon} size={18} />
                  </span>
                  <h3 className="text-[16px] font-semibold">{a.label}</h3>
                  <span
                    className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: "var(--paper-sunk)", color: "var(--ink-400)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-500)" }}>
                  {a.blurb}
                </p>
              </article>
            );
          })}

          {/* Trailing note card — fills the 8th cell instead of leaving a hole */}
          <article
            className="surface-blue p-6 flex flex-col justify-center animate-fade-up"
            style={{ animationDelay: "0.42s" }}
          >
            <Icon name="zap" size={20} style={{ color: "#fff", opacity: 0.9 }} />
            <h3 className="text-[16px] font-semibold mt-3" style={{ color: "#fff" }}>
              Only what&apos;s needed
            </h3>
            <p className="text-[13.5px] leading-relaxed mt-1.5" style={{ color: "var(--text-on-blue-dim)" }}>
              A simple question skips straight to synthesis. You pay for the agents
              that actually run.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
