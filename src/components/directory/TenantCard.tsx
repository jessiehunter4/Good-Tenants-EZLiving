import { Link } from "react-router-dom";
import { BedDouble, MapPin, PawPrint, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { DirectoryTenant } from "@/hooks/tenant/useDirectory";

/**
 * One renter in the directory.
 *
 * Everything shown here is something the renter chose to show. A band they kept
 * private arrives as null and simply is not rendered — there is no "hidden"
 * placeholder, because telling a landlord that a figure exists but is withheld
 * is itself a disclosure.
 */
export const TenantCard = ({ tenant }: { tenant: DirectoryTenant }) => (
  <Link
    to={`/tenants/${tenant.id}`}
    className="block rounded-2xl border border-clay/50 bg-card p-5 transition hover:shadow-lg"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold text-espresso">{tenant.display_name}</p>
        {tenant.household_type && (
          <p className="text-xs capitalize text-espresso-muted">
            {tenant.household_type.replace("_", " ")}
          </p>
        )}
      </div>
      {tenant.is_pre_screened && (
        <Badge className="shrink-0 gap-1 bg-success text-success-foreground">
          <ShieldCheck className="h-3 w-3" /> Ready
        </Badge>
      )}
    </div>

    <div className="mt-3 flex flex-wrap gap-3 text-xs text-espresso-muted">
      {tenant.household_size != null && (
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {tenant.household_size} in household
        </span>
      )}
      {tenant.min_bedrooms != null && (
        <span className="flex items-center gap-1">
          <BedDouble className="h-3.5 w-3.5" />
          {tenant.min_bedrooms}+ bd
        </span>
      )}
      {tenant.pets && (
        <span className="flex items-center gap-1">
          <PawPrint className="h-3.5 w-3.5" /> Has pets
        </span>
      )}
      {tenant.desired_cities && tenant.desired_cities.length > 0 && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {tenant.desired_cities.slice(0, 2).join(", ")}
        </span>
      )}
    </div>

    <div className="mt-4 flex flex-wrap gap-2">
      {tenant.max_monthly_rent != null && (
        <Badge variant="secondary">Up to ${Number(tenant.max_monthly_rent).toLocaleString()}</Badge>
      )}
      {tenant.income_band && <Badge variant="secondary">{tenant.income_band}</Badge>}
      {tenant.credit_band && (
        <Badge variant="secondary" className="capitalize">
          Credit: {tenant.credit_band.replace("_", " ")}
        </Badge>
      )}
    </div>

    {tenant.bio && <p className="mt-3 line-clamp-2 text-sm text-espresso-muted">{tenant.bio}</p>}
  </Link>
);

export default TenantCard;
