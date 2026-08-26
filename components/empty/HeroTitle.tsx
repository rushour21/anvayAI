export default function HeroTitle() {
  return (
    <div className="text-center animate-fade-up">
      <h1
        className="display-md"
        style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.15rem)" }}
      >
        What do you want to{" "}
        <span className="serif-accent serif-accent-blue">understand?</span>
      </h1>
      <p
        className="mt-2 mx-auto text-[13.5px]"
        style={{ color: "var(--ink-500)", maxWidth: "44ch" }}
      >
        Ask about a company, a filing, or your own documents — every answer comes
        with its source.
      </p>
    </div>
  );
}
