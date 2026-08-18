import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/hooks/admin/useSignupTrend";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface UserStats {
  total: number;
  tenants: number;
  agents: number;
  landlords: number;
  admins: number;
}

export interface StatusStats {
  incomplete: number;
  basic: number;
  verified: number;
  premium: number;
}

interface AdminChartsProps {
  userStats: UserStats;
  tenantStatus: StatusStats;
  agentStatus: StatusStats;
  landlordStatus: StatusStats;
  listingStats: { active: number; inactive: number };
  trend: TrendPoint[];
}

/*
 * Colours come from the role tokens, so a bar for landlords is the same amber
 * as a landlord badge everywhere else. Recharts needs a resolved colour rather
 * than a Tailwind class, so the tokens are read from the stylesheet at render.
 */
const token = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value ? `hsl(${value})` : fallback;
};

/** An empty chart is worse than a sentence saying there is nothing yet. */
const Empty = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-[240px] items-center justify-center text-center text-sm text-muted-foreground">
    {children}
  </div>
);

export const AdminCharts = ({
  userStats,
  tenantStatus,
  agentStatus,
  landlordStatus,
  listingStats,
  trend,
}: AdminChartsProps) => {
  const roleColours = {
    tenant: token("--role-tenant", "hsl(217 91% 60%)"),
    landlord: token("--role-landlord", "hsl(38 92% 50%)"),
    agent: token("--role-agent", "hsl(160 84% 39%)"),
    admin: token("--brand", "hsl(222 47% 24%)"),
    muted: token("--muted-foreground", "hsl(215 16% 47%)"),
  };

  const byRole = [
    { name: "Tenants", value: userStats.tenants, fill: roleColours.tenant },
    { name: "Landlords", value: userStats.landlords, fill: roleColours.landlord },
    { name: "Agents", value: userStats.agents, fill: roleColours.agent },
    { name: "Admins", value: userStats.admins, fill: roleColours.admin },
  ].filter((slice) => slice.value > 0);

  const byStatus = (["incomplete", "basic", "verified", "premium"] as const).map((key) => ({
    stage: key.charAt(0).toUpperCase() + key.slice(1),
    Tenants: tenantStatus[key],
    Landlords: landlordStatus[key],
    Agents: agentStatus[key],
  }));

  const hasProfiles = byStatus.some((row) => row.Tenants + row.Landlords + row.Agents > 0);
  const hasListings = listingStats.active + listingStats.inactive > 0;

  const tooltipStyle = {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--popover-foreground))",
    fontSize: "12px",
  };

  const signupsInWindow = trend.reduce((sum, point) => sum + point.total, 0);

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Signups over the last 30 days</CardTitle>
          <CardDescription>
            {signupsInWindow === 0
              ? "No accounts created in this window."
              : `${signupsInWindow} account${signupsInWindow === 1 ? "" : "s"} created, by day.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signupsInWindow === 0 ? (
            <Empty>Nothing to plot yet. Accounts appear here the day they are created.</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={roleColours.tenant} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={roleColours.tenant} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  minTickGap={24}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11} width={28} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Total accounts"
                  stroke={roleColours.tenant}
                  strokeWidth={2}
                  fill="url(#signups)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who is on the platform</CardTitle>
          <CardDescription>Accounts by role.</CardDescription>
        </CardHeader>
        <CardContent>
          {byRole.length === 0 ? (
            <Empty>No accounts yet.</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byRole}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {byRole.map((slice) => (
                    <Cell key={slice.name} fill={slice.fill} stroke="hsl(var(--background))" />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How far profiles get</CardTitle>
          <CardDescription>
            Each role by completeness. A wall on the left means people sign up and stop.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasProfiles ? (
            <Empty>No profiles yet.</Empty>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="Tenants" stackId="a" fill={roleColours.tenant} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Landlords" stackId="a" fill={roleColours.landlord} />
                <Bar dataKey="Agents" stackId="a" fill={roleColours.agent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Listings</CardTitle>
          <CardDescription>Active against inactive.</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasListings ? (
            <Empty>
              No listings yet. They appear here once landlords and agents start adding property.
            </Empty>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                layout="vertical"
                data={[
                  { name: "Active", value: listingStats.active, fill: roleColours.agent },
                  { name: "Inactive", value: listingStats.inactive, fill: roleColours.muted },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} fontSize={12} width={70} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  <Cell fill={roleColours.agent} />
                  <Cell fill={roleColours.muted} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;
