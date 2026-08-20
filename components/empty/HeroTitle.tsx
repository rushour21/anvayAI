export default function HeroTitle() {
  return (
    <div className="text-center animate-fade-up">
      <h1
        className="display-md"
        style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)" }}
      >
        What do you want to{" "}
        <span className="serif-accent serif-accent-blue">understand?</span>
      </h1>
      <p
        className="mt-3 mx-auto text-[15px]"
        style={{ color: "var(--ink-500)", maxWidth: "46ch" }}
      >
        Pick the agents you want on the job, then ask. They&apos;ll search, check
        each other, and cite what they find.
      </p>
    </div>
  );
}
