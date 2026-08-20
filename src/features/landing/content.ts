/**
 * The landing page's words.
 *
 * Every line is carried verbatim from Coming Soon Home Rentals, including its
 * capitalisation. An earlier version of this file paraphrased — sentence-cased
 * the headings, shortened the bullets, softened "Stop wasting time" to "Stop
 * spending time" — which is rewriting a page that has been tuned against real
 * traffic, on no evidence. Where a claim is a marketing number nobody here has
 * checked, it says so; it does not get edited.
 *
 * The site's own name is the one exception, since it is this app now.
 */

/** Source: HeroSection. */
export const HERO = {
  title: "Find rental homes first!",
  subtitle: "Fresh New and Coming Soon Rental Homes Daily.",
  promise: "The best rentals go fast.",
  promiseParts: ["See first.", "Apply first.", "Get approved first."],
} as const;

/** Source: UrgencySection. */
export const URGENCY = {
  heading: "The Best Rentals in the Best Locations Don't Last",
  intro:
    "Quality homes in desirable neighborhoods get multiple applications within hours of listing. To secure your ideal rental, you need to:",
  cards: [
    {
      icon: "eye",
      title: "See First",
      description:
        "Access exclusive Coming Soon and new listings sometimes even before they hit the big portals",
    },
    {
      icon: "file",
      title: "Apply First",
      description:
        "Submit your application instantly with a reusable Good Tenants screening package",
    },
    {
      icon: "check",
      title: "Get Approved First",
      description:
        "Stand out to landlords who prioritize pre-qualified, prescreened, verified tenants",
    },
  ],
} as const;

/** Source: HowItWorks. */
export const STEPS = [
  {
    number: 1,
    title: "Get Pre-qualified",
    description: "Just a few quick questions gets you started.",
  },
  {
    number: 2,
    title: "Browse Exclusive Listings",
    description: "Access Coming Soon properties and new listings daily.",
  },
  {
    number: 3,
    title: "Book Showings Instantly",
    description: "Schedule viewings directly on the site. No chasing and hoping for a response.",
  },
] as const;

/** Source: TenantBenefits. */
export const BENEFITS = [
  {
    icon: "clock",
    title: "Early Access",
    description: "See listings hours before they appear on public sites",
  },
  {
    icon: "repeat",
    title: "Reusable Application",
    description: "One screening package works for all our listings - no repeated applications",
  },
  {
    icon: "shield",
    title: "Verified Properties",
    description: "Every listing comes from licensed Realtors or verified landlords",
  },
  {
    icon: "calendar",
    title: "Direct Booking",
    description: "Schedule showings instantly without waiting for callbacks",
  },
] as const;

/** Source: LandlordSection. */
export const OWNERS = {
  heading: "For Landlords & Licensed Realtors",
  subheading: "Fill Vacancies Faster with Pre-Qualified and Prescreened Tenants",
  intro:
    "Stop wasting time on unqualified leads. Our pre-qualified and prescreened tenant network is ready to rent now! Prescreened tenants have verified income, credit checked, and are actively searching.",
  points: [
    "Access our database of tenants pre-qualified for your listing and fully prescreened, ready-to-rent tenants",
    "Promote your Coming Soon properties to qualified applicants first",
    "We blast new listings to our pre-qualified and prescreened ready to rent tenant network instantly",
  ],
} as const;

/**
 * Source: StatsSection.
 *
 * UNVERIFIED. These are the numbers that site publishes today. Nobody here has
 * checked them against the database, and after the merge the database is in the
 * same application — so they should be confirmed or computed.
 */
export const STATS = [
  { value: "500+", label: "Exclusive Listings" },
  { value: "24hrs", label: "Average Early Access" },
  { value: "1,000+", label: "Prescreened Tenants" },
  { value: "95%", label: "Faster Lease Time" },
] as const;

/**
 * Source: TestimonialsSection.
 *
 * UNVERIFIED. Carried because they are live on that site today, not because
 * anyone here has confirmed them. A testimonial is a claim made in a real
 * person's name; if it cannot be attributed, this block should come out.
 */
export const TESTIMONIALS = [
  {
    quote:
      "I found my dream rental 2 days before it was listed anywhere else. Being pre-qualified made the whole process so smooth!",
    name: "Sarah M.",
    role: "Tenant",
    location: "Los Angeles, CA",
  },
  {
    quote:
      "As a Realtor, this platform has been a game-changer. I can connect my Coming Soon listings with pre-qualified tenants instantly.",
    name: "Michael R.",
    role: "Licensed Realtor",
    location: "Orange County, CA",
  },
  {
    quote:
      "No more chasing unqualified leads. Every tenant inquiry from this site has been serious and pre-verified.",
    name: "David L.",
    role: "Property Owner",
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
