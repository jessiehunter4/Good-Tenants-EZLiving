import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Post {
  slug: string;
  title: string;
  summary: string | null;
  publish_date: string | null;
  hero_image: string | null;
}

/**
 * Today's drop, from EZ Living Irvine.
 *
 * This is the content channel's slot on the merged page. It reads the platform's
 * articles table, which is empty until the daily's twelve migrations and its
 * posts are brought across — so it says that plainly rather than rendering an
 * empty grid that looks broken.
 */
export const DailySection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("slug, title, summary, publish_date, hero_image")
        .eq("published", true)
        .order("publish_date", { ascending: false })
        .limit(3);

      if (error) console.error("Could not load the daily:", error);
      setPosts(data ?? []);
      setLoading(false);
    };

    void load();
  }, []);

  return (
    <section id="daily" className="bg-background py-20 sm:py-28">
      <div className="page-shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
              From the daily
            </h2>
            <p className="mt-3 max-w-xl font-medium text-espresso-muted">
              Rental drops, community and Irvine market intel — published every day.
            </p>
          </div>
          <Button asChild variant="outline" className="border-espresso/20 text-espresso">
            <Link to="/daily">Read the latest</Link>
          </Button>
        </div>

        {loading && <p className="mt-10 font-medium text-espresso-muted">Loading…</p>}

        {!loading && posts.length === 0 && (
          <div className="mt-10 rounded-2xl bg-clay p-10 text-center">
            <p className="font-bold text-espresso">The daily has not moved across yet</p>
            <p className="mx-auto mt-2 max-w-lg font-medium text-espresso-muted">
              EZ Living Irvine's posts, topics and publishing schedule are still on the old
              site. They appear here once the content migration runs.
            </p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to={`/daily/${post.slug}`}
                className="group overflow-hidden rounded-2xl bg-clay transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {post.hero_image && (
                  <img
                    src={post.hero_image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold leading-tight text-espresso">{post.title}</h3>
                  {post.summary && (
                    <p className="mt-2 line-clamp-3 text-sm font-medium text-espresso-muted">
                      {post.summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DailySection;
