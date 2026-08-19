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

/** Source: Coming Soon Home Rentals, FAQSection, condensed. */
export const FAQ = [
  {
    question: "What is Good Tenants EZ Living?",
    answer:
      "A rental platform showing upcoming and newly listed homes. Pre-qualified tenants can book showings and apply before a rental reaches the open market. It connects ready-to-rent tenants with verified landlords and licensed real estate professionals.",
  },
  {
    question: "What does coming soon mean?",
    answer:
      "A home that is going to be listed but is not yet on the open market. Seeing it early is the difference between being one of many applications and being the first.",
  },
  {
    question: "What does pre-qualified mean?",
    answer:
      "You have told us your household income, your credit range and when you can move. We check that against each listing's requirements so you know where you stand before you apply — and you only answer once.",
  },
  {
    question: "Does it cost anything to get pre-qualified?",
    answer:
      "No. Building your profile is free, and it is what gives you early access to new listings.",
  },
  {
    question: "Who sees my profile?",
    answer:
      "Only the landlords and agents you approve. A request to view your profile comes to you first, and nothing is shared until you say yes.",
  },
] as const;
