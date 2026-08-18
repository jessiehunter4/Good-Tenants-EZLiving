import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, MapPin, Maximize } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface PublicListing {
  id: string;
  city: string | null;
  state: string | null;
  price: number | null;
  bedrooms: number | null;
  square_feet: number | null;
}

const money = (value: number | null) =>
  value === null
    ? "Price on application"
    : `${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)} / month`;

/**
 * Live listings, or an honest empty state.
 *
 * The reference fills this row with invented properties. Showing three fictional
 * homes on a rental site is not a placeholder, it is a false advertisement — so
 * when the table is empty this says so and points at the thing that actually
 * helps: building a profile before the inventory arrives.
 */
export const RentalsSection = () => {
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, city, state, price, bedrooms, square_feet")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) console.error("Could not load listings:", error);
      setListings(data ?? []);
      setLoading(false);
    };

    void load();
  }, []);

  return (
    <section id="rentals" className="bg-background py-20 sm:py-28">
      <div className="page-shell">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-espresso sm:text-4xl">
          Available now
        </h2>

        {loading && (
          <p className="mt-10 text-center font-medium text-espresso-muted">Loading…</p>
        )}

        {!loading && listings.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl bg-clay p-10 text-center">
            <p className="font-bold text-espresso">No properties listed yet</p>
            <p className="mt-2 font-medium text-espresso-muted">
              Landlords are still coming aboard. Build your profile now and you will be ready to
              apply the day something suits you.
            </p>
            <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
              <Link to="/register?role=tenant">Build my profile</Link>
            </Button>
          </div>
        )}

        {listings.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {listings.map((listing) => (
              <article key={listing.id} className="overflow-hidden rounded-2xl bg-clay">
                <div className="aspect-[4/3] bg-clay-soft" aria-hidden="true" />
                <div className="space-y-3 p-5">
                  <p className="flex items-center gap-2 font-bold text-espresso">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {[listing.city, listing.state].filter(Boolean).join(", ") || "Location on request"}
                  </p>
                  <div className="flex gap-5 text-sm font-medium text-espresso-muted">
                    {listing.bedrooms !== null && (
                      <span className="flex items-center gap-1.5">
                        <BedDouble className="h-4 w-4" aria-hidden="true" />
                        {listing.bedrooms} bed
                      </span>
                    )}
                    {listing.square_feet !== null && (
                      <span className="flex items-center gap-1.5">
                        <Maximize className="h-4 w-4" aria-hidden="true" />
                        {listing.square_feet} sq ft
                      </span>
                    )}
                  </div>
                  <p className="pt-1 text-lg font-extrabold text-espresso">{money(listing.price)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RentalsSection;
