import type { UiPost } from "./post";

/**
 * The daily's search, which is a filter rather than an index: everything it
 * publishes fits in one query, so matching happens in the browser over the
 * fields a reader would actually type — title, summary, topic and tags.
 *
 * Carried across from `Irvine Living Daily/src/routes/search.tsx`, extracted so
 * the rule can be tested without mounting a page.
 */
export function searchPosts(posts: readonly UiPost[], query: string): UiPost[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...posts];
  return posts.filter((p) =>
    [p.title, p.summary, p.topicName, ...p.tags]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}
