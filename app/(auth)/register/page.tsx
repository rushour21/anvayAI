import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
        <Image
          src="/asset/logo.png"
          alt="Anvay AI"
          width={40}
          height={40}
          className="rounded-xl"
        />
        <span className="font-display font-bold text-2xl tracking-tight text-[#1A1F3C]">
          Anvay AI
        </span>
      </Link>

      <div className="w-full max-w-[480px] surface-card p-10 rounded-[32px] border border-[#E2E8F0]/50 shadow-medium animate-fade-up">
        <h1 className="text-3xl font-display font-extrabold text-[#1A1F3C] mb-2">Create your account</h1>
        <p className="text-[#4A4A4A] opacity-70 mb-8 font-medium">Start your journey into deep-agent intelligence today.</p>
        
        <form className="space-y-5" action="/chat/new">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">First name</label>
              <input 
                type="text" 
                placeholder="Jane"
                className="w-full px-5 py-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">Last name</label>
              <input 
                type="text" 
                placeholder="Doe"
                className="w-full px-5 py-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">Email address</label>
            <input 
              type="email" 
              placeholder="jane@company.com"
              className="w-full px-5 py-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
              required
            />
          </div>
          <div className="px-1 pt-1">
             <p className="text-[12px] text-[#4A4A4A] opacity-60 leading-relaxed font-medium">
               By creating an account, you agree to our <Link href="#" className="underline hover:text-[#1A1F3C]">Terms of Service</Link> and <Link href="#" className="underline hover:text-[#1A1F3C]">Privacy Policy</Link>.
             </p>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-[#1A1F3C] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all btn-indigo mt-4"
          >
            Create account
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-[#4A4A4A] font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C5A039] font-bold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-[#4A4A4A] opacity-40 font-semibold tracking-wide uppercase">
        Advanced Multi-Agent Orchestration
      </p>
    </div>
  );
}
