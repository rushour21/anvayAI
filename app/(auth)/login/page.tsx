import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-6">
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

      <div className="w-full max-w-[440px] surface-card p-10 rounded-[32px] border border-[#E2E8F0]/50 shadow-medium animate-fade-up">
        <h1 className="text-3xl font-display font-extrabold text-[#1A1F3C] mb-2">Welcome back</h1>
        <p className="text-[#4A4A4A] opacity-70 mb-8 font-medium">Continue your research journey with Anvay AI.</p>
        
        <form className="space-y-5" action="/chat/new">
          <div>
            <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">Email address</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1A1F3C] mb-2 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-5 py-4 rounded-2xl bg-[#F8F9FA] border border-gray-200 focus:border-[#C5A039] focus:ring-2 focus:ring-[#C5A039]/10 transition-all outline-none font-medium text-sm"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm px-1">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" className="rounded-md border-gray-300 text-[#1A1F3C] focus:ring-[#1A1F3C]" />
               <span className="text-[#4A4A4A] font-medium">Remember me</span>
             </label>
             <Link href="#" className="text-[#C5A039] font-bold hover:underline">Forgot password?</Link>
          </div>
          <button 
            type="submit" 
            className="w-full py-4 bg-[#1A1F3C] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all btn-indigo mt-4"
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-[#4A4A4A] font-medium">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#C5A039] font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-[#4A4A4A] opacity-40 font-semibold tracking-wide uppercase">
        Protected by Anvay Cloud Security
      </p>
    </div>
  );
}
