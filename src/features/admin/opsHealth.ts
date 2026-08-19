/**
 * Carried across from `ezliving/src/lib/ops/health.ts` before that repo was
 * deleted. No screen consumes it yet; it is here because the distinction it
 * draws — between "bad" and "could not find out" — is the kind of thing that
 * gets lost and then has to be rediscovered after an outage reads as an empty
 * database.
 */
// Ops dashboard: turning raw readings into a status a human can act on.
//
// Pure and clock-free. `now` is passed in so "the sync is 30 hours stale" is
// testable without waiting 30 hours.
//
// ---------------------------------------------------------------------------
// The distinction this module exists to preserve
// ---------------------------------------------------------------------------
// A monitoring surface has three states, not two: good, bad, and "I could not
// find out". Most dashboards collapse the third into the second by rendering a
// failed read as zero, which is the worst possible answer because zero looks
// like a fact. "0 listings" reads as an empty database; "unreachable" reads as
// a broken connection. They call for completely different responses.
//
// Every reading below is therefore explicitly nullable, and `unknown` is a
// first-class status rather than a fallback.

export type HealthLevel = "ok" | "warn" | "critical" | "unknown";

export interface HealthVerdict {
  level: HealthLevel;
  /** One line, written for someone deciding whether to act. */
  message: string;
}

/** A number we may or may not have been able to read. */
export type Reading = number | null;

export interface SyncReading {
  /** ISO timestamp of the last completed run, or null if never / unreadable. */
  lastRunAt: string | null;
  /** Error text from the last run. Null when it succeeded. */
  lastError: string | null;
  /** True when we could not reach the source at all. */
  unreachable: boolean;
}

const HOUR_MS = 60 * 60 * 1000;

/** A feed syncing less often than this is stale enough to mention. */
const SYNC_WARN_HOURS = 26;
/** Beyond this, the mirror is drifting from the system of record. */
const SYNC_CRITICAL_HOURS = 72;

export function assessSync(reading: SyncReading, now: Date): HealthVerdict {
  if (reading.unreachable) {
    return { level: "unknown", message: "Could not reach this system" };
  }

  if (reading.lastError) {
    return { level: "critical", message: `Last sync failed: ${reading.lastError}` };
  }

  if (reading.lastRunAt === null) {
    return { level: "warn", message: "No sync has ever run" };
  }

  const ageMs = now.getTime() - Date.parse(reading.lastRunAt);

  // A timestamp in the future means clock skew somewhere, which is worth
  // surfacing rather than silently reporting "0 hours ago".
  if (ageMs < 0) {
    return { level: "warn", message: "Last sync is dated in the future" };
  }

  const ageHours = Math.floor(ageMs / HOUR_MS);

  if (ageHours >= SYNC_CRITICAL_HOURS) {
    return { level: "critical", message: `No sync for ${ageHours} hours` };
  }
  if (ageHours >= SYNC_WARN_HOURS) {
    return { level: "warn", message: `Last sync ${ageHours} hours ago` };
  }
  return {
    level: "ok",
    message: ageHours === 0 ? "Synced within the hour" : `Synced ${ageHours} hours ago`,
  };
}

/**
 * Daily publish health. Build plan Phase 8 asks for a check that two articles
 * and one featured rental publish every day, seven days a week.
 */
export function assessPublishHealth(
  featuredPublishedToday: Reading,
  pendingInQueue: Reading,
): HealthVerdict {
  if (featuredPublishedToday === null) {
    return { level: "unknown", message: "Could not read the publishing queue" };
  }

  if (featuredPublishedToday > 0) {
    return { level: "ok", message: "Today's rental is published" };
  }

  // Nothing published, but something is waiting on a human. That is a nudge,
  // not a fault: the queue is doing its job and somebody needs to decide.
  if (pendingInQueue !== null && pendingInQueue > 0) {
    return {
      level: "warn",
      message: `Nothing published today, ${pendingInQueue} awaiting a decision`,
    };
  }

  // Nothing published and nothing waiting means the selection produced no
  // candidate. That is a legitimate outcome, and also the one worth knowing
  // about, because it is silent by design.
  return {
    level: "warn",
    message: "Nothing published today and nothing in the queue",
  };
}

/** Mirror size. Zero listings is not an error, but it is never expected. */
export function assessInventory(liveListings: Reading): HealthVerdict {
  if (liveListings === null) {
    return { level: "unknown", message: "Could not read the listing mirror" };
  }
  if (liveListings === 0) {
    return { level: "critical", message: "The mirror holds no live listings" };
  }
  if (liveListings < 5) {
    return { level: "warn", message: `Only ${liveListings} live listings` };
  }
  return { level: "ok", message: `${liveListings} live listings` };
}

/**
 * Whether a system's schema is under version control.
 *
 * Good Tenants has no migration history at all, which means its access rules
 * cannot be reviewed from source. That is a standing condition rather than a
 * transient one, so it belongs on the dashboard until it changes.
 */
export function assessSchemaTracking(migrationCount: Reading): HealthVerdict {
  if (migrationCount === null) {
    return { level: "unknown", message: "Migration history not checked" };
  }
  if (migrationCount === 0) {
    return {
      level: "critical",
      message: "No migration history, so access rules cannot be reviewed",
    };
  }
  return { level: "ok", message: `${migrationCount} migrations tracked` };
}

/** Open security findings, from the Block 0 audit. */
export function assessSecurityPosture(
  openFindings: Reading,
  criticalFindings: Reading,
): HealthVerdict {
  if (openFindings === null) {
    return { level: "unknown", message: "Security status not recorded" };
  }
  if (openFindings === 0) {
    return { level: "ok", message: "No open findings" };
  }
  if (criticalFindings !== null && criticalFindings > 0) {
    return {
      level: "critical",
      message: `${openFindings} open, ${criticalFindings} critical`,
    };
  }
  return { level: "warn", message: `${openFindings} open findings` };
}

/**
 * Worst level across a set of checks, for the summary strip at the top.
 *
 * `unknown` deliberately outranks `ok`: a system we cannot read is not a system
 * that is fine. It sits below `critical` because a confirmed fault is more
 * actionable than an unread one.
 */
const SEVERITY_ORDER: Record<HealthLevel, number> = {
  ok: 0,
  unknown: 1,
  warn: 2,
  critical: 3,
};

export function worstLevel(verdicts: readonly HealthVerdict[]): HealthLevel {
  let worst: HealthLevel = "ok";
  for (const verdict of verdicts) {
    if (SEVERITY_ORDER[verdict.level] > SEVERITY_ORDER[worst]) {
      worst = verdict.level;
    }
  }
  return worst;
}

export function countByLevel(
  verdicts: readonly HealthVerdict[],
): Record<HealthLevel, number> {
  const counts: Record<HealthLevel, number> = {
    ok: 0,
    warn: 0,
    critical: 0,
    unknown: 0,
  };
  for (const verdict of verdicts) counts[verdict.level] += 1;
  return counts;
}
