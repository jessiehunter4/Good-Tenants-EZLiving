import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import PostCard from "@/components/daily/PostCard";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";

const SHOWN = 3;

/**
 * The daily, on the landing page.
 *
 * Not from the rentals site — it had nothing like it. Built to that page's
 * measurements so it does not read as an insert: same `max-w-6xl`, same
 * `py-16`, same heading scale and the same "view all" treatment as the
 * listings row above it.
 */
export const DailySection = () => {
  const { data = [], isLoading } = useQuery(allPostsQuery);
  const posts = data.map(adaptWrapped).sort(byNewestFirst).slice(0, SHOWN);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section id="daily" className="bg-muted px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">From the Daily</h2>
          <Link
            to="/blog"
            className="flex items-center gap-1 font-medium text-cta-browse-ink hover:underline"
          >
            Read More <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: SHOWN }, (_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-xl bg-card" />
              ))
            : posts.map((post) => <PostCard key={`${post.type}-${post.slug}`} post={post} />)}
        </div>
      </div>
    </section>
  );
};

export default DailySection;
