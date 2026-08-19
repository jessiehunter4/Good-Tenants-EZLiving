/**
 * What state a listing is in.
 *
 * Carried across from `comingsoonhomrentals-com/src/lib/listingStatus.ts`.
 *
 * The rule is deliberately narrow, and the source says why in capitals: no
 * fallbacks, no inference. `contract_status_change_date` is the authoritative
 * MLS field and the sole trigger for coming soon → active. Guessing from any
 * other column would mean showing a property as available on a date the MLS
 * did not agree to.
 */
export type ListingStatus = "coming_soon" | "active" | "dropped";

export type ListingStatusInput = {
  contractStatusChangeDate: string | null;
  /** How long a listing stays visible after going active. From site_settings. */
  retentionDays: number;
};

export const DEFAULT_RETENTION_DAYS = 30;

/** Midnight local, so a date compares as a day rather than as an instant. */
function startOfDay(value: Date): Date {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function computeListingStatus(
  input: ListingStatusInput,
  now: Date = new Date(),
): ListingStatus {
  const { contractStatusChangeDate, retentionDays } = input;

  // No date at all means the MLS has not said it is active yet.
  if (!contractStatusChangeDate) return "coming_soon";

  const changeDate = startOfDay(new Date(contractStatusChangeDate));
  if (Number.isNaN(changeDate.getTime())) return "coming_soon";

  const today = startOfDay(now);
  if (changeDate > today) return "coming_soon";

  const dropDate = new Date(changeDate);
  dropDate.setDate(dropDate.getDate() + retentionDays);
  if (today > dropDate) return "dropped";

  return "active";
}

export const STATUS_LABEL: Record<ListingStatus, string> = {
  coming_soon: "Coming soon",
  active: "Active",
  dropped: "No longer listed",
};

const TERMINAL_STATUSES = new Set(["leased", "closed", "expired", "cancelled"]);

/** A status from the feed that means the listing is finished. */
export function isTerminalStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return TERMINAL_STATUSES.has(status.toLowerCase().replace(/\s+/g, "_"));
}
