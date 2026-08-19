import SiteLayout from "@/components/site/SiteLayout";
import { LANDING_NAV } from "@/components/site/siteNav";
import MergedHero from "@/components/landing/MergedHero";
import DoorsSection from "@/components/landing/DoorsSection";
import FunnelSection from "@/components/landing/FunnelSection";
import RentalsSection from "@/components/landing/RentalsSection";
import DailySection from "@/components/landing/DailySection";
import OwnersSection from "@/components/landing/OwnersSection";
import FaqSection from "@/components/landing/FaqSection";
import HelpSection from "@/components/landing/HelpSection";

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
  <SiteLayout nav={LANDING_NAV}>
    <MergedHero />
    <DoorsSection />
    <FunnelSection />
    <RentalsSection />
    <DailySection />
    <OwnersSection />
    <FaqSection />
    <HelpSection />
  </SiteLayout>
);

export default LandingPage;
