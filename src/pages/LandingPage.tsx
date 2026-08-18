import { useRedirectAuthenticated } from "@/hooks/useRedirectAuthenticated";
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
 *
 * The one thing it does beyond composing: a signed-in account is sent to its
 * own dashboard. This page describes the product to someone who has not signed
 * up, and a tenant who arrives here has mistyped a URL or followed a stale
 * link — every second they spend reading the pitch is a second they are not
 * looking at their application.
 */
const LandingPage = () => {
  useRedirectAuthenticated();

  return (
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
};

export default LandingPage;
