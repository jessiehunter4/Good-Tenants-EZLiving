import { describe, expect, it } from "vitest";
import {
  landlordVerificationSchema,
  realtorVerificationSchema,
  verificationState,
} from "./verification";

describe("verificationState", () => {
  it("starts at not_started when nobody has asked", () => {
    expect(verificationState({})).toBe("not_started");
  });

  it("is submitted once they have asked and no answer has come", () => {
    expect(verificationState({ verification_submitted_at: "2026-08-20T00:00:00Z" })).toBe(
      "submitted",
    );
  });

  it("distinguishes a refusal from never having asked", () => {
    // The source could express neither. A partner told nothing assumes silence
    // means pending, and waits for something that is not coming.
    expect(
      verificationState({
        verification_submitted_at: "2026-08-20T00:00:00Z",
        verification_notes: "The licence photo was unreadable.",
      }),
    ).toBe("changes_requested");
  });

  it("lets verified outrank an old note", () => {
    expect(
      verificationState({
        is_verified: true,
        verification_notes: "Earlier we asked for a clearer photo.",
      }),
    ).toBe("verified");
  });
});

describe("realtorVerificationSchema", () => {
  const valid = {
    agency: "Jessie Hunter Team",
    license_number: "01748803",
    brokerage_address: "Irvine, CA",
    years_experience: 12,
    bio: "",
  };

  it("accepts a complete submission", () => {
    expect(realtorVerificationSchema.safeParse(valid).success).toBe(true);
  });

  it("insists on a licence number, which is the whole point", () => {
    expect(realtorVerificationSchema.safeParse({ ...valid, license_number: "12" }).success).toBe(
      false,
    );
  });
});

describe("landlordVerificationSchema", () => {
  const valid = {
    property_count: 3,
    property_addresses: "12 Great Park Blvd",
    management_type: "self" as const,
    years_experience: 5,
    bio: "",
  };

  it("accepts a complete submission", () => {
    expect(landlordVerificationSchema.safeParse(valid).success).toBe(true);
  });

  it("needs at least one address, because that is what gets checked", () => {
    expect(
      landlordVerificationSchema.safeParse({ ...valid, property_addresses: "" }).success,
    ).toBe(false);
  });

  it("refuses a landlord with no properties", () => {
    expect(landlordVerificationSchema.safeParse({ ...valid, property_count: 0 }).success).toBe(
      false,
    );
  });
});
