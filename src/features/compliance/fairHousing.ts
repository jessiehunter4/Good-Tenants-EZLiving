/**
 * Fair housing copy lint.
 *
 * Carried across from `ezliving/src/lib/fair-housing.ts` — an earlier attempt at
 * this same merge, on Next.js, whose schema and pages were superseded but whose
 * compliance work was not. Nothing else in the three apps has this, and the
 * merged app now publishes model-generated article drafts and listing copy,
 * which is exactly where it is needed.
 *
 * Housing advertising may describe the PROPERTY. It may not describe, prefer, or
 * discourage the PEOPLE who might live there — directly or by proxy. This is the
 * Fair Housing Act, not a style guide, and the liability attaches to the
 * published words regardless of intent.
 *
 * This lint is a safety net, not a compliance guarantee. It catches the phrasings
 * that recur; it cannot catch a novel one. Run it wherever copy is generated or
 * edited — especially on LLM output, which produces exactly this register of
 * warm, welcoming, disqualifying prose without being asked to.
 */

export type FairHousingSeverity = "block" | "review";

export interface FairHousingFinding {
  phrase: string;
  severity: FairHousingSeverity;
  reason: string;
  index: number;
}

interface BannedPattern {
  pattern: RegExp;
  severity: FairHousingSeverity;
  reason: string;
}

/**
 * Patterns are matched case-insensitively against plain text.
 *
 * `block` — describes or filters by a protected class, or a recognised proxy.
 * `review` — legitimate in some contexts, wrong in most. Needs a human.
 */
const BANNED_PATTERNS: readonly BannedPattern[] = [
  // Familial status
  {
    pattern: /\b(perfect|ideal|great|suitable)\s+for\s+(a\s+)?(famil(y|ies)|couples?|singles?|students?|professionals?|retirees?|seniors?)\b/gi,
    severity: "block",
    reason: "Describes who the home suits. Describe the property instead.",
  },
  {
    pattern: /\b(no|not for)\s+(kids|children|families)\b/gi,
    severity: "block",
    reason: "Excludes by familial status.",
  },
  {
    pattern: /\b(adults?\s+only|mature\s+(person|individual|tenant)s?)\b/gi,
    severity: "block",
    reason: "Excludes by familial status or age.",
  },
  {
    pattern: /\bempty\s+nesters?\b/gi,
    severity: "block",
    reason: "Targets by familial status and age.",
  },

  // Religion
  {
    pattern: /\b(christian|catholic|jewish|muslim|hindu|buddhist)\b/gi,
    severity: "block",
    reason: "References religion.",
  },
  {
    pattern: /\bwalking\s+distance\s+to\s+(church|synagogue|mosque|temple)\b/gi,
    severity: "block",
    reason: "Religious proximity implies a religious preference.",
  },

  // Disability
  {
    pattern: /\b(able[- ]bodied|must\s+be\s+able\s+to\s+(walk|climb)|no\s+wheelchairs?)\b/gi,
    severity: "block",
    reason: "Excludes by disability.",
  },

  // National origin, race
  {
    pattern: /\b(english[- ]speaking|american\s+family|no\s+section\s+8)\b/gi,
    severity: "block",
    reason: "Excludes by national origin or source of income.",
  },
  {
    pattern: /\b(exclusive|restricted)\s+(neighborhood|community)\b/gi,
    severity: "block",
    reason: "Historically coded exclusionary language.",
  },

  // Proxies that read as neutral but are not
  {
    pattern: /\bsafe\s+neighborhood\b/gi,
    severity: "review",
    reason: "Long-recognised proxy for racial composition. Cite a property feature instead.",
  },
  {
    pattern: /\bgood\s+schools?\b/gi,
    severity: "review",
    reason: "Proxy for demographics. Name the school district factually if relevant.",
  },
  {
    pattern: /\bquiet\s+(building|community)\b/gi,
    severity: "review",
    reason: "Often reads as a familial-status preference. Describe the construction instead.",
  },
  {
    pattern: /\bbachelor\s+(pad|apartment)\b/gi,
    severity: "review",
    reason: "Gendered framing of who the home is for.",
  },

  // Not fair housing, but the same class of error: copy that does not say
  // who will reply. The CTA library exists so every destination names a
  // responder; this catches prose that quietly bypasses it.
  {
    pattern: /\bcontact\s+(the\s+)?agent\b/gi,
    severity: "review",
    reason: 'A CTA must name who answers it — "Jessie Hunter Team" or "Good Tenants".',
  },
] as const;

/** Returns every problem found. Empty means the copy passed. */
export function lintFairHousing(copy: string): FairHousingFinding[] {
  const findings: FairHousingFinding[] = [];

  for (const { pattern, severity, reason } of BANNED_PATTERNS) {
    // Patterns are module-level and carry /g, so lastIndex must be reset or
    // successive calls silently skip matches.
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(copy)) !== null) {
      findings.push({ phrase: match[0], severity, reason, index: match.index });
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }

  return findings.sort((a, b) => a.index - b.index);
}

/** True when nothing in the copy is a hard block. */
export function isPublishable(copy: string): boolean {
  return !lintFairHousing(copy).some((f) => f.severity === "block");
}

/**
 * Throws on a blocking phrase. Use in the publish path, not the draft path —
 * writers need to be able to save work in progress.
 */
export function assertFairHousingCompliant(copy: string): void {
  const blocking = lintFairHousing(copy).filter((f) => f.severity === "block");
  if (blocking.length === 0) return;

  const detail = blocking.map((f) => `"${f.phrase}" — ${f.reason}`).join("; ");
  throw new Error(`Copy cannot be published: ${detail}`);
}
