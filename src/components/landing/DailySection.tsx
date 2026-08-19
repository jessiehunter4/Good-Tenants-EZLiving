import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import PostCard from "@/components/daily/PostCard";
import { allPostsQuery } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";

const SHOWN = 3;

/**
 * The daily, on the landing page.
 *
 * Not carried from the rentals site — it had nothing like it. This is the slot
 * EZ Living Irvine's posts fill now that both live in one app, which is the
 * most visible thing the merge actually changed for a reader.
 */
export const DailySection = () => {
  const { data = [], isLoading } = useQuery(allPostsQuery);
  const posts = data.map(adaptWrapped).sort(byNewestFirst).slice(0, SHOWN);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section id="daily" className="bg-background py-16">
      <div className="page-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-espresso md:text-3xl">
              From the daily
            </h2>
            <p className="mt-2 text-espresso-muted">
              What is happening in Irvine renting, most days.
            </p>
          </div>
          <Button asChild variant="outline" className="border-clay text-espresso">
            <Link to="/blog">Read the daily</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {isLoading
            ? Array.from({ length: SHOWN }, (_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-2xl bg-clay/30" />
              ))
            : posts.map((post) => <PostCard key={`${post.type}-${post.slug}`} post={post} />)}
        </div>
      </div>
    </section>
  );
};

export default DailySection;
