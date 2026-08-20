import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * The signed-in person's role, read from the `users` view.
 *
 * The view collapses a person to their single highest role, which is exactly
 * what a page needs when it is deciding which of two forms to show.
 */
export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setRole(data?.role ?? null);
        setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { role, loading };
}
