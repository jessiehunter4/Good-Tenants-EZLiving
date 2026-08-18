
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TenantHeader from "@/components/tenant/TenantHeader";
import ProfileSummary from "@/components/tenant/ProfileSummary";
import InvitationsList from "@/components/tenant/InvitationsList";
import UpgradeSection from "@/components/tenant/UpgradeSection";
import PropertyDirectory from "@/components/tenant/PropertyDirectory";
import PropertyShowingModal from "@/components/shared/PropertyShowingModal";
import { useTenantData } from "@/hooks/useTenantData";
import { usePropertyData } from "@/hooks/usePropertyData";
import { Listing } from "@/types/listings";

const TenantDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, invitations, loading: tenantLoading, refreshData } = useTenantData();
  const { listings, loading: propertyLoading, expressInterest, requestShowing } = usePropertyData();
  
  const [showingModal, setShowingModal] = useState<{isOpen: boolean, property: Listing | null}>({
    isOpen: false,
    property: null
  });

  const loading = tenantLoading || propertyLoading;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const handleExpressInterest = (listingId: string) => {
    expressInterest(listingId);
  };

  const handleViewProperty = (listingId: string) => {
    const property = listings.find(l => l.id === listingId);
    if (property) {
      setShowingModal({ isOpen: true, property });
    }
  };

  const handleRequestShowing = (date: Date, time: string, message: string) => {
    if (showingModal.property) {
      requestShowing(showingModal.property.id, date, time, message);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <TenantHeader email={user?.email} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8">
        {profile && (
          <div className="mb-8">
            <ProfileSummary profile={profile} />
          </div>
        )}

        <Tabs defaultValue="properties">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">Browse Properties</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade to Pre-Screened</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyDirectory 
              listings={listings}
              onExpressInterest={handleExpressInterest}
              onViewProperty={handleViewProperty}
            />
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationsList 
              invitations={invitations} 
              onStatusChange={refreshData} 
            />
          </TabsContent>

          <TabsContent value="upgrade">
            <UpgradeSection />
          </TabsContent>
        </Tabs>
      </main>

      <PropertyShowingModal
        isOpen={showingModal.isOpen}
        onClose={() => setShowingModal({ isOpen: false, property: null })}
        onRequestShowing={handleRequestShowing}
        property={showingModal.property}
      />
    </div>
  );
};

export default TenantDashboard;
