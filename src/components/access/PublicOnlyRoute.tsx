import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { dashboardPathFor } from "@/features/access/dashboardPath";

/**
 * For pages that only make sense signed out: the landing page, sign-in and
 * registration.
 *
 * A signed-in person landing on the marketing page had to find their own way
 * back into the product. They are sent to their dashboard instead.
 *
 * It waits for auth to resolve before deciding. Redirecting during the loading
 * frame would bounce a signed-in user out to the landing page and back, and
 * rendering the marketing page first would flash it at someone who is already
 * a customer.
 */
export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, getUserRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (user) {
    return <Navigate to={dashboardPathFor(getUserRole())} replace />;
  }

  return <>{children}</>;
};

export default PublicOnlyRoute;
