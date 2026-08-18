
import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useDataOperation } from "@/hooks/useDataOperation";

interface UserVerificationTableProps {
  users: any[];
  onUserVerified: () => void;
}

const UserVerificationTable = ({ users, onUserVerified }: UserVerificationTableProps) => {
  const { toast } = useToast();
  const { executeOperation, isLoading } = useDataOperation();
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  
  const handleVerifyUser = async (userId: string, profileType: string) => {
    setProcessingUsers(prev => ({ ...prev, [userId]: true }));
    
    try {
      // Determine which profile table to update based on user role
      const profileTable = 
        profileType === 'tenant' ? 'tenant_profiles' :
        profileType === 'agent' ? 'realtor_profiles' :
        profileType === 'landlord' ? 'landlord_profiles' : null;
      
      if (!profileTable) {
        toast({
          title: "Error",
          description: "Unknown user type. Could not verify.",
          variant: "destructive",
        });
        return;
      }

      await executeOperation(
        async () => {
          return await supabase
            .from(profileTable)
            .update({ 
              is_verified: true,
              status: 'verified'
            })
            .eq('id', userId);
        },
        {
          successMessage: "User verified successfully",
          onSuccess: () => {
            onUserVerified();
          },
          errorMessage: "Failed to verify user",
        }
      );
    } finally {
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (!users || users.length === 0) {
    return <div className="text-center py-8">No users pending verification</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>
                <Badge
                  className={
                    user.role === "tenant"
                      ? "bg-blue-100 text-blue-800"
                      : user.role === "agent"
                      ? "bg-green-100 text-green-800"
                      : user.role === "landlord"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "verified" ? "default" : "outline"}>
                  {user.status || "Incomplete"}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => handleVerifyUser(user.id, user.role)}
                  disabled={isLoading || processingUsers[user.id] || user.status === "verified"}
                  className={user.status === "verified" ? "bg-green-500" : ""}
                >
                  {user.status === "verified" ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Verified
                    </>
                  ) : processingUsers[user.id] ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify User"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserVerificationTable;
