import { useEffect, useState } from "react";

/** Carried across from `Irvine Living Daily/src/components/site/ReadingProgress.tsx`. */
export const ReadingProgress = () => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
      <div
        className="h-full bg-espresso transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export default ReadingProgress;
