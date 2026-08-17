
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { devBypassRole, isDevAuthBypass } from "@/lib/devBypass";

export const useAdminAccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAdminAccess = async () => {
    /*
     * Under the development bypass, answer from the stub user rather than the
     * database. This hook queries `users` independently of the auth context,
     * so bypassing sign-in alone is not enough: the query fails against a
     * project that no longer exists, and the catch below redirects away.
     */
    if (isDevAuthBypass()) {
      const isAdmin = devBypassRole() === "admin";
      setHasAccess(isAdmin);
      setLoading(false);
      return isAdmin;
    }

    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return false;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      
      const isAdmin = userData.role === "admin";
      setHasAccess(isAdmin);
      
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You need admin privileges to view this page.",
          variant: "destructive",
        });
        navigate("/");
      }
      
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin access:", error);
      toast({
        title: "Error",
        description: "Failed to verify admin access.",
        variant: "destructive",
      });
      navigate("/");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminAccess();
  }, [user, navigate, toast]);

  return {
    hasAccess,
    loading,
    checkAdminAccess,
  };
};
