
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandlordHeader from "@/components/landlord/LandlordHeader";
import ProfileSummary from "@/components/landlord/ProfileSummary";
import ListingsSection from "@/components/landlord/ListingsSection";
import TenantDirectory from "@/components/landlord/tenant-directory";
import ROICalculator from "@/components/analytics/ROICalculator";
import { FeatureGate } from "@/components/access";
import { useLandlordData } from "@/hooks/useLandlordData";
import EmptyState from "@/components/tenant/EmptyState";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    tenants, 
    listings, 
    loading, 
    searchQuery,
    setSearchQuery,
    handleSendInvite,
    canAccessTenantDirectory,
    signOut
  } = useLandlordData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleCreateProperty = () => {
    navigate("/create-property");
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <LandlordHeader email={user?.email} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8">
        {profile && <div className="mb-8"><ProfileSummary profile={profile} /></div>}

        <Tabs defaultValue="tenants">
          <TabsList className="mb-4">
            <TabsTrigger value="tenants">Find Tenants</TabsTrigger>
            <TabsTrigger value="listings">My Properties</TabsTrigger>
            <TabsTrigger value="roi-calculator">ROI Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <FeatureGate 
              permission="view_tenant_directory"
              requiredTier="verified"
              showUpgrade={true}
              onUpgrade={() => {
                // TODO: Implement upgrade/verification flow
                console.log("Upgrade clicked");
              }}
              fallback={
                <EmptyState
                  icon={<Plus className="h-8 w-8 text-muted-foreground" />}
                  title="Create a Property Listing First"
                  description={
                    listings.length === 0 
                      ? "To access our tenant directory, you need to create at least one property listing. This ensures all landlords have active properties available for tenants."
                      : "You need to be verified to access the tenant directory."
                  }
                  action={
                    listings.length === 0 ? (
                      <Button onClick={handleCreateProperty}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Property
                      </Button>
                    ) : (
                      <Button disabled>
                        Verification Required
                      </Button>
                    )
                  }
                />
              }
            >
              <TenantDirectory 
                tenants={tenants}
                profileStatus={profile?.status || 'incomplete'}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSendInvite={handleSendInvite}
                properties={listings}
              />
            </FeatureGate>
          </TabsContent>

          <TabsContent value="listings">
            <FeatureGate permission="manage_listings">
              <ListingsSection listings={listings} />
            </FeatureGate>
          </TabsContent>

          <TabsContent value="roi-calculator">
            <ROICalculator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LandlordDashboard;
