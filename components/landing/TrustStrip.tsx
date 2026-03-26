const stats = [
  { value: "10K+", label: "Research Queries" },
  { value: "50+", label: "Source Integrations" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 3s", label: "Average Response" },
];

export default function TrustStrip() {
  return (
    <section className="py-12 border-y border-[var(--divider-grey)] bg-white">
      <div className="section-container">
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-3xl font-extrabold text-[var(--primary-indigo)]">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--text-slate)] opacity-60 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
