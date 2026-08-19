/**
 * Good Tenants' own words.
 *
 * Carried across from the `Good Tenants Hub` repo — GoodTenants.com itself.
 * This is the brand's copy, including claims about the business that only it
 * can make: twelve years, three states, a named broker and a licence number.
 * None of it is written here.
 */

export const COMPANY = {
  legalName: "Good Tenants Services, Inc.",
  broker: "Jessie Hunter, Broker",
  dre: "CA DRE #01748803",
  phone: "(657) 567-3738",
} as const;

/** Source: hub `/about`. */
export const MISSION = {
  eyebrow: "Our mission",
  heading: "Helping you get ready — and stay ready.",
  intro:
    "We aim to help individuals and families get ready to rent or buy desired housing and stay ready for future opportunities. We help facilitate their financial goals and dreams.",
  lead: "Introducing Good Tenants Services",
  leadBody:
    "Good Tenants helps renters find and get approved for their next rental home faster and for less — and connects landlords and Realtors with prepared, document-ready applicants.",
  accomplishmentsHeading: "Our accomplishments include:",
  accomplishments: [
    "Specialising in matching good tenants with good landlords who own nice houses.",
    "Over 12 years helping hundreds of good tenants get approved for rental homes — even when their situation isn't perfect.",
    "One of the first tenant brokers focused on representing tenants in the home-leasing process.",
    "Helped many good tenants become first-time homeowners.",
  ],
  otherHeading: "Other information",
  other: [
    "Started by helping homeowners in foreclosure and with credit challenges.",
    "Perfected the Good Tenant Application Package and approval process.",
    "Assisted tenants in California, Georgia and Kentucky.",
    "Changing the way tenants prepare and apply for rental homes.",
    "Showing good tenants how they can stop paying rent and become homeowners.",
  ],
} as const;

/** Source: hub `/pricing`. */
export const PRICING_TIERS = [
  {
    name: "Tenant",
    price: "Free",
    body: "Build your Good Tenant Application Package, complete the Readiness Review, and get found by landlords and Realtors.",
    features: [
      "Reusable application package",
      "Public profile — you control what shows",
      "Dashboard with documents and matches",
    ],
    cta: "Sign up free",
    to: "/register?role=tenant",
    featured: true,
  },
  {
    name: "Landlord",
    price: "Coming soon",
    body: "Browse and invite prepared tenants to apply. Plans being finalised.",
    features: ["Tenant directory access", "Invite to apply", "Post what you need"],
    cta: "Notify me",
    to: "/contact",
    featured: false,
  },
  {
    name: "Realtor",
    price: "Coming soon",
    body: "Refer tenants, send them to listings, and join the upcoming referral programme.",
    features: [
      "Referral tools",
      "Listing and tenant matching",
      "Referral programme eligibility, terms apply",
    ],
    cta: "Notify me",
    to: "/contact",
    featured: false,
  },
] as const;

/** Source: hub `/faq`. */
export const HUB_FAQ = [
  {
    q: "What is Good Tenants?",
    a: "Good Tenants helps renters become application-ready and connects landlords and Realtors with prepared, document-ready tenants.",
  },
  {
    q: "Is Good Tenants free?",
    a: "Yes — Good Tenants is free for tenants. Landlord and Realtor pricing is coming soon.",
  },
  {
    q: "What is the Good Tenant Application Package?",
    a: "A reusable bundle of application info, income documents and rental history you build once and share when you apply.",
  },
  {
    q: "What is the Good Tenants Readiness Review?",
    a: "A review of your application package to help you become application-ready. It is not a guarantee of approval.",
  },
  {
    q: "Do landlords see my private documents?",
    a: "Only when you grant access. Private package details may also be subject to admin review before sharing.",
  },
  {
    q: "Do you discriminate?",
    a: "No. Good Tenants supports the Fair Housing Act and does not sort, match or rank tenants by any protected class.",
  },
  { q: "Do you store SSNs?", a: "No. We do not store full Social Security Numbers." },
  {
    q: "How do Realtor referrals work?",
    a: "The referral programme is being developed. Eligibility and compensation are subject to applicable law, brokerage rules, MLS rules, and a written agreement.",
  },
] as const;

