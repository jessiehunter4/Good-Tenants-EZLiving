import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import DailySidebar from "@/components/daily/DailySidebar";
import PostCard from "@/components/daily/PostCard";
import ReadingProgress from "@/components/daily/ReadingProgress";
import StickyToc from "@/components/daily/StickyToc";
import { Button } from "@/components/ui/button";
import { allPostsQuery, postBySlugQuery } from "@/hooks/daily/content";
import { adaptWrapped, type UiPost } from "@/features/daily/post";
import { formatDate } from "@/features/daily/format";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const RELATED_COUNT = 3;

/** Carried across from `Irvine Living Daily/src/routes/blog.$slug.tsx`. */
const BlogPost = () => {
  const { slug = "" } = useParams();
  const { data: wrapped, isLoading, isError } = useQuery(postBySlugQuery(slug));
  const { data: rawAll = [] } = useQuery(allPostsQuery);

  const post = wrapped ? adaptWrapped(wrapped) : null;
  const all = rawAll.map(adaptWrapped);
  const sameTopic = post
    ? all.filter((p) => p.topicSlug === post.topicSlug && p.slug !== post.slug)
    : [];
  const related = (sameTopic.length ? sameTopic : all.filter((p) => p.slug !== post?.slug)).slice(
    0,
    RELATED_COUNT,
  );

  useDocumentMeta({
    title: post ? post.metaTitle || `${post.title} — Good Tenants EZ Living` : "Loading…",
    description: post?.metaDescription || post?.summary,
    canonical: post?.canonicalUrl,
    image: post?.ogImage ?? post?.heroImage,
    type: "article",
    noindex: post?.noindex,
    jsonLd: post ? buildArticleSchema(post) : null,
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-24">
          <div className="h-8 w-2/3 animate-pulse rounded bg-clay/40" />
          <div className="mt-6 h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !post) {
    return (
      <SiteLayout>
        <div className="page-shell py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-espresso">Post not found</h1>
          <p className="mt-3 text-espresso-muted">
            It may have been unpublished, or the link may be wrong.
          </p>
          <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/blog">Back to the daily</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article>
        <ReadingProgress />

        <div className="relative h-[44vh] min-h-[320px] w-full overflow-hidden">
          <img src={post.heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/20 to-espresso/85" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="page-shell pb-10 text-sand">
              <Link
                to={`/topics/${post.topicSlug}`}
                className="inline-block rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-wider text-espresso"
              >
                {post.topicName}
              </Link>
              <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                {post.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand/85">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" /> By {post.author}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {post.readMinutes} min read
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="page-shell grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {post.sections.length > 0 && (
              <div className="mb-10 lg:hidden">
                <StickyToc sections={post.sections} />
              </div>
            )}

            {post.summary && (
              <p className="mb-8 text-xl leading-relaxed text-espresso">{post.summary}</p>
            )}

            <div className="article-content">
              {post.sections.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2>{section.heading}</h2>
                  {section.body.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-clay bg-clay-soft p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-espresso-muted">
                Next step
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-espresso">
                {post.cta.label}
              </h2>
              <p className="mt-2 text-sm text-espresso-muted">
                Answered by the <strong className="text-espresso">{post.cta.responder}</strong>.
              </p>
              <CtaLink url={post.cta.url} text={post.cta.buttonText} />
            </div>

            {post.citation && (
              <p className="mt-6 text-xs text-espresso-muted">Source: {post.citation}</p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sand-deep px-3 py-1 text-xs font-semibold text-espresso"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {post.sections.length > 0 && (
              <div className="hidden lg:block">
                <StickyToc sections={post.sections} />
              </div>
            )}
            <DailySidebar currentSlug={post.slug} />
          </aside>
        </div>

        {related.length > 0 && (
          <section className="page-shell pb-20">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-espresso">
              More in {post.topicName}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={`${p.type}-${p.slug}`} post={p} />
              ))}
            </div>
          </section>
        )}
      </article>
    </SiteLayout>
  );
};

const CtaLink = ({ url, text }: { url: string; text: string }) => {
  const className =
    "mt-5 inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-sand transition hover:bg-espresso/90";
  return url.startsWith("http") ? (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      {text} <ArrowRight className="h-4 w-4" />
    </a>
  ) : (
    <Link to={url} className={className}>
      {text} <ArrowRight className="h-4 w-4" />
    </Link>
  );
};

function buildArticleSchema(post: UiPost): Record<string, unknown> {
  if (post.schemaJsonLd) return post.schemaJsonLd;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.summary,
    image: post.ogImage ?? post.heroImage,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Good Tenants EZ Living" },
  };
}

export default BlogPost;
