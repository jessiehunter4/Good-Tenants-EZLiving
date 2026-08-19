// Carried across from `Irvine Living Daily/src/lib/cta.ts`.
//
// Central CTA governance — the rule the daily has always run on:
//   property posts  → the listing, answered by the Jessie Hunter Team
//   everything else → the Good Tenants funnel
// Every CTA names its responder, so no post can send a reader somewhere nobody
// is watching.
//
// The one change on the way in: the two destinations used to be other
// properties on the internet. In the merged app they are routes in this app.
export const GO_URL = "/register?role=tenant";
export const LISTINGS_URL = "/rentals";

export type CtaInput = {
  type: "article" | "qa" | "case-study" | "property";
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  ctaResponder?: string | null;
  listingUrl?: string | null;
};

export type CtaResponder = "Jessie Hunter Team" | "Good Tenants";

export type ResolvedCta = {
  url: string;
  label: string;
  responder: CtaResponder;
  buttonText: string;
};

export function resolveCta(input: CtaInput): ResolvedCta {
  if (input.type === "property") {
    return {
      url: input.listingUrl || input.ctaUrl || LISTINGS_URL,
      label: input.ctaLabel || "See this rental",
      responder: "Jessie Hunter Team",
      buttonText: "Open the listing",
    };
  }
  return {
    url: input.ctaUrl || GO_URL,
    label: input.ctaLabel || "Build your renter profile",
    responder: (input.ctaResponder as CtaResponder) || "Good Tenants",
    buttonText: input.ctaLabel || "Get started",
  };
}