/**
 * Source: hub `/fair-housing`.
 *
 * This one is a commitment, not marketing. The middle paragraph is the
 * operative sentence and is carried verbatim — it names the protected classes
 * and says what the platform will not do with them.
 */
export const FAIR_HOUSING = {
  heading: "Equal opportunity housing",
  standfirst: "Good Tenants supports the Fair Housing Act.",
  statement:
    "Good Tenants Services, Inc. is committed to the principles of equal housing opportunity. We do not search, sort, match, advertise, or rank tenants by race, color, religion, sex (including gender identity and sexual orientation), familial status, national origin, disability, or any other class protected under applicable federal, state, or local law.",
  practiceHeading: "What this means in practice",
  practice: [
    "Our tenant directory cannot be filtered or sorted by any protected class.",
    "We do not include protected-class information on public tenant profiles.",
    "Landlords and Realtors who use Good Tenants agree to follow all applicable fair-housing laws.",
  ],
  complaintLead:
    "If you believe you have experienced housing discrimination, you can file a complaint with the U.S. Department of Housing and Urban Development (HUD) at",
  complaintUrl: "https://www.hud.gov/fairhousing",
  complaintLabel: "hud.gov/fairhousing",
} as const;

/** Source: hub `/accessibility`. */
export const ACCESSIBILITY = {
  heading: "Accessibility",
  intro:
    "Good Tenants is committed to making this platform accessible to everyone, including people with disabilities.",
  practiceHeading: "What we do",
  practice: [
    "Use semantic HTML and ARIA where appropriate.",
    "Maintain sufficient colour contrast.",
    "Support keyboard navigation and screen readers.",
    "Provide alt text for meaningful images.",
  ],
  helpHeading: "Need help?",
  helpBody:
    "If you encounter an accessibility barrier on our site, please contact us and we will work to fix it.",
} as const;

/** Source: hub `/referral-program`. */
export const REFERRAL_PROGRAM = {
  heading: "Referral programme",
  standfirst:
    "Good Tenants is developing a referral programme for Realtors and other partners.",
  caveat:
    "Eligibility, structure and any referral compensation are subject to applicable law, brokerage rules, MLS rules, and a written agreement.",
  ways: [
    "Refer a tenant who lists with Good Tenants.",
    "Send a tenant to your rental listing.",
    "Track referrals in your Realtor dashboard.",
  ],
} as const;

/** Source: hub `/landlords`. */
export const LANDLORD_PITCH = {
  eyebrow: "For landlords",
  heading: "Landlords — start here",
  intro:
    "Find a good tenant and choose your next renter from the directory. Tenants arrive with a Good Tenant Application Package already built.",
  benefitsHeading: "Why landlords choose Good Tenants",
  benefits: [
    "Tenants are application-ready and motivated to lease.",
    "Each Good Tenant Application Package can include the application, income documents, rental history and screening status where legally permitted.",
    "Choose from available tenants, invite them to apply, and reduce lease-up friction.",
    "No fair-housing risk: we do not search, sort or rank tenants by protected class.",
  ],
  noneHeading: "No prescreened tenants in your area?",
  noneBody:
    "Post your rental need. Good Tenants can help with open-house and lead-generation support. A flat-fee leasing-support option is on the roadmap.",
  contactHeading: "Get in touch",
  contactBody: "Tell us about your property and we'll match you with prepared tenants.",
} as const;

/** Source: hub `/realtors`. */
export const REALTOR_PITCH = {
  eyebrow: "For realtors",
  heading: "Realtors — start here",
  intro:
    "Find a good tenant for your rental listings, and reach ready tenants from the directory.",
  benefitsHeading: "Benefits for REALTORS\u00AE",
  benefits: [
    "Good Tenants may be ready to view and apply for rental property.",
    "Tenants are prescreened with a Good Tenant Application Package.",
    "Send a tenant directly to your rental listing, or invite them to apply.",
    "Future referral programme — eligibility and compensation subject to applicable law, brokerage rules, MLS rules, and a written agreement.",
  ],
  noneHeading: "No prescreened tenants in your area?",
  noneBody:
    "Post your rental listing or need. We can help generate tenant interest while you focus on your clients.",
  contactHeading: "Talk to Good Tenants",
  contactBody: "Send a note and we'll get back to you.",
} as const;
