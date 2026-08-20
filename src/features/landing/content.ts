/**
 * The landing page's words.
 *
 * Every line here is carried from a live site, not written for this one. The
 * source is named on each block. Where a claim is a marketing number nobody
 * here has checked, it says so — see STATS and TESTIMONIALS.
 */

/** Source: Coming Soon Home Rentals, HeroSection. */
export const HERO = {
  title: "Find rental homes first",
  subtitle: "Fresh new and coming soon rental homes daily.",
  promise: "The best rentals go fast.",
  promiseParts: ["See first.", "Apply first.", "Get approved first."],
} as const;

/** Source: Coming Soon Home Rentals, UrgencySection. */
export const URGENCY = {
  heading: "The best rentals in the best locations don't last",
  intro:
    "Quality homes in desirable neighborhoods get multiple applications within hours of listing. To secure your ideal rental, you need to:",
  cards: [
    {
      icon: "eye",
      title: "See first",
      description:
        "Access exclusive coming soon and new listings, sometimes before they reach the big portals.",
    },
    {
      icon: "file",
      title: "Apply first",
      description:
        "Submit your application instantly with a reusable Good Tenants screening package.",
    },
    {
      icon: "check",
      title: "Get approved first",
      description:
        "Stand out to landlords who prioritise pre-qualified, prescreened, verified tenants.",
    },
  ],
} as const;

/** Source: Coming Soon Home Rentals, HowItWorks. */
export const STEPS = [
  {
    number: 1,
    title: "Get pre-qualified",
    description: "A few quick questions gets you started.",
  },
  {
    number: 2,
    title: "Browse exclusive listings",
    description: "Coming soon properties and new listings, daily.",
  },
  {
    number: 3,
    title: "Book showings instantly",
    description: "Schedule viewings on the site, without chasing a callback.",
  },
] as const;

/** Source: Coming Soon Home Rentals, TenantBenefits. */
export const BENEFITS = [
  {
    icon: "clock",
    title: "Early access",
    description: "See listings before they appear on public sites.",
  },
  {
    icon: "repeat",
    title: "Reusable application",
    description: "One screening package works for every listing here.",
  },
  {
    icon: "shield",
    title: "Verified properties",
    description: "Every listing comes from a licensed realtor or a verified landlord.",
  },
  {
    icon: "calendar",
    title: "Direct booking",
    description: "Schedule showings without waiting for a callback.",
  },
] as const;

/** Source: Coming Soon Home Rentals, LandlordSection. */
export const OWNERS = {
  heading: "For landlords and licensed realtors",
  subheading: "Fill vacancies faster with pre-qualified, prescreened tenants",
  intro:
    "Stop spending time on unqualified leads. Our prescreened tenants have verified income, checked credit, and are actively searching.",
  points: [
    "Reach tenants already pre-qualified for your listing",
    "Promote your coming soon properties to qualified applicants first",
    "New listings go out to the prescreened tenant network immediately",
  ],
} as const;

/**
 * Source: Coming Soon Home Rentals, StatsSection.
 *
 * UNVERIFIED. These are the numbers that site publishes today. Nobody here has
 * checked them against the database, and after the merge the database is right
 * there — so they should either be confirmed or computed.
 */
export const STATS = [
  { value: "500+", label: "Exclusive listings" },
  { value: "24hrs", label: "Average early access" },
  { value: "1,000+", label: "Prescreened tenants" },
  { value: "95%", label: "Faster lease time" },
] as const;

/**
 * Source: Coming Soon Home Rentals, TestimonialsSection.
 *
 * UNVERIFIED. Carried across because they are live on that site today, not
 * because anyone here has confirmed them. If they cannot be attributed to real
 * people who agreed to be quoted, this block should come out — a testimonial is
 * a claim about a person, and the site makes it in their name.
 */
export const TESTIMONIALS = [
  {
    quote:
      "I found my rental two days before it was listed anywhere else. Being pre-qualified made the whole process smooth.",
    name: "Sarah M.",
    role: "Tenant",
    location: "Los Angeles, CA",
  },
  {
    quote:
      "As a realtor this has been a game-changer. I can connect my coming soon listings with pre-qualified tenants instantly.",
    name: "Michael R.",
    role: "Licensed realtor",
    location: "Orange County, CA",
  },
  {
    quote:
      "No more chasing unqualified leads. Every enquiry from this site has been serious and pre-verified.",
    name: "David L.",
    role: "Property owner",
    location: "San Diego, CA",
  },
] as const;

