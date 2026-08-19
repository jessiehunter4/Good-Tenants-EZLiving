import { describe, expect, it } from "vitest";
import {
  attributionFor,
  displayAddress,
  restrictToPrimaryPhoto,
  showingAllowed,
  visiblePhotos,
  formatLastUpdated,
} from "./compliance";
import { computeListingStatus, isTerminalStatus } from "./listingStatus";

const listing = {
  address: "12 Great Park Blvd, Irvine",
  neighborhood: "Great Park",
  address_display_allowed: true,
  media_display_allowed: true,
  showing_allowed: true,
  status: "active",
  mls_number: "OC26001",
  source_mls: "CRMLS",
  source_updated_at: "2026-08-14T10:00:00Z",
  listing_office_name: "Jessie Hunter Team",
  listing_agent_name: "Jessie Hunter",
};

describe("displayAddress", () => {
  it("shows the street when the feed permits it", () => {
    expect(displayAddress(listing)).toBe("12 Great Park Blvd, Irvine");
  });

  it("falls back to the neighbourhood when the feed forbids the address", () => {
    expect(displayAddress({ ...listing, address_display_allowed: false })).toBe("Great Park");
  });

  it("never leaks the street when there is no neighbourhood to stand in", () => {
    const masked = displayAddress({
      ...listing,
      address_display_allowed: false,
      neighborhood: null,
    });
    expect(masked).toBe("Address available on request");
    expect(masked).not.toContain("Great Park Blvd");
  });

  it("treats a missing permission as allowed, matching the column default", () => {
    expect(displayAddress({ address: "1 A St" })).toBe("1 A St");
  });
});

describe("photo restriction", () => {
  const photos = ["a.jpg", "b.jpg", "c.jpg"];

  it("shows the gallery for a listing that permits media", () => {
    expect(visiblePhotos(photos, listing)).toHaveLength(3);
  });

  it("cuts to the primary photo when the feed forbids media", () => {
    expect(visiblePhotos(photos, { ...listing, media_display_allowed: false })).toEqual(["a.jpg"]);
  });

  it("cuts to the primary photo once the listing is finished", () => {
    expect(restrictToPrimaryPhoto({ ...listing, status: "Leased" })).toBe(true);
    expect(restrictToPrimaryPhoto(listing, "dropped")).toBe(true);
  });

  it("returns nothing rather than undefined when there are no photos", () => {
    expect(visiblePhotos([], listing)).toEqual([]);
  });
});

describe("showingAllowed", () => {
  it("is refused only when the feed says so", () => {
    expect(showingAllowed(listing)).toBe(true);
    expect(showingAllowed({ ...listing, showing_allowed: false })).toBe(false);
    expect(showingAllowed({ address: "1 A St" })).toBe(true);
  });
});

describe("attributionFor", () => {
  it("carries the MLS, its number and the holding office", () => {
    expect(attributionFor(listing)).toEqual({
      mlsNumber: "OC26001",
      sourceMls: "CRMLS",
      officeName: "Jessie Hunter Team",
      agentName: "Jessie Hunter",
      lastUpdated: "Aug 14, 2026",
    });
  });

  it("falls back to the brokerage when no listing office is given", () => {
    const a = attributionFor({ ...listing, listing_office_name: null, brokerage: "Acme Realty" });
    expect(a.officeName).toBe("Acme Realty");
  });

  it("defaults the source MLS rather than leaving the credit blank", () => {
    expect(attributionFor({ ...listing, source_mls: null }).sourceMls).toBe("CRMLS");
  });
});

describe("formatLastUpdated", () => {
  it("is the same string wherever it renders", () => {
    expect(formatLastUpdated("2026-01-02T23:30:00Z")).toBe("Jan 2, 2026");
  });

  it("says nothing rather than Invalid Date", () => {
    expect(formatLastUpdated(null)).toBeNull();
    expect(formatLastUpdated("not a date")).toBeNull();
  });
});

describe("computeListingStatus", () => {
  const now = new Date("2026-08-19T12:00:00");

  it("stays coming soon with no date — it never infers one", () => {
    expect(computeListingStatus({ contractStatusChangeDate: null, retentionDays: 30 }, now))
      .toBe("coming_soon");
  });

  it("stays coming soon until the MLS date is reached", () => {
    expect(computeListingStatus({ contractStatusChangeDate: "2026-09-01", retentionDays: 30 }, now))
      .toBe("coming_soon");
  });

  it("is active on the day the date is reached", () => {
    expect(computeListingStatus({ contractStatusChangeDate: "2026-08-19", retentionDays: 30 }, now))
      .toBe("active");
  });

  it("drops once the retention window has passed", () => {
    expect(computeListingStatus({ contractStatusChangeDate: "2026-07-01", retentionDays: 30 }, now))
      .toBe("dropped");
  });

  it("is still active on the last day of the window, not the day before", () => {
    expect(computeListingStatus({ contractStatusChangeDate: "2026-07-20", retentionDays: 30 }, now))
      .toBe("active");
  });
});

describe("isTerminalStatus", () => {
  it("recognises the feed's terminal words however they are cased or spaced", () => {
    expect(isTerminalStatus("Leased")).toBe(true);
    expect(isTerminalStatus("no show")).toBe(false);
    expect(isTerminalStatus(null)).toBe(false);
  });
});

describe("displayAddress on the public view", () => {
  it("uses what the database already masked", () => {
    // The view has no `address` column at all, so this is the only branch a
    // visitor's request can take.
    expect(
      displayAddress({ display_address: "Woodbridge", address_display_allowed: false }),
    ).toBe("Woodbridge");
  });

  it("never falls back to a street the row does not carry", () => {
    expect(displayAddress({ address_display_allowed: false })).toBe(
      "Address available on request",
    );
  });
});
