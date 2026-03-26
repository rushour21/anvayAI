import Link from "next/link";

export default function CTASection() {
  return (
    <section className="section-padding bg-[var(--bg-deep)]">
      <div className="section-container text-center">
        <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[var(--primary-indigo)] mb-6 leading-tight">
          Ready to transform how <br className="hidden sm:block" />
          you discover knowledge?
        </h2>
        <p className="max-w-xl mx-auto text-lg text-[var(--text-slate)] opacity-70 mb-10">
          Join thousands of researchers, students, and teams who trust Anvay AI for faster, deeper, verified insights.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-10 py-4 text-base font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all btn-indigo"
          >
            Join Waitlist
          </Link>
          <Link
            href="/chat/new"
            className="w-full sm:w-auto px-10 py-4 text-base font-bold text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all btn-gold"
          >
            Try Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
