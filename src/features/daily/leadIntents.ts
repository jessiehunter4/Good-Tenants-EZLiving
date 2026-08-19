// Carried across from `Irvine Living Daily/src/routes/start.tsx`.
//
// Five reasons a reader hands over their contact details, each with its own
// promise and its own follow-up. The copy is the daily's, not new: it is what
// the CTAs seeded in `cta_destinations` already promise, so the two must agree.
//
// Changed on the way in: the CTA that used to send readers to Coming Soon Home
// Rentals now points at this app's own listings, and the renter-profile intent
// leads into the Good Tenants profile rather than describing it from outside.
export type LeadIntent =
  | "newsletter"
  | "renter-profile"
  | "strategy-call"
  | "rent-report"
  | "full-article";

export type IntentConfig = {
  title: string;
  description: string;
  kicker: string;
  cta: string;
  bullets: readonly string[];
  showPhone: boolean;
  showMessage: boolean;
  successMessage: string;
};

export const DEFAULT_INTENT: LeadIntent = "newsletter";

export const LEAD_INTENTS: Record<LeadIntent, IntentConfig> = {
  newsletter: {
    title: "Start with the daily drop",
    description:
      "Subscribe to Daily Irvine Living and get the next rental drop in your inbox.",
    kicker: "Free",
    cta: "Subscribe",
    bullets: [
      "Today's rental drop with a one-tap link to the listing",
      "One Ask Good Tenants Q&A each week",
      "Monthly Irvine rental market update",
      "Reply directly to reach the Jessie Hunter Team or Good Tenants",
    ],
    showPhone: false,
    showMessage: false,
    successMessage: "You're on the list. Watch your inbox.",
  },
  "renter-profile": {
    title: "Build your Good Tenant profile",
    description:
      "Prove you qualify once, then reuse it for every rental you apply to in Irvine's competitive market.",
    kicker: "Renters",
    cta: "Start my profile",
    bullets: [
      "One reusable application package",
      "Verified credit and income presentation",
      "Pet and co-signer add-ons available",
      "Shared only with the landlords and agents you approve",
    ],
    showPhone: true,
    showMessage: true,
    successMessage:
      "Got it — the Jessie Hunter Team will be in touch within one business day.",
  },
  "strategy-call": {
    title: "Book an Irvine rental strategy call",
    description:
      "15 minutes with the Jessie Hunter Team to map out your Irvine move.",
    kicker: "Owners and renters",
    cta: "Book my call",
    bullets: [
      "Neighborhood-by-neighborhood walkthrough",
      "Budget and timing reality check",
      "Move-in checklist and deposit protection tips",
      "No-pressure conversation",
    ],
    showPhone: true,
    showMessage: true,
    successMessage: "Got it — we'll text you with a couple of time options.",
  },
  "rent-report": {
    title: "Get the full Irvine rent report",
    description:
      "The latest Irvine rental market data — neighborhood medians, trends, what's actually moving.",
    kicker: "Market",
    cta: "Send me the report",
    bullets: [
      "Median rents by Irvine village",
      "What's changed in the last 90 days",
      "Where renters are getting the best value",
      "Free, sent immediately",
    ],
    showPhone: false,
    showMessage: false,
    successMessage: "Sent. Check your inbox in a couple of minutes.",
  },
  "full-article": {
    title: "Read the full breakdown",
    description: "Get the full version of this article in your inbox.",
    kicker: "Article",
    cta: "Send me the full article",
    bullets: [
      "Full data, citations and context",
      "Plus our next Irvine market note",
      "Unsubscribe anytime",
    ],
    showPhone: false,
    showMessage: false,
    successMessage: "Done — check your inbox.",
  },
};

export function resolveIntent(raw: string | null | undefined): LeadIntent {
  // An own-property check, not `in`: the intent comes from the query string,
  // and `in` walks the prototype chain — `?intent=__proto__` would pass the
  // check and then hand the page an undefined config to render.
  return raw && Object.prototype.hasOwnProperty.call(LEAD_INTENTS, raw)
    ? (raw as LeadIntent)
    : DEFAULT_INTENT;
}

const SOURCES = ["article", "social", "direct", "email", "other"] as const;
export type LeadSource = (typeof SOURCES)[number];

export function resolveSource(raw: string | null | undefined): LeadSource {
  return SOURCES.includes(raw as LeadSource) ? (raw as LeadSource) : "direct";
}
