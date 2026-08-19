import { describe, expect, it } from "vitest";
import { LEAD_INTENTS, resolveIntent, resolveSource } from "./leadIntents";

describe("resolveIntent", () => {
  it("accepts the intents the seeded CTAs actually link to", () => {
    // These five strings are written into cta_destinations urls; if one stops
    // resolving, a live CTA silently becomes the newsletter form.
    for (const intent of ["renter-profile", "strategy-call", "rent-report", "full-article"]) {
      expect(resolveIntent(intent)).toBe(intent);
    }
  });

  it("falls back to the newsletter for anything unknown or missing", () => {
    expect(resolveIntent(null)).toBe("newsletter");
    expect(resolveIntent("__proto__")).toBe("newsletter");
  });
});

describe("resolveSource", () => {
  it("only allows the values the column's check constraint permits", () => {
    expect(resolveSource("article")).toBe("article");
    expect(resolveSource("carrier-pigeon")).toBe("direct");
  });
});

describe("LEAD_INTENTS", () => {
  it("asks for a phone number only where someone will call back", () => {
    expect(LEAD_INTENTS["strategy-call"].showPhone).toBe(true);
    expect(LEAD_INTENTS.newsletter.showPhone).toBe(false);
  });
});
