import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import RoleChooser from "@/components/auth/RoleChooser";
import RegisterDetailsForm from "@/components/auth/RegisterDetailsForm";
import { isSignupRole, type SignupRole } from "@/components/auth/registerRoles";
import { BRAND } from "@/config/brand";

interface PrefilledRegistration {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  moveInDate?: string;
}

/**
 * Registration, as a page rather than a tab.
 *
 * Choosing an account type decides which onboarding runs and which dashboard
 * you land on, so it gets the whole screen instead of three radio buttons under
 * a password field. Everything after that choice is a short form on the same
 * background, so the flow reads as one thing.
 */
const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<SignupRole | null>(null);
  const [prefilled, setPrefilled] = useState<PrefilledRegistration | null>(null);

  const roleFromUrl = new URLSearchParams(location.search).get("role");

  useEffect(() => {
    const stored = sessionStorage.getItem("prefilled_registration");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as PrefilledRegistration;
      setPrefilled(parsed);
      sessionStorage.removeItem("prefilled_registration");
      // Arriving from a role-specific call to action already answers step one.
      if (isSignupRole(parsed.role)) setRole(parsed.role);
    } catch (error) {
      console.error("Error parsing prefilled registration data:", error);
    }
  }, []);

  useEffect(() => {
    if (isSignupRole(roleFromUrl)) setRole(roleFromUrl);
  }, [roleFromUrl]);

  return (
    <div className="min-h-screen bg-background">

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        <header className="flex items-center justify-between">
          {/* The wordmark used to sit here too, directly above an <h1> that
              says "Welcome to Good Tenants" — two links to / and the brand name
              twice in 80px of vertical space. */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          {role === null ? (
            <div className="duration-300 animate-in fade-in">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Welcome to {BRAND.name}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">How would you like to get started?</p>
              </div>

              <div className="mt-12">
                <RoleChooser onChoose={setRole} />
              </div>

              <p className="mt-10 text-center text-sm text-muted-foreground">
                Most of this is editable later. Your account type is not, so pick the one that
                describes you today.
              </p>
            </div>
          ) : (
            <div className="flex justify-center duration-300 animate-in fade-in">
              <RegisterDetailsForm
                role={role}
                defaultEmail={prefilled?.email}
                defaultFullName={prefilled?.name}
                defaultPhone={prefilled?.phone}
                defaultCity={prefilled?.city}
                onBack={() => setRole(null)}
                onRegistered={() => navigate("/auth")}
              />
            </div>
          )}
        </main>

        <footer className="text-center text-xs text-muted-foreground">
          By continuing, you agree to {BRAND.name}'s Terms of Service and Privacy Policy.
        </footer>
      </div>
    </div>
  );
};

export default Register;
