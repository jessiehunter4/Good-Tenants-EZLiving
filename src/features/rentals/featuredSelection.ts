/**
 * Carried across from `ezliving/src/lib/featured/select.ts` before that repo
 * was deleted — an earlier attempt at this merge whose schema was superseded
 * but whose logic was not. The `featured_history` table it writes to already
 * exists here, carried over from the daily; nothing populates it yet.
 */
// Featured Rental of the Day — candidate scoring and selection.
//
// Build plan Phase 1.4. Pure and dependency-free by design: no database access,
// no network, no clock. `today` is passed in rather than read from Date, so the
// same inputs always produce the same output and the rolling diversity window
// can be tested without freezing time.
//
// This sits ALONGSIDE the existing AI scorer in lib/admin/drops.functions.ts
// rather than replacing it. That scorer returns one opaque 0–100 number from an
// LLM; useful, but it cannot explain a ranking, cannot be tested, and cannot
// enforce the diversity rule. Here the AI score becomes one weighted component
// among four, and every point is attributable to a reason string.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DropCandidate {
  id: string;
  listingUrl: string;
  /** Neighborhood or community name. Null when the feed did not supply one. */
  community: string | null;
  /** e.g. "Condo", "Single Family". Null when the feed did not supply one. */
  propertyType: string | null;
  heroImage: string | null;
  /** Total photos available, when the feed reports it. */
  photoCount: number | null;
  summary: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  availableAt: string | null;
  /** Score from the existing LLM pass, 0–100. Null when not yet scored. */
  aiScore: number | null;
  /** Free-text blob searched for feature keywords. */
  rawText: string | null;
}

export interface FeaturedHistoryEntry {
  /** ISO date, YYYY-MM-DD. */
  featuredDate: string;
  community: string | null;
  propertyType: string | null;
}

export interface SelectionConfig {
  scoreThreshold: number;
  priceMin: number | null;
  priceMax: number | null;
  requireHeroImage: boolean;
  /** Rolling window for the diversity rule, in days. */
  diversityWindowDays: number;
}

export interface ScoredCandidate {
  candidate: DropCandidate;
  score: number;
  reasons: string[];
  /** False when the candidate repeats a recent community or property type. */
  diversityPassed: boolean;
  /** Why diversity failed, for the admin queue. Null when it passed. */
  diversityConflict: string | null;
  /** True when the candidate fails a hard gate and can never be selected. */
  disqualified: boolean;
}

export interface SelectionResult {
  /** Best eligible candidate, or null when nothing qualifies. */
  winner: ScoredCandidate | null;
  /**
   * True when the winner was chosen despite failing the diversity rule,
   * because no diverse candidate cleared the threshold. Recorded on
   * featured_history so overrides stay visible rather than silent.
   */
  diversityOverride: boolean;
  /** Every candidate, ranked. Drives the admin queue. */
  ranked: ScoredCandidate[];
}

// ---------------------------------------------------------------------------
// Weights — the four components sum to MAX_SCORE
// ---------------------------------------------------------------------------

const WEIGHTS = {
  quality: 40,
  features: 20,
  priceBand: 20,
  ai: 20,
} as const;

const MAX_SCORE = WEIGHTS.quality + WEIGHTS.features + WEIGHTS.priceBand + WEIGHTS.ai;

/** Quality sub-allocation, summing to WEIGHTS.quality. */
const QUALITY_POINTS = {
  heroImage: 15,
  photoCount: 10,
  summary: 8,
  completeness: 7,
} as const;

const PHOTO_COUNT_BANDS = [
  { min: 20, points: QUALITY_POINTS.photoCount },
  { min: 12, points: 8 },
  { min: 6, points: 5 },
  { min: 1, points: 2 },
] as const;

const SUMMARY_LENGTH_BANDS = [
  { min: 400, points: QUALITY_POINTS.summary },
  { min: 200, points: 6 },
  { min: 80, points: 3 },
] as const;

/**
 * Feature keywords, grouped so that breadth beats repetition — five words for
 * the same amenity score once, while a listing touching four categories scores
 * higher than one touching two.
 *
 * Strictly property attributes. Nothing here describes who might live there:
 * fair housing (build plan ground rule 5) is a constraint on this file too.
 */
