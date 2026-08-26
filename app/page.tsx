import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ValueCards from "@/components/landing/ValueCards";
import HowItWorks from "@/components/landing/HowItWorks";
import LiveDemo from "@/components/landing/LiveDemo";
import Deliverables from "@/components/landing/Deliverables";
import Comparison from "@/components/landing/Comparison";
import TrustSection from "@/components/landing/TrustSection";
import Audience from "@/components/landing/Audience";
import CTASection from "@/components/landing/CTASection";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main data-theme="light" style={{ background: "var(--paper)" }}>
      <Navbar />
      <Hero />
      <ValueCards />
      <HowItWorks />
      <LiveDemo />
      <Deliverables />
      <Comparison />
      <TrustSection />
      <Audience />
      <CTASection />
      <FAQ />
      <Footer />
    </main>
  );
}
