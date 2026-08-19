import { describe, expect, it } from "vitest";
import { formatRent, isPubliclyListed, toRentalListing, type RentalListingRow } from "./listing";

const base = {
  id: "1", slug: "12-great-park", address: "12 Great Park Blvd", neighborhood: "Great Park",
  rent: 4200, bedrooms: 3, bathrooms: 2, sqft: 1750, property_type: "house",
  description: null, date_available: "2026-09-01", pets_allowed: true,
  min_credit_score: 680, income_requirement_multiplier: 2.5,
  contract_status_change_date: "2026-08-01",
  display_address: "12 Great Park Blvd",
  address_display_allowed: true, media_display_allowed: true,
  internet_display_allowed: true, showing_allowed: true, open_house_allowed: true,
  status: "active", mls_number: "OC1", source_mls: "CRMLS",
  source_updated_at: "2026-08-14T00:00:00Z", listing_office_name: "Jessie Hunter Team",
  listing_agent_name: "Jessie Hunter", brokerage: null, agent_name: null,
} as unknown as RentalListingRow;

const photos = [
  { photo_url: "second.jpg", ordering: 2 },
  { photo_url: "first.jpg", ordering: 1 },
  { photo_url: "unordered.jpg", ordering: null },
];

const now = new Date("2026-08-19T12:00:00");

describe("toRentalListing", () => {
  it("puts the photos in the order the feed gave them, nulls last", () => {
    const listing = toRentalListing(base, photos, { now });
    expect(listing.photos).toEqual(["first.jpg", "second.jpg", "unordered.jpg"]);
  });

  it("uses the masked address the database computed", () => {
    // A visitor is served display_address and is not granted the raw column.
    const listing = toRentalListing(
      { ...base, address_display_allowed: false, display_address: "Great Park" } as RentalListingRow,
      photos,
      { now },
    );
    expect(listing.displayAddress).toBe("Great Park");
    expect(JSON.stringify(listing)).not.toContain("Great Park Blvd");
  });

  it("still masks when reading as an admin, who receives both columns", () => {
    const listing = toRentalListing(
      {
        ...base,
        address_display_allowed: false,
        display_address: null,
        neighborhood: "Great Park",
      } as RentalListingRow,
      photos,
      { now },
    );
    expect(listing.displayAddress).toBe("Great Park");
  });

  it("cuts the gallery to one photo before it reaches a component", () => {
    const listing = toRentalListing(
      { ...base, media_display_allowed: false } as RentalListingRow, photos, { now },
    );
    expect(listing.photos).toEqual(["first.jpg"]);
  });

  it("cuts the gallery once the listing has dropped out of its window", () => {
    const listing = toRentalListing(
      { ...base, contract_status_change_date: "2026-06-01" } as RentalListingRow,
      photos,
      { retentionDays: 30, now },
    );
    expect(listing.status).toBe("dropped");
    expect(listing.photos).toEqual(["first.jpg"]);
  });

  it("carries the attribution every displayed listing has to show", () => {
    const listing = toRentalListing(base, photos, { now });
    expect(listing.attribution.mlsNumber).toBe("OC1");
    expect(listing.attribution.officeName).toBe("Jessie Hunter Team");
  });

  it("marks a listing whose feed forbids showings", () => {
    const listing = toRentalListing(
      { ...base, showing_allowed: false } as RentalListingRow, photos, { now },
    );
    expect(listing.showingAllowed).toBe(false);
  });
});

describe("isPubliclyListed", () => {
  it("keeps a dropped listing off the public surfaces", () => {
    const dropped = toRentalListing(
      { ...base, contract_status_change_date: "2026-01-01" } as RentalListingRow, [], { now },
    );
    expect(isPubliclyListed(dropped)).toBe(false);
    expect(isPubliclyListed(toRentalListing(base, [], { now }))).toBe(true);
  });
});

describe("formatRent", () => {
  it("says price on request rather than $null", () => {
    expect(formatRent(null)).toBe("Price on request");
    expect(formatRent(4200)).toBe("$4,200/mo");
  });
});
