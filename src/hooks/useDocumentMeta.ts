import { useEffect } from "react";

/**
 * Page metadata for a single-page app.
 *
 * The daily rendered on a server and emitted its own `<head>` per route. This
 * app is a browser bundle, so the tags are written after the page mounts.
 * Crawlers that execute JavaScript will see them; ones that do not will see the
 * shell in `index.html`. That is a real difference from what the daily had, and
 * it is the reason a server runtime is still an open decision — a merged
 * content site that lives on search cannot stay client-only forever.
 */
export type DocumentMeta = {
  title: string;
  description?: string | null;
  canonical?: string | null;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
};

const MANAGED = "data-managed-meta";

function setTag(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    el.setAttribute(MANAGED, "");
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => el?.setAttribute(k, v));
}

export function useDocumentMeta(meta: DocumentMeta): void {
  const {
    title, description, canonical, image, type = "website", noindex, jsonLd,
  } = meta;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    setTag('meta[property="og:title"]', { property: "og:title", content: title });
    setTag('meta[property="og:type"]', { property: "og:type", content: type });
    if (description) {
      setTag('meta[name="description"]', { name: "description", content: description });
      setTag('meta[property="og:description"]', { property: "og:description", content: description });
    }
    if (image) {
      setTag('meta[property="og:image"]', { property: "og:image", content: image });
      setTag('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    }
    setTag('link[rel="canonical"]', {
      rel: "canonical",
      href: canonical || window.location.origin + window.location.pathname,
    });
    setTag('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex,nofollow" : "index,follow",
    });

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(MANAGED, "");
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = previousTitle;
      script?.remove();
    };
  }, [title, description, canonical, image, type, noindex, jsonLd]);
}
