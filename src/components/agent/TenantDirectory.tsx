
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import EmptyState from "@/components/tenant/EmptyState";
import { TenantProfile } from "@/hooks/useAgentData";

interface TenantDirectoryProps {
  tenants: TenantProfile[];
  profileStatus: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSendInvite: (tenantId: string) => void;
}

const TenantDirectory = ({ 
  tenants, 
  profileStatus, 
  searchQuery = "", 
  onSearchChange, 
  onSendInvite 
}: TenantDirectoryProps) => {
  
  // Local state if parent doesn't provide search functionality
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const effectiveSearchQuery = onSearchChange ? searchQuery : localSearchQuery;
  
  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setLocalSearchQuery(value);
    }
  };
  
  const filteredTenants = tenants.filter(tenant => {
    const query = effectiveSearchQuery.toLowerCase();
    return (
      tenant.user_email?.toLowerCase().includes(query) ||
      tenant.preferred_locations?.some(location => location.toLowerCase().includes(query)) ||
      (tenant.bio && tenant.bio.toLowerCase().includes(query))
    );
  });

  const formattedIncome = (income: number | null) => {
    if (!income) return "Not specified";
    return `$${income.toLocaleString()}/month`;
  };

  const isVerified = profileStatus === "verified" || profileStatus === "premium";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tenant Directory</CardTitle>
        <CardDescription>
          Browse through pre-screened, move-ready tenants.
        </CardDescription>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by location, email, or description..."
            className="pl-10"
            value={effectiveSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isVerified ? (
          filteredTenants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTenants.map((tenant) => (
                <Card key={tenant.id} className="overflow-hidden">
                  <CardHeader className="bg-role-tenant/10 pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="bg-role-tenant/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{tenant.user_email}</p>
                          <p className="text-sm text-muted-foreground">
                            Moving: {tenant.move_in_date ? new Date(tenant.move_in_date).toLocaleDateString() : 'Flexible'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-role-agent/10 text-role-agent">
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Household</p>
                          <p className="font-medium">{tenant.household_size || 'Not specified'} {tenant.household_size === 1 ? 'person' : 'people'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Income</p>
                          <p className="font-medium">{formattedIncome(tenant.household_income)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pets</p>
                          <p className="font-medium">{tenant.pets ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Preferred Locations</p>
                          <p className="font-medium truncate">{tenant.preferred_locations?.join(', ') || 'Not specified'}</p>
                        </div>
                      </div>
                      {tenant.bio && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bio</p>
                          <p className="text-sm line-clamp-2">{tenant.bio}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/40">
                    <Button 
                      className="w-full" 
                      onClick={() => onSendInvite(tenant.id)}
                    >
                      Invite to Property
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<User className="h-6 w-6 text-muted-foreground" />}
              title="No tenants found"
              description="No verified tenants match your search criteria."
            />
          )
        ) : (
          <EmptyState
            icon={<User className="h-6 w-6 text-muted-foreground" />}
            title="Verification Required"
            description="You need to be verified to access the tenant directory."
            action={<Button>Get Verified</Button>}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TenantDirectory;
