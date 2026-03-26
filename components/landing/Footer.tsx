import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-[var(--divider-grey)] bg-white">
      <div className="section-container flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/asset/logo.png"
            alt="Anvay AI"
            width={28}
            height={28}
            style={{ height: "auto" }}
            className="rounded-lg"
          />
          <span className="font-display font-bold text-lg text-[var(--primary-indigo)]">
            Anvay AI
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-[var(--text-slate)] opacity-60">
          © 2026 Anvay AI. All rights reserved.
        </p>

        {/* Links */}
        <div className="flex gap-6 text-sm font-semibold text-[var(--text-slate)]">
          <Link href="#" className="hover:text-[var(--primary-indigo)] transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-[var(--primary-indigo)] transition-colors">
            Terms
          </Link>
          <Link href="#" className="hover:text-[var(--primary-indigo)] transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
