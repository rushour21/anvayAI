import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import ShowcasePanel from "@/components/landing/ShowcasePanel";
import HowItWorks from "@/components/landing/HowItWorks";
import UseCases from "@/components/landing/UseCases";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-deep)] selection:bg-[var(--secondary-gold)]/20">
      <Navbar />
      <Hero />
      <TrustStrip />
      <FeaturesGrid />
      <ShowcasePanel />
      <HowItWorks />
      <UseCases />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
