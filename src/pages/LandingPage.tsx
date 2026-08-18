import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import ValueSection from "@/components/landing/ValueSection";
import WhyUsSection from "@/components/landing/WhyUsSection";
import RentalsSection from "@/components/landing/RentalsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import HelpSection from "@/components/landing/HelpSection";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * The public landing page.
 *
 * Composition only — every section owns its own data and copy, so this file
 * stays readable as sections are added, reordered or dropped.
 */
const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <LandingHeader />
    <main>
      <LandingHero />
      <ValueSection />
      <WhyUsSection />
      <RentalsSection />
      <HowItWorksSection />
      <HelpSection />
    </main>
    <LandingFooter />
  </div>
);

export default LandingPage;
