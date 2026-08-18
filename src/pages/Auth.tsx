
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { dashboardPathFor } from '@/features/access/dashboardPath';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthCard from "@/components/auth/AuthCard";

const Auth = () => {
  const { user, getUserRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Process query parameters for pre-filled form data
  const queryParams = new URLSearchParams(location.search);

  // Extract values that might be passed from the summer landing page
  const name = queryParams.get("name");
  const email = queryParams.get("email");
  const phone = queryParams.get("phone");
  const moveInDate = queryParams.get("moveInDate");
  const city = queryParams.get("city");
  const role = queryParams.get("role");

  /*
   * These parameters only ever meant "this person wants to register", and
   * registration used to be the second tab on this page. It is now its own
   * route, so anything still pointing here — landing page CTAs, bookmarks,
   * links already sent — is forwarded rather than dropped on a sign-in form
   * with its role quietly discarded.
   */
  const hasRegistrationIntent = Boolean(name || email || phone || moveInDate || city || role);

  useEffect(() => {
    if (!hasRegistrationIntent || user) return;

    sessionStorage.setItem(
      "prefilled_registration",
      JSON.stringify({
        name,
        email,
        phone,
        moveInDate,
        city,
        role: role || "tenant",
      }),
    );
    navigate(`/register${location.search}`, { replace: true });
  }, [hasRegistrationIntent, user, name, email, phone, moveInDate, city, role, navigate, location.search]);

  // Handle authenticated users who access /auth directly
  useEffect(() => {
    if (user) {
      // `replace`, so Back does not return to a sign-in page that redirects
      // again. See `dashboardPathFor` for why the switch is not written here.
      navigate(dashboardPathFor(getUserRole()), { replace: true });
    }
  }, [user, getUserRole, navigate]);

  // Don't show auth card if user is already authenticated
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30 px-4">
      {/* Signing in is a dead end without this: the card has no navigation, so
          anyone who lands here by mistake has only the browser's back button. */}
      <div className="mx-auto w-full max-w-md pt-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center py-8">
        <AuthCard />
      </div>
    </div>
  );
};

export default Auth;
