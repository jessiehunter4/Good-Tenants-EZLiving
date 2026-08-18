/**
 * What the product is called, in one place.
 *
 * The name was written out in eight files, so changing it meant finding all of
 * them and hoping. It is a constant now: the full name for headers, wordmarks
 * and legal lines, and a short form for tight spaces like a dashboard subtitle.
 */
export const BRAND = {
  /** Full product name. Use this by default. */
  name: "Good Tenants EZ Living",
  /** For narrow chrome where the full name wraps badly. */
  shortName: "Good Tenants",
  tagline: "Prove you qualify once, and decide who gets to see it.",
  /** Legal entity for copyright lines. */
  legalName: "Good Tenants EZ Living",
} as const;

export default BRAND;
