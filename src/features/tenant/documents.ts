/**
 * The documents behind a Good Tenant Application Package.
 *
 * The kinds come from what a landlord actually asks for, which is also what the
 * hub's package fields describe: proof of who you are, what you earn, and how
 * you have rented before.
 */
export type DocumentKind =
  | "id"
  | "income"
  | "employment"
  | "rental_history"
  | "reference"
  | "other";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type DocumentKindSpec = {
  kind: DocumentKind;
  label: string;
  hint: string;
  /** Weight toward a complete package. */
  weight: number;
};

export const DOCUMENT_KINDS: readonly DocumentKindSpec[] = [
  {
    kind: "id",
    label: "Photo ID",
    hint: "A driving licence or passport. Redact anything you would rather not share.",
    weight: 25,
  },
  {
    kind: "income",
    label: "Proof of income",
    hint: "Two recent pay stubs, or an offer letter if you are starting a new job.",
    weight: 30,
  },
  {
    kind: "employment",
    label: "Employment letter",
    hint: "Optional, but it answers the question a pay stub raises.",
    weight: 10,
  },
  {
    kind: "rental_history",
    label: "Rental history",
    hint: "A ledger or statement from a previous landlord.",
    weight: 20,
  },
  {
    kind: "reference",
    label: "Reference",
    hint: "A letter from a previous landlord or employer.",
    weight: 15,
  },
  { kind: "other", label: "Something else", hint: "Anything else you were asked for.", weight: 0 },
];

export const DOCUMENT_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_KINDS.map((k) => [k.kind, k.label]),
);

const REQUIRED = DOCUMENT_KINDS.filter((k) => k.weight > 0);
const MAX_WEIGHT = REQUIRED.reduce((sum, k) => sum + k.weight, 0);

export type PackageProgress = {
  /** 0–100. Rejected documents do not count; a renter has to replace them. */
  percent: number;
  present: DocumentKind[];
  missing: DocumentKindSpec[];
  /** True when every weighted kind has at least one document that is not rejected. */
  complete: boolean;
};

/**
 * How far along the package is.
 *
 * A rejected document counts for nothing — it is worse than missing, because
 * the renter believes that box is ticked. Pending counts, because the renter
 * has done their part and the wait is ours.
 */
export function packageProgress(
  documents: readonly { document_type: string; verification_status: string }[],
): PackageProgress {
  const usable = new Set(
    documents
      .filter((d) => d.verification_status !== "rejected")
      .map((d) => d.document_type),
  );

  const present = REQUIRED.filter((k) => usable.has(k.kind)).map((k) => k.kind);
  const missing = REQUIRED.filter((k) => !usable.has(k.kind));
  const earned = REQUIRED.filter((k) => usable.has(k.kind)).reduce((s, k) => s + k.weight, 0);

  return {
    percent: MAX_WEIGHT === 0 ? 0 : Math.round((earned / MAX_WEIGHT) * 100),
    present,
    missing,
    complete: missing.length === 0,
  };
}

const MEGABYTE = 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * MEGABYTE;

export const ACCEPTED_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
] as const;

/** Why a file cannot be accepted, or null when it can. */
export function rejectReason(file: { size: number; type: string }): string | null {
  if (file.size > MAX_DOCUMENT_BYTES) {
    return `That file is ${(file.size / MEGABYTE).toFixed(1)}MB. The limit is 10MB.`;
  }
  if (!ACCEPTED_MIME.includes(file.type as (typeof ACCEPTED_MIME)[number])) {
    return "Please upload a PDF or a photo.";
  }
  return null;
}

export function formatBytes(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MEGABYTE) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / MEGABYTE).toFixed(1)} MB`;
}
