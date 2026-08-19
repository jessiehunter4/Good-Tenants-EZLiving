import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst, POST_TYPE_LABEL } from "@/features/daily/post";
import { searchPosts } from "@/features/daily/search";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/search.tsx`. */
const SearchPage = () => {
  const [query, setQuery] = useState("");
  const { data = [], isLoading } = useQuery(allPostsQuery);

  const posts = useMemo(() => data.map(adaptWrapped).sort(byNewestFirst), [data]);
  const results = useMemo(() => searchPosts(posts, query), [posts, query]);

  useDocumentMeta({
    title: "Search — Good Tenants EZ Living",
    description: "Search every post on the daily.",
    noindex: true,
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-espresso sm:text-5xl">Search</h1>

        <div className="mt-6 flex items-center gap-3 rounded-full border-2 border-clay bg-card px-5 py-3 focus-within:border-espresso">
          <SearchIcon className="h-5 w-5 text-espresso-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rentals, topics, neighborhoods…"
            aria-label="Search posts"
            className="w-full bg-transparent text-base text-espresso outline-none placeholder:text-espresso-muted/70"
          />
        </div>

        <p className="mt-3 text-sm text-espresso-muted">
          {isLoading
            ? "Loading…"
            : `${results.length} result${results.length === 1 ? "" : "s"}`}
        </p>

        {!isLoading && results.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-clay bg-sand p-10 text-center font-semibold text-espresso">
            Nothing matched “{query}”.
          </p>
        )}

        <ul className="mt-8 divide-y divide-clay/50">
          {results.map((post) => (
            <li key={`${post.type}-${post.slug}`} className="py-5">
              <Link to={`/blog/${post.slug}`} className="group flex gap-4">
                <img
                  src={post.heroImage}
                  alt=""
                  loading="lazy"
                  className="h-20 w-28 flex-none rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-espresso-muted">
                    {POST_TYPE_LABEL[post.type]} · {post.topicName}
                  </p>
                  <h2 className="text-xl font-bold tracking-tight text-espresso group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="line-clamp-2 text-sm text-espresso-muted">{post.summary}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SiteLayout>
  );
};

export default SearchPage;
