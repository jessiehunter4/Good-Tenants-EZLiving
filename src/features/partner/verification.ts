/**
 * Getting a partner verified.
 *
 * Carried across from `comingsoonhomrentals-com/src/pages/RealtorVerification.tsx`,
 * which asked exactly these questions and then threw the answers away — its
 * submit handler says "in production, this would submit to backend" and shows a
 * success message. Nothing was stored, so nobody was ever verified.
 */
import { z } from "zod";

export type PartnerKind = "agent" | "landlord";

export const realtorVerificationSchema = z.object({
  agency: z.string().trim().min(1, "Which brokerage?").max(200),
  license_number: z.string().trim().min(4, "A DRE licence number is required").max(40),
  brokerage_address: z.string().trim().max(300),
  years_experience: z.coerce.number().int().min(0).max(80),
  bio: z.string().trim().max(2000),
});
export type RealtorVerificationForm = z.infer<typeof realtorVerificationSchema>;

export const landlordVerificationSchema = z.object({
  property_count: z.coerce
    .number({ invalid_type_error: "How many rentals do you have?" })
    .int()
    .min(1, "At least one property")
    .max(10000),
  property_addresses: z
    .string()
    .trim()
    .min(1, "List at least one address so we can check ownership")
    .max(2000),
  management_type: z.enum(["self", "company", "hybrid"]),
  years_experience: z.coerce.number().int().min(0).max(80),
  bio: z.string().trim().max(2000),
});
export type LandlordVerificationForm = z.infer<typeof landlordVerificationSchema>;

export const MANAGEMENT_LABELS: Record<string, string> = {
  self: "I manage them myself",
  company: "A management company does",
  hybrid: "Some of each",
};

export type VerificationState = "not_started" | "submitted" | "verified" | "changes_requested";

/**
 * Where a partner stands.
 *
 * Four states, each telling the partner something different. In particular a
 * refusal is not the same as never having asked — the source could express
 * neither, so a partner told nothing assumed silence meant pending and waited
 * for something that was not coming.
 */
export function verificationState(profile: {
  is_verified?: boolean | null;
  verification_submitted_at?: string | null;
  verification_notes?: string | null;
}): VerificationState {
  if (profile.is_verified) return "verified";
  if (profile.verification_notes) return "changes_requested";
  if (profile.verification_submitted_at) return "submitted";
  return "not_started";
}

export const VERIFICATION_COPY: Record<VerificationState, { heading: string; body: string }> = {
  not_started: {
    heading: "Get verified",
    body: "Verified partners can browse the tenant directory and list properties. It usually takes a business day.",
  },
  submitted: {
    heading: "With our team",
    body: "We have your details and are checking them. You will hear from us within a business day.",
  },
  verified: {
    heading: "You are verified",
    body: "You can browse the tenant directory and list properties. Update anything below and we will take another look.",
  },
  changes_requested: {
    heading: "We need something else",
    body: "Have a look at the note below, update your details, and send it back.",
  },
};

export const PARTNER_DOCUMENT_KINDS: Record<
  PartnerKind,
  { kind: string; label: string; hint: string }[]
> = {
  agent: [
    { kind: "license", label: "DRE licence", hint: "A photo or PDF of your licence." },
    {
      kind: "brokerage",
      label: "Brokerage proof",
      hint: "Something showing you are with that brokerage.",
    },
  ],
  landlord: [
    {
      kind: "ownership",
      label: "Proof of ownership",
      hint: "A deed, tax bill or mortgage statement.",
    },
    { kind: "id", label: "Photo ID", hint: "So we can match the name on the deed." },
  ],
};
