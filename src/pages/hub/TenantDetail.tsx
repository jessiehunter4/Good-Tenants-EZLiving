import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import SiteLayout from "@/components/site/SiteLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/hooks/admin/crud";
import {
  directoryTenantQuery,
  myAccessRequestsQuery,
  privatePackageQuery,
  useRequestAccess,
} from "@/hooks/tenant/useDirectory";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * One renter, as a partner sees them.
 *
 * Carried across from Good Tenants Hub's `/tenant/$id`. Two tiers are visible
 * here and the difference is enforced by the database, not by this page: the
 * directory row is what the renter published, and the package below it returns
 * nothing at all until they grant a request.
 */
const TenantDetail = () => {
  const { id = "" } = useParams();
  const { data: tenant, isLoading } = useQuery(directoryTenantQuery(id));
  const { data: requests = [] } = useQuery(myAccessRequestsQuery);
  const { data: packet } = useQuery(privatePackageQuery(id));
  const request = useRequestAccess();
  const [purpose, setPurpose] = useState("");

  useDocumentMeta({
    title: tenant ? `${tenant.display_name} — Tenant directory` : "Tenant",
    noindex: true,
  });

  const existing = requests.find((r) => r.tenant_id === id);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="page-shell py-16">
          <div className="h-64 animate-pulse rounded-2xl bg-clay/30" />
        </div>
      </SiteLayout>
    );
  }

  if (!tenant) {
    return (
      <SiteLayout>
        <div className="page-shell py-24 text-center">
          <h1 className="text-3xl font-extrabold text-espresso">This profile isn't listed</h1>
          <p className="mt-3 text-espresso-muted">
            The renter may have unpublished it, or it may be awaiting approval.
          </p>
          <Button asChild className="mt-6 bg-espresso text-sand hover:bg-espresso/90">
            <Link to="/tenants">Back to the directory</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-espresso">
              {tenant.display_name}
            </h1>
            {tenant.household_type && (
              <p className="mt-1 capitalize text-espresso-muted">
                {tenant.household_type.replace("_", " ")}
                {tenant.household_size != null && ` · ${tenant.household_size} in household`}
              </p>
            )}
          </div>
          {tenant.is_pre_screened && (
            <Badge className="gap-1 bg-success text-success-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Application-ready
            </Badge>
          )}
        </div>

        {tenant.bio && <p className="mt-6 leading-relaxed text-espresso-muted">{tenant.bio}</p>}

        <Card className="mt-8 p-6">
          <h2 className="text-lg font-bold text-espresso">What they're looking for</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Fact label="Cities" value={tenant.desired_cities?.join(", ")} />
            <Fact label="Bedrooms" value={tenant.min_bedrooms ? `${tenant.min_bedrooms}+` : null} />
            <Fact
              label="Budget"
              value={
                tenant.max_monthly_rent != null
                  ? `Up to $${Number(tenant.max_monthly_rent).toLocaleString()}/mo`
                  : null
              }
            />
            <Fact label="Pets" value={tenant.pets == null ? null : tenant.pets ? "Yes" : "No"} />
            <Fact label="Can move from" value={tenant.earliest_move_date} />
            <Fact label="Income" value={tenant.income_band} />
            <Fact
              label="Credit"
              value={tenant.credit_band ? tenant.credit_band.replace("_", " ") : null}
            />
          </dl>
          <p className="mt-4 text-xs text-espresso-muted">
            Blank entries are details this renter chose not to publish.
          </p>
        </Card>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-espresso-muted" />
            <h2 className="text-lg font-bold text-espresso">Their application package</h2>
          </div>

          {packet ? (
            <>
              <p className="mt-2 text-sm text-success">
                {tenant.display_name} granted you access.
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Fact label="Income band" value={packet.income_band} />
                <Fact label="Credit band" value={packet.credit_band} />
                <Fact label="Evictions" value={packet.eviction_status} />
                <Fact label="Background" value={packet.background_status} />
              </dl>
            </>
          ) : existing ? (
            <p className="mt-2 text-sm text-espresso-muted">
              {existing.consent_granted === false
                ? "This renter declined your request."
                : "Your request is with the renter. You'll see their package here if they approve it."}
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-espresso-muted">
                Income, credit, eviction and background details are released only when the renter
                agrees. Tell them why you're asking.
              </p>
              <Textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                placeholder="Considering them for 12 Great Park Blvd"
                className="mt-3"
                aria-label="Why you are requesting access"
              />
              <Button
                className="mt-3 bg-espresso text-sand hover:bg-espresso/90"
                disabled={request.isPending || purpose.trim().length === 0}
                onClick={() =>
                  request.mutate(
                    { tenantId: id, purpose: purpose.trim() },
                    {
                      onSuccess: () => toast.success("Request sent to the renter"),
                      onError: (e) => toast.error(errorMessage(e)),
                    },
                  )
                }
              >
                {request.isPending ? "Sending…" : "Request access"}
              </Button>
            </>
          )}
        </Card>
      </div>
    </SiteLayout>
  );
};

const Fact = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-espresso-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold capitalize text-espresso">{value}</dd>
    </div>
  );
};

export default TenantDetail;
