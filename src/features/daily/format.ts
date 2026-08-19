// Carried across from `Irvine Living Daily/src/lib/format.ts`.
// Locale-independent on purpose: a publish date is a date, not a moment, so it
// must read the same in Irvine and in Manila.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