const FEATURE_KEYWORDS: Readonly<Record<string, readonly string[]>> = {
  outdoor: ["patio", "balcony", "yard", "garden", "terrace", "deck", "courtyard"],
  parking: ["garage", "carport", "covered parking", "driveway", "ev charger"],
  upgrades: ["renovated", "remodeled", "upgraded", "new construction", "quartz", "stainless"],
  climate: ["central air", "air conditioning", "hvac", "fireplace", "solar"],
  amenities: ["pool", "spa", "gym", "fitness", "clubhouse", "tennis", "playground"],
  interior: ["hardwood", "walk-in closet", "vaulted", "island", "in-unit laundry", "washer"],
} as const;

const FEATURE_CATEGORY_COUNT = Object.keys(FEATURE_KEYWORDS).length;

/** Points when no price range is configured — neutral rather than punishing. */
const PRICE_BAND_NEUTRAL = 12;

/** Fraction of the band width beyond which a price scores zero. */
const PRICE_BAND_TOLERANCE = 0.5;

const DEFAULTS = {
  diversityWindowDays: 14,
} as const;

// ---------------------------------------------------------------------------
// Component scorers
// ---------------------------------------------------------------------------

function scoreQuality(c: DropCandidate, reasons: string[]): number {
  let points = 0;

  if (c.heroImage) {
    points += QUALITY_POINTS.heroImage;
    reasons.push("Hero image present");
  } else {
    reasons.push("No hero image");
  }

  const band = PHOTO_COUNT_BANDS.find((b) => (c.photoCount ?? 0) >= b.min);
  if (band) {
    points += band.points;
    reasons.push(`${c.photoCount} photos`);
  } else {
    reasons.push("No photos beyond the hero");
  }

  const summaryLength = c.summary?.trim().length ?? 0;
  const summaryBand = SUMMARY_LENGTH_BANDS.find((b) => summaryLength >= b.min);
  if (summaryBand) {
    points += summaryBand.points;
    reasons.push("Description has usable length");
  } else {
    reasons.push("Description is short or missing");
  }

  const present = [c.beds, c.baths, c.sqft, c.availableAt].filter(
    (v) => v !== null && v !== undefined,
  ).length;
  const completeness = Math.round((present / 4) * QUALITY_POINTS.completeness);
  points += completeness;
  if (present === 4) {
    reasons.push("Beds, baths, size and availability all present");
  } else {
    reasons.push(`${present} of 4 key fields present`);
  }

  return points;
}

function scoreFeatures(c: DropCandidate, reasons: string[]): number {
  const haystack = (c.rawText ?? "").toLowerCase();
  if (!haystack) {
    reasons.push("No feature text to read");
    return 0;
  }

  const hits: string[] = [];
  for (const [category, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    if (keywords.some((k) => haystack.includes(k))) hits.push(category);
  }

  if (hits.length === 0) {
    reasons.push("No notable features found");
    return 0;
  }

  reasons.push(`Features: ${hits.join(", ")}`);
  return Math.round((hits.length / FEATURE_CATEGORY_COUNT) * WEIGHTS.features);
}

function scorePriceBand(c: DropCandidate, config: SelectionConfig, reasons: string[]): number {
  const { priceMin, priceMax } = config;

  if (priceMin === null || priceMax === null || priceMax <= priceMin) {
    reasons.push("No target rent range configured");
    return PRICE_BAND_NEUTRAL;
  }
  if (c.price === null) {
    reasons.push("No price on the listing");
    return 0;
  }
  if (c.price >= priceMin && c.price <= priceMax) {
    reasons.push("Within the target rent range");
    return WEIGHTS.priceBand;
  }

  const distance = c.price < priceMin ? priceMin - c.price : c.price - priceMax;
  const tolerance = (priceMax - priceMin) * PRICE_BAND_TOLERANCE;
  if (distance >= tolerance) {
    reasons.push("Far outside the target rent range");
    return 0;
  }

  const points = Math.round(WEIGHTS.priceBand * (1 - distance / tolerance));
  reasons.push("Near the target rent range");
  return points;
}

function scoreAi(c: DropCandidate, reasons: string[]): number {
  if (c.aiScore === null) {
    reasons.push("Not yet scored by the AI pass");
    return 0;
  }
  const clamped = Math.max(0, Math.min(100, c.aiScore));
  reasons.push(`AI curator score ${clamped}`);
  return Math.round((clamped / 100) * WEIGHTS.ai);
}

// ---------------------------------------------------------------------------
// Diversity
// ---------------------------------------------------------------------------

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.POSITIVE_INFINITY;
  return Math.round((to - from) / 86_400_000);
}

