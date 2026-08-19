import LandingHeader from "@/components/landing/LandingHeader";
import MergedHero from "@/components/landing/MergedHero";
import DoorsSection from "@/components/landing/DoorsSection";
import FunnelSection from "@/components/landing/FunnelSection";
import RentalsSection from "@/components/landing/RentalsSection";
import DailySection from "@/components/landing/DailySection";
import OwnersSection from "@/components/landing/OwnersSection";
import FaqSection from "@/components/landing/FaqSection";
import HelpSection from "@/components/landing/HelpSection";
import LandingFooter from "@/components/landing/LandingFooter";

/**
 * The merged landing page.
 *
 * Assembled from the three sites it replaces rather than written fresh: Coming
 * Soon Home Rentals supplies the promise, the funnel, the owner pitch and the
 * questions; Irvine Living Daily supplies the three-doors framing and the daily
 * slot; Good Tenants supplies the reusable profile running through both.
 *
 * Composition only. Each section owns its copy and its data.
 */
const LandingPage = () => (
  <div className="min-h-screen bg-background">
    <LandingHeader />
    <main>
      <MergedHero />
      <DoorsSection />
      <FunnelSection />
      <RentalsSection />
      <DailySection />
      <OwnersSection />
      <FaqSection />
      <HelpSection />
    </main>
    <LandingFooter />
  </div>
);

export default LandingPage;
