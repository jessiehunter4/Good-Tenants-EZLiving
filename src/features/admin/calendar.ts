import type { Row } from "@/hooks/admin/crud";

type Draft = Row<"ai_article_drafts">;

const SLOT_ORDER: Record<string, number> = {
  market: 0,
  listing: 1,
  tip: 2,
  community: 3,
};

/**
 * A generated draft keeps its article in a jsonb blob until it is published,
 * so its title has to be dug out rather than read off a column.
 */
export function draftTitle(draft: Draft): string {
  const article = draft.generated_article;
  if (article && typeof article === "object" && !Array.isArray(article)) {
    const title = (article as Record<string, unknown>).title;
    if (typeof title === "string" && title.trim()) return title;
  }
  return "Untitled draft";
}

/** Drafts grouped by their week, each week in slot order. */
export function groupDraftsByBatch(drafts: readonly Draft[]): Map<string, Draft[]> {
  const grouped = new Map<string, Draft[]>();
  for (const draft of drafts) {
    if (!draft.batch_id) continue;
    const list = grouped.get(draft.batch_id);
    if (list) list.push(draft);
    else grouped.set(draft.batch_id, [draft]);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => (SLOT_ORDER[a.slot] ?? 99) - (SLOT_ORDER[b.slot] ?? 99));
  }
  return grouped;
}
