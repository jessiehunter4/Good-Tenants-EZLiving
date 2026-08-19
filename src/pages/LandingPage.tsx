import SiteLayout from "@/components/site/SiteLayout";
import { LANDING_NAV } from "@/components/site/siteNav";

import HeroSection from "@/components/landing/HeroSection";
import UrgencySection from "@/components/landing/UrgencySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import RentalsSection from "@/components/landing/RentalsSection";
import DailySection from "@/components/landing/DailySection";
import OwnersSection from "@/components/landing/OwnersSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import FinalCtaSection from "@/components/landing/FinalCtaSection";

/**
 * The landing page.
 *
 * This is Coming Soon Home Rentals' landing page, carried across section by
 * section in its own order: hero and slider, the urgency argument, how it
 * works, why renters choose it, live listings, the owner pitch, the numbers,
 * what people say, the questions, and the split final call.
 *
 * An earlier version of this file was designed from scratch against an
 * unrelated reference site, while the app it was replacing already had a
 * landing page that worked and had been tuned against real traffic. That was
 * the mistake CLAUDE.md now opens with.
 *
 * Two sections are not from the rentals site, because it had nothing to carry:
 * the live listing row reads this app's own inventory, and the daily slot shows
 * the posts that came across from EZ Living Irvine.
 */
const LandingPage = () => (
  <SiteLayout nav={LANDING_NAV}>
    <HeroSection />
    <UrgencySection />
    <HowItWorksSection />
    <BenefitsSection />
    <RentalsSection />
    <DailySection />
    <OwnersSection />
    <StatsSection />
    <TestimonialsSection />
    <FaqSection />
    <FinalCtaSection />
  </SiteLayout>
);

export default LandingPage;
