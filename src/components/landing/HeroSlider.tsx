import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import family1 from "@/assets/hero-family-1.jpg";
import family2 from "@/assets/hero-family-2.jpg";
import family3 from "@/assets/hero-family-3.jpg";
import family4 from "@/assets/hero-family-4.jpg";
import family5 from "@/assets/hero-family-5.jpg";

const SLIDES = [
  { src: family1, alt: "A family with the keys to their new rental home" },
  { src: family2, alt: "A family outside the home they have just rented" },
  { src: family3, alt: "New tenants at the door of their rental" },
  { src: family4, alt: "A family moving into a rental home" },
  { src: family5, alt: "New tenants with the keys to their rental" },
];

const AUTOPLAY_MS = 6000;

/** Carried across from `comingsoonhomrentals-com/src/components/home/HeroSlider.tsx`. */
export const HeroSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: AUTOPLAY_MS, stopOnMouseEnter: true, stopOnInteraction: false }),
  ]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full bg-muted">
      <div className="h-[60vh] overflow-hidden md:h-[70vh]" ref={emblaRef}>
        <div className="flex h-full">
          {SLIDES.map((slide, i) => (
            <div key={slide.src} className="relative h-full min-w-0 flex-[0_0_100%]">
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-contain"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show image ${i + 1} of ${SLIDES.length}`}
            aria-current={selected === i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={
              selected === i
                ? "h-2.5 w-8 rounded-full bg-primary transition-all"
                : "h-2.5 w-2.5 rounded-full bg-primary/40 transition-all hover:bg-primary/60"
            }
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
