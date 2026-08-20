import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import AgentOrchestra from "@/components/landing/AgentOrchestra";
import ModelsGrid from "@/components/landing/ModelsGrid";
import UseCases from "@/components/landing/UseCases";
import CTASection from "@/components/landing/CTASection";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main style={{ background: "var(--paper)" }}>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <AgentOrchestra />
      <ModelsGrid />
      <UseCases />
      <CTASection />
      <FAQ />
      <Footer />
    </main>
  );
}
