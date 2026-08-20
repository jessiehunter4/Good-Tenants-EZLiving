import { describe, expect, it } from "vitest";
import { formatBytes, packageProgress, rejectReason } from "./documents";

const doc = (document_type: string, verification_status = "pending") => ({
  document_type,
  verification_status,
});

describe("packageProgress", () => {
  it("starts at nothing and names what is needed", () => {
    const p = packageProgress([]);
    expect(p.percent).toBe(0);
    expect(p.complete).toBe(false);
    expect(p.missing.map((m) => m.kind)).toEqual([
      "id", "income", "employment", "rental_history", "reference",
    ]);
  });

  it("counts a pending document — the renter has done their part", () => {
    expect(packageProgress([doc("income")]).percent).toBe(30);
  });

  it("does not count a rejected one, because the renter must replace it", () => {
    expect(packageProgress([doc("income", "rejected")]).percent).toBe(0);
    expect(packageProgress([doc("income", "rejected")]).missing.map((m) => m.kind))
      .toContain("income");
  });

  it("counts a verified replacement alongside the rejected original", () => {
    const p = packageProgress([doc("income", "rejected"), doc("income", "verified")]);
    expect(p.percent).toBe(30);
  });

  it("is complete only when every weighted kind is covered", () => {
    const all = ["id", "income", "employment", "rental_history", "reference"].map((k) => doc(k));
    const p = packageProgress(all);
    expect(p.percent).toBe(100);
    expect(p.complete).toBe(true);
  });

  it("ignores an unweighted kind — 'other' cannot inflate the score", () => {
    expect(packageProgress([doc("other")]).percent).toBe(0);
  });
});

describe("rejectReason", () => {
  it("accepts a normal PDF", () => {
    expect(rejectReason({ size: 500_000, type: "application/pdf" })).toBeNull();
  });

  it("names the actual size when a file is too big", () => {
    const reason = rejectReason({ size: 12 * 1024 * 1024, type: "application/pdf" });
    expect(reason).toContain("12.0MB");
  });

  it("refuses a file type the bucket would reject anyway", () => {
    expect(rejectReason({ size: 1000, type: "application/zip" })).toBe(
      "Please upload a PDF or a photo.",
    );
  });
});

describe("formatBytes", () => {
  it("reads naturally at each scale", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
    expect(formatBytes(null)).toBe("");
  });
});
