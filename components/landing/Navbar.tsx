import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[var(--divider-grey)]">
      <div className="section-container h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/asset/logo.png"
            alt="Anvay AI"
            width={36}
            height={36}
            style={{ height: "auto" }}
            className="rounded-lg"
          />
          <span className="font-display font-bold text-xl tracking-tight text-[var(--primary-indigo)]">
            Anvay AI
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--text-slate)]">
          <Link href="#features" className="hover:text-[var(--primary-indigo)] transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-[var(--primary-indigo)] transition-colors">
            How It Works
          </Link>
          <Link href="#use-cases" className="hover:text-[var(--primary-indigo)] transition-colors">
            Use Cases
          </Link>
          <Link href="#security" className="hover:text-[var(--primary-indigo)] transition-colors">
            Security
          </Link>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-semibold text-[var(--primary-indigo)] hover:bg-[var(--bg-deep)] rounded-full transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 text-sm font-semibold text-white rounded-full btn-indigo"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
