/**
 * The lifecycle of a reader's question, and of a captured lead.
 *
 * Both carried across from the daily. The values are the ones the tables' check
 * constraints allow, so this file and the database have to agree — a status
 * that is not here cannot be written, and one that is not in the constraint
 * would be rejected at save time.
 */
export const QUESTION_STATUSES = ["new", "triaged", "answered", "spam"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const LEAD_STATUSES = ["new", "contacted", "converted", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  new: "New",
  triaged: "Triaged",
  answered: "Answered",
  spam: "Spam",
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  archived: "Archived",
};

/** The statuses a row can move to — everything except the one it is in. */
export function nextStatuses<T extends string>(
  all: readonly T[],
  current: string,
): T[] {
  return all.filter((s) => s !== current);
}

export function countByStatus<T extends string>(
  rows: readonly { status: string }[],
  statuses: readonly T[],
): Record<T, number> {
  const counts = Object.fromEntries(statuses.map((s) => [s, 0])) as Record<T, number>;
  for (const row of rows) {
    if ((statuses as readonly string[]).includes(row.status)) {
      counts[row.status as T] += 1;
    }
  }
  return counts;
}
