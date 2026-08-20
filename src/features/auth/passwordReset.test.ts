import { describe, expect, it } from "vitest";
import {
  isRecoveryUrl,
  newPasswordSchema,
  recoveryError,
} from "./passwordReset";

describe("isRecoveryUrl", () => {
  it("recognises the fragment Supabase sends", () => {
    expect(isRecoveryUrl("#access_token=abc&type=recovery", "")).toBe(true);
  });

  it("recognises the PKCE code in the query string", () => {
    expect(isRecoveryUrl("", "?code=abc123")).toBe(true);
  });

  it("is false for someone who simply visited the page", () => {
    // A signed-in visitor has a session too, which is why a session alone
    // cannot be the test.
    expect(isRecoveryUrl("", "")).toBe(false);
    expect(isRecoveryUrl("#", "?utm_source=email")).toBe(false);
  });
});

describe("recoveryError", () => {
  it("says plainly when a link has expired", () => {
    expect(recoveryError("#error_code=otp_expired&error_description=Email+link+is+invalid"))
      .toContain("expired");
  });

  it("passes through another reason rather than inventing one", () => {
    expect(recoveryError("#error_description=Token+already+used"))
      .toBe("Token already used");
  });

  it("is null when nothing went wrong", () => {
    expect(recoveryError("#access_token=abc&type=recovery")).toBeNull();
  });
});

describe("newPasswordSchema", () => {
  it("accepts a matching pair", () => {
    expect(newPasswordSchema.safeParse({ password: "hunter2!", confirm: "hunter2!" }).success)
      .toBe(true);
  });

  it("refuses a mismatch, and says which field is wrong", () => {
    const result = newPasswordSchema.safeParse({ password: "hunter2!", confirm: "hunter3!" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(["confirm"]);
  });

  it("holds the same six-character floor as registration", () => {
    expect(newPasswordSchema.safeParse({ password: "short", confirm: "short" }).success)
      .toBe(false);
  });
});
