import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPTY_FILTERS, type RentalFilters } from "@/hooks/rentals/useRentals";

const ANY = "any";

type RentalFiltersBarProps = {
  filters: RentalFilters;
  onChange: (filters: RentalFilters) => void;
};

const numberOrNull = (value: string): number | null =>
  value === ANY ? null : Number(value);

/** Carried across from the rentals site's search controls. */
export const RentalFiltersBar = ({ filters, onChange }: RentalFiltersBarProps) => {
  const set = <K extends keyof RentalFilters>(key: K, value: RentalFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 rounded-2xl border border-clay/50 bg-card p-4 md:grid-cols-[2fr_repeat(3,1fr)_auto]">
      <div>
        <Label htmlFor="rental-location" className="text-xs">
          Where
        </Label>
        <div className="relative mt-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-muted" />
          <Input
            id="rental-location"
            value={filters.location ?? ""}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Street, city or neighborhood"
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="rental-rent" className="text-xs">
          Max rent
        </Label>
        <Input
          id="rental-rent"
          type="number"
          inputMode="numeric"
          value={filters.maxRent ?? ""}
          onChange={(e) => set("maxRent", e.target.value ? Number(e.target.value) : null)}
          placeholder="Any"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="rental-beds" className="text-xs">
          Bedrooms
        </Label>
        <Select
          value={filters.minBedrooms?.toString() ?? ANY}
          onValueChange={(v) => set("minBedrooms", numberOrNull(v))}
        >
          <SelectTrigger id="rental-beds" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="rental-pets" className="text-xs">
          Pets
        </Label>
        <Select
          value={filters.pets ?? ANY}
          onValueChange={(v) => set("pets", v as RentalFilters["pets"])}
        >
          <SelectTrigger id="rental-pets" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="allowed">Pets allowed</SelectItem>
            <SelectItem value="not_allowed">No pets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          className="w-full border-clay text-espresso"
          onClick={() => onChange(EMPTY_FILTERS)}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default RentalFiltersBar;
