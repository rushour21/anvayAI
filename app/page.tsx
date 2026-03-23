import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-[#C5A039]/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/asset/logo.png"
              alt="Anvay AI"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-display font-bold text-xl tracking-tight text-[#1A1F3C]">
              Anvay AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#4A4A4A]">
            <Link href="#features" className="hover:text-[#1A1F3C] transition-colors">Features</Link>
            <Link href="#solutions" className="hover:text-[#1A1F3C] transition-colors">Solutions</Link>
            <Link href="#pricing" className="hover:text-[#1A1F3C] transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-[#1A1F3C] hover:bg-gray-50 rounded-full transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1A1F3C] rounded-full hover:shadow-lg transition-all btn-indigo"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A039]/10 border border-[#C5A039]/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C5A039] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A039]">
              Next Generation Research
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl font-extrabold text-[#1A1F3C] leading-[1.05] tracking-tight mb-8">
             Deep insights through <br />
            <span className="text-[#C5A039]">Multi-Agent</span> intelligence.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-[#4A4A4A] opacity-80 leading-relaxed mb-10">
            Anvay AI orchestrates specialized autonomous agents to search, verify, and synthesize information—delivering clarity where others only provide links.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-[#1A1F3C] rounded-2xl shadow-xl hover:shadow-2xl transition-all btn-indigo"
            >
              Start Researching Free
            </Link>
            <Link 
              href="/chat/new" 
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-[#1A1F3C] bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-soft"
            >
              Deeper Exploration
            </Link>
          </div>

          {/* Hero Visual Placeholder */}
          <div className="mt-20 relative px-4">
            <div className="surface-card p-4 rounded-[32px] max-w-4xl mx-auto overflow-hidden shadow-medium border border-[#E2E8F0]/50 aspect-video relative">
               <div className="absolute inset-0 bg-[#F8F9FA] flex flex-col p-8">
                  <div className="flex gap-4 mb-8">
                    <div className="w-1/3 h-4 rounded bg-gray-200" />
                    <div className="w-1/4 h-4 rounded bg-gray-100" />
                  </div>
                  <div className="space-y-4">
                    <div className="w-full h-8 rounded-lg bg-white shadow-soft" />
                    <div className="w-5/6 h-8 rounded-lg bg-white shadow-soft" />
                    <div className="w-4/6 h-8 rounded-lg bg-white shadow-soft" />
                  </div>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex gap-2">
                       {[0,1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-[#1A1F3C]/5" />
                       ))}
                    </div>
                    <div className="w-32 h-10 rounded-full bg-[#C5A039]/20" />
                  </div>
               </div>
               {/* Accent glow behind visual */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-[#C5A039]/5 via-transparent to-[#1A1F3C]/5 -z-10 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A1F3C] flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A1F3C]">Autonomous Search</h3>
              <p className="text-[#4A4A4A] opacity-70">Our Research agents scour the live web to find the most relevant and up-to-date information for your query.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#C5A039] flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A1F3C]">Fact Verification</h3>
              <p className="text-[#4A4A4A] opacity-70">Every claim is cross-referenced by Validator agents to ensure accuracy and eliminate hallucinations.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#2D3250] flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-xl text-[#1A1F3C]">Intelligent Synthesis</h3>
              <p className="text-[#4A4A4A] opacity-70">Synthesizer agents transform raw data into clear, actionable insights structured for quick consumption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
             <Image src="/asset/logo.png" alt="Anvay AI" width={28} height={28} className="rounded-lg" />
             <span className="font-display font-bold text-lg text-[#1A1F3C]">Anvay AI</span>
           </div>
           <p className="text-sm text-[#4A4A4A] opacity-60">
             © 2026 Anvay AI. All rights reserved.
           </p>
           <div className="flex gap-6 text-sm font-semibold text-[#4A4A4A]">
             <Link href="#" className="hover:text-[#1A1F3C]">Privacy</Link>
             <Link href="#" className="hover:text-[#1A1F3C]">Terms</Link>
             <Link href="#" className="hover:text-[#1A1F3C]">Contact</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