/**
 * Source: Coming Soon Home Rentals, FAQSection.
 *
 * Each answer ends in a way forward — that page's FAQ is part of the funnel,
 * not a help article, and the buttons are why. Their destinations are this
 * app's routes; the questions and answers are theirs.
 */
export type LandingFaqItem = {
  question: string;
  answer: string;
  primary: { text: string; to: string };
  secondary: { text: string; to: string } | null;
};

export const FAQ: readonly LandingFaqItem[] = [
  {
    question: "What is ComingSoonHomeRentals.com?",
    answer: "<> Good Tenants EZ Living is a real-time rental listing platform that showcases upcoming and newly listed home rentals. Pre-qualified tenants can book showings and apply before rentals hit the open market. We connect ready-to-rent tenants with verified landlords and licensed real estate professionals.",
    primary: { text: "Browse Coming Soon Rentals", to: "/rentals" },
    secondary: { text: "Get Pre-Qualified for Early Access", to: "/prequalify" },
  },
  {
    question: "How do I get pre-qualified?",
    answer: "<> Getting pre-qualified is quick and easy! Answer a few simple questions about your rental needs, budget, timeline, and basic qualifications. Once pre-qualified, you'll get early access to exclusive listings and can book showings instantly.",
    primary: { text: "Get Pre-Qualified Now", to: "/prequalify" },
    secondary: { text: "Browse Available Rentals", to: "/rentals" },
  },
  {
    question: "What is a Good Tenants Reusable Application?",
    answer: "<> The Good Tenants Reusable Application Package is a comprehensive screening package that includes verified income, credit check, rental history, and references. Complete it once and use it for multiple properties \u2014 no more filling out the same application repeatedly! This makes you stand out to landlords as a pre-qualified tenant.",
    primary: { text: "Start Your Application Package", to: "/prequalify" },
    secondary: null,
  },
  {
    question: "How do I list my property?",
    answer: "<> Landlords and licensed Realtors can upload listings through our admin panel. First, get verified by providing your credentials, then upload your listings directly or via CSV file. Your listings will be promoted to our pre-qualified tenant network instantly.",
    primary: { text: "Get Verified as a Landlord or Realtor", to: "/verify" },
    secondary: null,
  },
  {
    question: "Is there a cost to tenants?",
    answer: "<> Basic pre-qualification and browsing listings is completely free for tenants. Optional premium services are available if you want to become fully pre-screened with the Good Tenants Reusable Application Package.",
    primary: { text: "Get Pre-Qualified Free", to: "/prequalify" },
    secondary: { text: "Browse Free Listings", to: "/rentals" },
  },
  {
    question: "How do I become a verified landlord or realtor?",
    answer: "<> Click 'Get Verified' and provide your information. Realtors need their DRE license number and brokerage details. Landlords need to verify property ownership. Once verified, you'll have access to our pre-qualified tenant database and can list properties immediately.",
    primary: { text: "Get Verified Now", to: "/verify" },
    secondary: null,
  },
  {
    question: "How do landlords and licensed real estate professionals get verified?",
    answer: "<> To protect tenant privacy and ensure compliance, access to tenant information is restricted to verified parties only. Landlords are verified through proof of property ownership or authorised representation. Licensed real estate professionals are verified via their DRE license number and MLS records.",
    primary: { text: "Landlord Verification", to: "/verify" },
    secondary: { text: "Real Estate Professional Verification", to: "/verify" },
  },
  {
    question: "What happens after I get pre-qualified?",
    answer: "<> Once pre-qualified, you'll be matched with properties that fit your criteria and can book showings faster than other applicants. Pre-qualification helps you stand out, but it does not guarantee final approval \u2014 each landlord makes their own decision.",
    primary: { text: "Browse Homes I Qualify For", to: "/rentals" },
    secondary: { text: "Get Pre-Screened for Stronger Applications", to: "/prequalify" },
  },
  {
    question: "Is pre-qualification or pre-screening required to rent a home?",
    answer: "<> No, it's not legally required. However, in competitive rental markets, pre-qualified and pre-screened tenants move faster and have a significantly higher success rate. Taking early action gives you a real advantage when good rentals go quickly.",
    primary: { text: "Get Pre-Qualified", to: "/prequalify" },
    secondary: null,
  },
  {
    question: "Is this service free for tenants?",
    answer: "Browsing listings and getting pre-qualified is completely free for renters. Optional paid services include the Good Tenants Reusable Application Package, which provides comprehensive pre-screening with verified income, credit and background checks.",
    primary: { text: "Get Started Free", to: "/prequalify" },
    secondary: null,
  },
] as const;