function normalize(value: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

/**
 * Rejects a candidate whose community OR property type was featured inside the
 * rolling window.
 *
 * A null community or property type cannot conflict — we do not know what it is,
 * so we do not block on it. That is deliberate: blocking on unknowns would let a
 * feed with missing metadata stall selection entirely. It does mean the rule is
 * only as good as the feed, which is an argument for the projection work in the
 * CSHR seam.
 */
export function checkDiversity(
  candidate: DropCandidate,
  history: readonly FeaturedHistoryEntry[],
  today: string,
  windowDays: number,
): { passed: boolean; conflict: string | null } {
  const community = normalize(candidate.community);
  const propertyType = normalize(candidate.propertyType);

  for (const entry of history) {
    const age = daysBetween(entry.featuredDate, today);
    if (age < 0 || age >= windowDays) continue;

    if (community && normalize(entry.community) === community) {
      return {
        passed: false,
        conflict: `${candidate.community} was featured ${age} day${age === 1 ? "" : "s"} ago`,
      };
    }
    if (propertyType && normalize(entry.propertyType) === propertyType) {
      return {
        passed: false,
        conflict: `${candidate.propertyType} was featured ${age} day${age === 1 ? "" : "s"} ago`,
      };
    }
  }

  return { passed: true, conflict: null };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function scoreCandidate(
  candidate: DropCandidate,
  config: SelectionConfig,
  history: readonly FeaturedHistoryEntry[],
  today: string,
): ScoredCandidate {
  const reasons: string[] = [];

  // Hard gate: a featured post is a visual format. Without a hero image there
  // is nothing to publish, so this disqualifies rather than deducting.
  const disqualified = config.requireHeroImage && !candidate.heroImage;

  const score =
    scoreQuality(candidate, reasons) +
    scoreFeatures(candidate, reasons) +
    scorePriceBand(candidate, config, reasons) +
    scoreAi(candidate, reasons);

  const { passed, conflict } = checkDiversity(
    candidate,
    history,
    today,
    config.diversityWindowDays || DEFAULTS.diversityWindowDays,
  );

  if (disqualified) reasons.unshift("Disqualified: a hero image is required");
  if (conflict) reasons.push(`Diversity: ${conflict}`);

  return {
    candidate,
    score: Math.max(0, Math.min(MAX_SCORE, score)),
    reasons,
    diversityPassed: passed,
    diversityConflict: conflict,
    disqualified,
  };
}

/**
 * Ranks candidates and picks the day's feature.
 *
 * Order of precedence:
 *   1. Disqualified candidates can never win.
 *   2. Among the rest, the highest scorer that passes diversity and clears the
 *      threshold wins.
 *   3. If nothing does, the highest scorer that clears the threshold wins even
 *      though it repeats a recent community or type — and `diversityOverride`
 *      is set so the admin queue and featured_history both record it.
 *   4. If nothing clears the threshold, there is no winner. A quiet day is a
 *      better outcome than publishing something weak.
 */
export function selectFeatured(
  candidates: readonly DropCandidate[],
  config: SelectionConfig,
  history: readonly FeaturedHistoryEntry[],
  today: string,
): SelectionResult {
  const ranked = candidates
    .map((c) => scoreCandidate(c, config, history, today))
    .sort((a, b) => {
      if (a.disqualified !== b.disqualified) return a.disqualified ? 1 : -1;
      if (a.diversityPassed !== b.diversityPassed) return a.diversityPassed ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      // Stable tie-break so equal candidates do not reorder between runs.
      return a.candidate.id.localeCompare(b.candidate.id);
    });

  const eligible = ranked.filter((r) => !r.disqualified && r.score >= config.scoreThreshold);

  const diverse = eligible.find((r) => r.diversityPassed);
  if (diverse) return { winner: diverse, diversityOverride: false, ranked };

  const fallback = eligible[0];
  if (fallback) return { winner: fallback, diversityOverride: true, ranked };

  return { winner: null, diversityOverride: false, ranked };
}

export const SELECTION_MAX_SCORE = MAX_SCORE;
export const SELECTION_DEFAULTS = DEFAULTS;
