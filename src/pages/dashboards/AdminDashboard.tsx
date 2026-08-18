
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "@/components/admin/AdminHeader";
import KPICard from "@/components/admin/KPICard";
import AdminCharts from "@/components/admin/AdminCharts";
import useSignupTrend from "@/hooks/admin/useSignupTrend";
import StatsBreakdown from "@/components/admin/StatsBreakdown";
import UserTable from "@/components/admin/UserTable";
import UserVerificationTable from "@/components/admin/UserVerificationTable";
import TenantProfileTable from "@/components/admin/TenantProfileTable";
import ProfileProgressCard from "@/components/admin/ProfileProgressCard";
import IntegrationCard from "@/components/admin/integrations/IntegrationCard";
import IntegrationRequestsTable from "@/components/admin/integrations/IntegrationRequestsTable";
import IntegrationUsageChart from "@/components/admin/integrations/IntegrationUsageChart";
import IntegrationTester from "@/components/integrations/IntegrationTester";
import useAdminStats from "@/hooks/useAdminStats";
import { useIntegrations } from "@/hooks/useIntegrations";
import { toast } from "@/components/ui/sonner";
import { FileText, Home, Mail, Users } from "lucide-react";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const {
    userStats,
    profileStats,
    listingStats,
    inviteStats,
    recentUsers,
    recentTenants,
    unverifiedUsers,
    loading,
    refreshData
  } = useAdminStats();

  const { trend } = useSignupTrend();

  const {
    integrations,
    integrationRequests,
    usageStats,
    auditLogs,
    loading: integrationsLoading,
    updateIntegrationStatus,
    updateRequestStatus,
    testIntegration,
    refreshData: refreshIntegrations
  } = useIntegrations();

  const handleUserVerified = () => {
    toast.success("User verification status updated");
    refreshData();
  };

  const handleIntegrationStatusChange = (id: string, status: any) => {
    updateIntegrationStatus(id, status);
  };

  const handleRequestStatusUpdate = (id: string, status: any, notes?: string) => {
    updateRequestStatus(id, status, notes);
  };

  const handleTestIntegration = (id: string) => {
    testIntegration(id);
  };

  if (loading || integrationsLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading admin data…</p>
      </div>
    );
  }

  // Helper to calculate total profiles for a role
  const getTotalProfiles = (role: keyof typeof profileStats) => {
    return Object.values(profileStats[role]).reduce((a, b) => a + b, 0);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader email={user?.email} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Total Users" value={userStats.total} icon={Users}>
            <StatsBreakdown
              items={[
                { label: "Tenants", value: userStats.tenants },
                { label: "Agents", value: userStats.agents },
                { label: "Landlords", value: userStats.landlords },
                { label: "Admins", value: userStats.admins },
              ]}
            />
          </KPICard>

          <KPICard
            title="Tenant Profiles"
            value={getTotalProfiles("tenants")}
            icon={FileText}
          >
            <StatsBreakdown
              items={[
                { label: "Incomplete", value: profileStats.tenants.incomplete },
                { label: "Basic", value: profileStats.tenants.basic },
                { label: "Verified", value: profileStats.tenants.verified },
                { label: "Premium", value: profileStats.tenants.premium },
              ]}
            />
          </KPICard>

          <KPICard title="Listings" value={listingStats.total} icon={Home}>
            <StatsBreakdown
              items={[
                { label: "Active", value: listingStats.active },
                { label: "Inactive", value: listingStats.inactive },
              ]}
            />
          </KPICard>

          <KPICard title="Invitations" value={inviteStats.total} icon={Mail}>
            <StatsBreakdown
              items={[
                { label: "Pending", value: inviteStats.pending },
                { label: "Accepted", value: inviteStats.accepted },
                { label: "Declined", value: inviteStats.declined },
              ]}
            />
          </KPICard>
        </div>

        <AdminCharts
          userStats={userStats}
          tenantStatus={profileStats.tenants}
          agentStatus={profileStats.agents}
          landlordStatus={profileStats.landlords}
          listingStats={listingStats}
          trend={trend}
        />

        <Tabs defaultValue="users">
          <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="tenants">Tenant Profiles</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="profiles">Profile Stats</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Recently registered users across all roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserTable users={recentUsers} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tenant Profiles</CardTitle>
                <CardDescription>
                  Most recent tenant profiles registered in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TenantProfileTable tenants={recentTenants} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>User Verification</CardTitle>
                <CardDescription>
                  Review and verify users to grant them full access to the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserVerificationTable 
                  users={unverifiedUsers} 
                  onUserVerified={handleUserVerified}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Profile Statistics</CardTitle>
                <CardDescription>
                  Breakdown of profile completion across user types.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ProfileProgressCard
                    title="Tenant Profiles"
                    icon="user"
                    items={[
                      {
                        label: "Incomplete",
                        value: profileStats.tenants.incomplete,
                        total: getTotalProfiles("tenants"),
                        color: "bg-yellow-400",
                      },
                      {
                        label: "Basic",
                        value: profileStats.tenants.basic,
                        total: getTotalProfiles("tenants"),
                        color: "bg-blue-400",
                      },
                      {
                        label: "Verified",
                        value: profileStats.tenants.verified,
                        total: getTotalProfiles("tenants"),
                        color: "bg-green-400",
                      },
                      {
                        label: "Premium",
                        value: profileStats.tenants.premium,
                        total: getTotalProfiles("tenants"),
                        color: "bg-purple-400",
                      },
                    ]}
                  />
                  
                  <ProfileProgressCard
                    title="Agent Profiles"
                    icon="briefcase"
                    items={[
                      {
                        label: "Incomplete",
                        value: profileStats.agents.incomplete,
                        total: getTotalProfiles("agents"),
                        color: "bg-yellow-400",
                      },
                      {
                        label: "Basic",
                        value: profileStats.agents.basic,
                        total: getTotalProfiles("agents"),
                        color: "bg-blue-400",
                      },
                      {
                        label: "Verified",
                        value: profileStats.agents.verified,
                        total: getTotalProfiles("agents"),
                        color: "bg-green-400",
                      },
                      {
                        label: "Premium",
                        value: profileStats.agents.premium,
                        total: getTotalProfiles("agents"),
                        color: "bg-purple-400",
                      },
                    ]}
                  />
                  
                  <ProfileProgressCard
                    title="Landlord Profiles"
                    icon="building"
                    items={[
                      {
                        label: "Incomplete",
                        value: profileStats.landlords.incomplete,
                        total: getTotalProfiles("landlords"),
                        color: "bg-yellow-400",
                      },
                      {
                        label: "Basic",
                        value: profileStats.landlords.basic,
                        total: getTotalProfiles("landlords"),
                        color: "bg-blue-400",
                      },
                      {
                        label: "Verified",
                        value: profileStats.landlords.verified,
                        total: getTotalProfiles("landlords"),
                        color: "bg-green-400",
                      },
                      {
                        label: "Premium",
                        value: profileStats.landlords.premium,
                        total: getTotalProfiles("landlords"),
                        color: "bg-purple-400",
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <IntegrationUsageChart usageData={usageStats} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Available Integrations</CardTitle>
                  <CardDescription>
                    Manage API integrations and external service connections.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {integrations.map((integration) => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onStatusChange={handleIntegrationStatusChange}
                        onTest={handleTestIntegration}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Requests</CardTitle>
                  <CardDescription>
                    Review and manage requests for new integrations from users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <IntegrationRequestsTable 
                    requests={integrationRequests}
                    onStatusUpdate={handleRequestStatusUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listing Statistics</CardTitle>
                <CardDescription>
                  Overview of property listings in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p>Detailed listing management coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Invitation Statistics</CardTitle>
                <CardDescription>
                  Track invitations between users and their responses.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <p>Detailed invitation tracking coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
