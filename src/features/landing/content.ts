/**
 * The merged landing page's copy, taken from the three apps being merged.
 *
 * Nothing here is invented. The three-doors framing is Irvine Living Daily's own
 * ("One family. Three doors in."); the funnel steps, tenant benefits, owner
 * pitch and questions are Coming Soon Home Rentals' live copy. Merging means
 * carrying across what already works, not writing a fourth product's marketing.
 *
 * Source is noted per block so a claim can be traced back to the site that made
 * it — which matters most for the numbers.
 */

export interface Door {
  name: string;
  role: string;
  blurb: string;
  href: string;
}

/** Irvine Living Daily's own framing of the family. */
export const DOORS: readonly Door[] = [
  {
    name: "Coming Soon Home Rentals",
    role: "The listings",
    blurb: "New and coming-soon rentals, with search, listing detail and instant showing bookings.",
    href: "/rentals",
  },
  {
    name: "EZ Living Irvine",
    role: "The daily",
    blurb: "Rental drops, community and Irvine market intel, published every day.",
    href: "/daily",
  },
  {
    name: "Good Tenants",
    role: "The profile",
    blurb: "One screening package — income, credit, rental history, references — reused everywhere.",
    href: "/register?role=tenant",
  },
] as const;

/** Coming Soon Home Rentals, "How it works". */
export const STEPS = [
  { number: "01", title: "Get pre-qualified", body: "Just a few quick questions gets you started." },
  {
    number: "02",
    title: "Browse exclusive listings",
    body: "Access coming-soon properties and new listings daily.",
  },
  {
    number: "03",
    title: "Book showings instantly",
    body: "Schedule viewings directly on the site. No chasing and hoping for a response.",
  },
] as const;

/** Coming Soon Home Rentals, tenant benefits. */
export const BENEFITS = [
  { title: "Early access", body: "See listings hours before they appear on public sites." },
  {
    title: "Reusable application",
    body: "One screening package works for all our listings — no repeated applications.",
  },
  {
    title: "Verified properties",
    body: "Every listing comes from licensed realtors or verified landlords.",
  },
  { title: "Direct booking", body: "Schedule a viewing yourself, without waiting on a callback." },
] as const;

/**
 * Coming Soon Home Rentals' published figures, carried across as they appear on
 * the live site. They describe that platform's network, not the merged database
 * — which is empty — so they need confirming before this page replaces anything.
 */
export const STATS = [
  { value: "500+", label: "Exclusive listings" },
  { value: "24hrs", label: "Average early access" },
  { value: "1,000+", label: "Prescreened tenants" },
  { value: "95%", label: "Faster lease time" },
] as const;

/** Coming Soon Home Rentals' FAQ, condensed. */
export const FAQ = [
  {
    question: "What is Coming Soon Home Rentals?",
    answer:
      "A real-time rental listing platform showing upcoming and newly listed homes, so you see them before they reach the public sites.",
  },
  {
    question: "What is the Good Tenants reusable application?",
    answer:
      "A screening package covering verified income, credit check, rental history and references. Complete it once and reuse it for every property here.",
  },
  {
    question: "How do I get pre-qualified?",
    answer:
      "A few quick questions about your budget, timing and household. It takes minutes.",
  },
  {
    question: "Is there a cost to tenants?",
    answer:
      "Basic pre-qualification and browsing are free. The full reusable application package is a paid service.",
  },
  {
    question: "How do landlords and agents get verified?",
    answer:
      "Licensed realtors verify through their licence; landlords verify ownership. Only verified owners can list.",
  },
  {
    question: "Is pre-qualification required to rent a home?",
    answer:
      "Not to browse. It is required to book a showing, which keeps viewings for people who can actually take the property.",
  },
] as const;
