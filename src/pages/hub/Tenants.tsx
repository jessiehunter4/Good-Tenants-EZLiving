import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import PageHeading from "@/components/daily/PageHeading";
import TenantCard from "@/components/directory/TenantCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  directoryQuery,
  EMPTY_DIRECTORY_FILTERS,
  type DirectoryFilters,
} from "@/hooks/tenant/useDirectory";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Carried across from Good Tenants Hub's `/tenants` and `/search-tenants`,
 * which were the same list with different controls.
 *
 * There is deliberately no filter here for anything a fair housing rule
 * protects — no household composition, no children, no age, no national
 * origin. The statement at /fair-housing says the directory cannot be sorted
 * that way, and the way to keep that true is not to build the control.
 */
const Tenants = () => {
  const [filters, setFilters] = useState<DirectoryFilters>(EMPTY_DIRECTORY_FILTERS);
  const { data = [], isLoading, error } = useQuery(directoryQuery(filters));

  // Rent is filtered here rather than in the query: a renter who kept their
  // range private has null, and excluding them from a rent search would reveal
  // that they fall outside it.
  const tenants = useMemo(() => {
    if (filters.maxRent == null) return data;
    return data.filter(
      (t) => t.max_monthly_rent == null || Number(t.max_monthly_rent) <= filters.maxRent!,
    );
  }, [data, filters.maxRent]);

  useDocumentMeta({
    title: "Tenant directory — Good Tenants EZ Living",
    description: "Renters who are application-ready and chose to be listed.",
    noindex: true,
  });

  const set = <K extends keyof DirectoryFilters>(key: K, value: DirectoryFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  return (
    <SiteLayout>
      <div className="page-shell py-14">
        <PageHeading
          eyebrow="For landlords and agents"
          title="Tenant directory"
          intro="Renters who have built their package and chosen to be listed. Each one decides what you see here."
        />

        <Card className="mb-6 grid gap-4 p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
          <div>
            <Label htmlFor="dir-city" className="text-xs">
              City
            </Label>
            <div className="relative mt-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-muted" />
              <Input
                id="dir-city"
                value={filters.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Irvine"
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dir-beds" className="text-xs">
              Bedrooms needed
            </Label>
            <Input
              id="dir-beds"
              type="number"
              value={filters.minBedrooms ?? ""}
              onChange={(e) => set("minBedrooms", e.target.value ? Number(e.target.value) : null)}
              placeholder="Any"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dir-rent" className="text-xs">
              Their budget at least
            </Label>
            <Input
              id="dir-rent"
              type="number"
              value={filters.maxRent ?? ""}
              onChange={(e) => set("maxRent", e.target.value ? Number(e.target.value) : null)}
              placeholder="Any"
              className="mt-1"
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2 pb-2">
              <Switch
                id="dir-ready"
                checked={filters.preScreenedOnly}
                onCheckedChange={(v) => set("preScreenedOnly", v)}
              />
              <Label htmlFor="dir-ready" className="text-xs">
                Ready only
              </Label>
            </div>
            <Button
              variant="outline"
              className="mb-1 border-clay text-espresso"
              onClick={() => setFilters(EMPTY_DIRECTORY_FILTERS)}
            >
              Clear
            </Button>
          </div>
        </Card>

        <p className="mb-4 text-sm text-espresso-muted">
          {isLoading ? "Loading…" : `${tenants.length} ${tenants.length === 1 ? "renter" : "renters"}`}
        </p>

        {error ? (
          <Card className="border-destructive/40 bg-destructive/5 p-6">
            <p className="font-semibold text-destructive">Couldn't load the directory.</p>
            <p className="mt-1 text-sm text-espresso-muted">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-clay/30" />
            ))}
          </div>
        ) : tenants.length === 0 ? (
          <Card className="border-dashed p-12 text-center">
            <p className="font-semibold text-espresso">Nobody matches that yet</p>
            <p className="mt-1 text-sm text-espresso-muted">
              Only renters who published their profile and were approved appear here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <TenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Tenants;
