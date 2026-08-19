import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import { allPostsQuery, topicsQuery } from "@/hooks/daily/content";
import { adaptWrapped } from "@/features/daily/post";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/** Carried across from `Irvine Living Daily/src/routes/topics.index.tsx`. */
const Topics = () => {
  const { data: topics = [], isLoading } = useQuery(topicsQuery);
  const { data: rawPosts = [] } = useQuery(allPostsQuery);
  const posts = rawPosts.map(adaptWrapped);

  useDocumentMeta({
    title: "Topics — Good Tenants EZ Living",
    description: "Browse Irvine living by topic: rentals, community, market updates and more.",
  });

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading eyebrow="Browse" title="Topics" intro="Pick a lane." />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-clay/30" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <p className="text-espresso-muted">No topics yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => {
              const count = posts.filter((p) => p.topicSlug === topic.slug).length;
              return (
                <Link
                  key={topic.slug}
                  to={`/topics/${topic.slug}`}
                  className="group rounded-2xl border border-clay/50 bg-card p-6 transition hover:border-clay hover:shadow-md"
                >
                  <h2 className="text-2xl font-bold tracking-tight text-espresso group-hover:underline">
                    {topic.name}
                  </h2>
                  <p className="mt-1 text-sm text-espresso-muted">
                    {count} post{count === 1 ? "" : "s"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Topics;
