import { z } from "zod";

/**
 * Validation for the admin forms.
 *
 * Carried across from `Irvine Living Daily/src/lib/admin/schemas.ts` and its
 * per-module schemas. In the daily these guarded a server function; here they
 * guard the form, and the database's check constraints guard the row. Both
 * matter: the schema gives a useful message, the constraint makes it true.
 */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CTA_SLUG = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export const slugField = z
  .string()
  .trim()
  .min(2)
  .max(200)
  .regex(SLUG, "Lowercase letters, digits and hyphens only");

/*
 * Optional text stays a plain string here rather than transforming to null.
 * A zod transform makes the schema's input and output types differ, which
 * react-hook-form cannot reconcile — the form would type its own values as
 * all-optional. Empty strings become nulls on the way to the database instead,
 * via `blankToNull` below, which is the only place that conversion belongs.
 */
const optionalText = (max: number) => z.string().trim().max(max);

export const topicSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: slugField,
  description: optionalText(1000),
  hero_image: optionalText(2048),
});
export type TopicForm = z.infer<typeof topicSchema>;

export const promoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  short_copy: optionalText(500),
  image: optionalText(2048),
  button_label: optionalText(80),
  button_url: optionalText(2048),
  priority: z.coerce.number().int().min(0).max(9999),
  accent: z.boolean(),
  active: z.boolean(),
});
export type PromoForm = z.infer<typeof promoSchema>;

// Mirrors the CHECK constraints on cta_destinations.
export const CTA_KINDS = [
  "hub", "listing", "lead_form", "opt_in", "external", "sms", "calendar",
] as const;
export const CONTENT_SLOTS = ["market", "listing", "tip", "community"] as const;

export type CtaKind = (typeof CTA_KINDS)[number];
export type ContentSlot = (typeof CONTENT_SLOTS)[number];

export const ctaSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(CTA_SLUG, "Lowercase letters, digits and underscores only"),
  label: z.string().trim().min(1, "Label is required").max(200),
  kind: z.enum(CTA_KINDS),
  url: z.string().trim().min(1, "URL is required").max(2048),
  responder: z.string().trim().min(1).max(200),
  description: optionalText(1000),
  button_text: optionalText(60),
  default_for_slot: z.enum(CONTENT_SLOTS).nullable(),
  active: z.boolean(),
});
export type CtaForm = z.infer<typeof ctaSchema>;

export const seedSchema = z.object({
  slot: z.enum(CONTENT_SLOTS),
  title_angle: z.string().trim().min(1, "An angle is required").max(300),
  visual_description: optionalText(1000),
  citation: optionalText(500),
  notes: optionalText(2000),
  active: z.boolean(),
});
export type SeedForm = z.infer<typeof seedSchema>;

export const recipientSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("A valid email is required").max(200),
});
export type RecipientForm = z.infer<typeof recipientSchema>;

/** Turn a title into a slug — the same rule the daily used. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/**
 * An empty form field means "no value", not "the empty string".
 *
 * Stored as `""` a hero image is a broken URL and a description is a blank
 * paragraph; stored as null both are simply absent, which is what every read
 * path already checks for. Call it per field when building a payload — a
 * generic "nullify these keys" helper cannot keep its types straight through a
 * spread, and the explicit version reads better anyway.
 */
export function orNull(value: string | null | undefined): string | null {
  return value && value.trim() !== "" ? value : null;
}
