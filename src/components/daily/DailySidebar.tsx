import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { allPostsQuery, sidebarPromosQuery, type SidebarPromo } from "@/hooks/daily/content";
import { adaptWrapped, byNewestFirst } from "@/features/daily/post";

const RECENT_COUNT = 4;

/** Carried across from `Irvine Living Daily/src/components/site/Sidebar.tsx`. */
export const DailySidebar = ({ currentSlug }: { currentSlug?: string }) => {
  const { data: promos = [] } = useQuery(sidebarPromosQuery);
  const { data: posts = [] } = useQuery(allPostsQuery);

  const recent = posts
    .map(adaptWrapped)
    .filter((p) => p.slug !== currentSlug)
    .sort(byNewestFirst)
    .slice(0, RECENT_COUNT);

  return (
    <div className="space-y-6">
      {promos.map((promo) => (
        <PromoCard key={promo.title} promo={promo} />
      ))}

      {recent.length > 0 && (
        <div className="rounded-2xl border border-clay/50 bg-card p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-espresso-muted">
            Recent posts
          </h2>
          <ul className="mt-4 space-y-4">
            {recent.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="group flex gap-3">
                  <img
                    src={post.heroImage}
                    alt=""
                    loading="lazy"
                    className="h-14 w-20 flex-none rounded-md object-cover"
                  />
                  <span className="text-sm font-semibold leading-snug text-espresso group-hover:underline">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PromoCard = ({ promo }: { promo: SidebarPromo }) => {
  const href = promo.button_url || "/register?role=tenant";
  const isExternal = href.startsWith("http");
  const className = promo.accent
    ? "block rounded-2xl border border-clay bg-clay-soft p-5 transition hover:shadow-md"
    : "block rounded-2xl border border-clay/50 bg-card p-5 transition hover:shadow-md";

  const body = (
    <>
      <h2 className="text-lg font-bold tracking-tight text-espresso">{promo.title}</h2>
      {promo.short_copy && (
        <p className="mt-1.5 text-sm text-espresso-muted">{promo.short_copy}</p>
      )}
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-espresso">
        {promo.button_label || "Learn more"} <ArrowRight className="h-4 w-4" />
      </span>
    </>
  );

  return isExternal ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  ) : (
    <Link to={href} className={className}>
      {body}
    </Link>
  );
};

export default DailySidebar;
