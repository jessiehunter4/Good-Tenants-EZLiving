import { useEffect, useState } from "react";
import type { Section } from "@/features/daily/post";

/** Carried across from `Irvine Living Daily/src/components/site/StickyToc.tsx`. */
export const StickyToc = ({ sections }: { sections: Section[] }) => {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav className="rounded-2xl border border-clay/50 bg-sand p-5">
      <h2 className="text-xs font-bold uppercase tracking-widest text-espresso-muted">
        In this post
      </h2>
      <ol className="mt-3 space-y-2 text-sm">
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={
                active === s.id
                  ? "flex gap-2 font-semibold text-espresso"
                  : "flex gap-2 text-espresso-muted transition-colors hover:text-espresso"
              }
            >
              <span className="font-mono text-espresso-muted/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{s.heading}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StickyToc;
