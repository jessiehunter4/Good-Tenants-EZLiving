import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroScene from "@/assets/landing/hero.svg";

/**
 * The hero, merged.
 *
 * Coming Soon Home Rentals leads with urgency — "the best rentals go fast, see
 * first, apply first, get approved first" — and Irvine Living Daily leads with
 * the daily channel. The promise that converts is the first; the reason to come
 * back is the second, so it sits underneath rather than competing.
 *
 * The listing ID lookup is CSHR's, kept because people arrive holding one from
 * a flyer or a text and it is the shortest path they have.
 */
export const MergedHero = () => {
  const navigate = useNavigate();
  const [listingId, setListingId] = useState("");

  const lookUp = (event: React.FormEvent) => {
    event.preventDefault();
    if (listingId.trim()) navigate(`/rentals?listing=${encodeURIComponent(listingId.trim())}`);
  };

  return (
    <section className="bg-sand">
      <div className="page-shell grid items-center gap-10 pt-12 lg:grid-cols-2 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-clay px-3 py-1 text-xs font-semibold text-espresso">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            New and coming-soon rentals, daily
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl">
            Find rental homes
            <br />
            first
          </h1>

          <p className="mt-5 max-w-lg text-lg font-semibold text-espresso">
            The best rentals go fast. See first. Apply first. Get approved first.
          </p>
          <p className="mt-3 max-w-lg font-medium text-espresso-muted">
            Coming-soon listings before they reach the public sites, one reusable application
            that every landlord here accepts, and a daily read on the Irvine market.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => navigate("/register?role=tenant")}
              className="bg-espresso px-8 text-sand hover:bg-espresso/90"
            >
              Get pre-qualified
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/rentals")}
              className="border-espresso/20 px-8 text-espresso hover:bg-clay/50"
            >
              Browse rentals
            </Button>
          </div>

          <form onSubmit={lookUp} className="mt-8 max-w-md">
            <label htmlFor="listing-id" className="text-sm font-medium text-espresso-muted">
              Have a listing ID? Look it up instantly.
            </label>
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <MapPin
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-muted"
                  aria-hidden="true"
                />
                <Input
                  id="listing-id"
                  value={listingId}
                  onChange={(event) => setListingId(event.target.value)}
                  placeholder="e.g. CS-10428"
                  className="h-11 border-0 bg-background pl-9 text-espresso"
                />
              </div>
              <Button type="submit" variant="secondary" className="h-11">
                <Search className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Find
              </Button>
            </div>
          </form>
        </div>

        <img src={heroScene} alt="" aria-hidden="true" className="w-full rounded-2xl" />
      </div>
    </section>
  );
};

export default MergedHero;
