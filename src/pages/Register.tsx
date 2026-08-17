import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import RoleChooser from "@/components/auth/RoleChooser";
import RegisterDetailsForm from "@/components/auth/RegisterDetailsForm";
import { isSignupRole, type SignupRole } from "@/components/auth/registerRoles";

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
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* Brand wash. Two soft pools rather than a flat gradient, so the cards
          sit on something with depth without competing with the artwork. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_15%_0%,hsl(var(--role-tenant)/0.28),transparent_60%),radial-gradient(55%_45%_at_85%_10%,hsl(var(--role-landlord)/0.18),transparent_60%)]"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-bold tracking-tight text-canvas-foreground">
              Good Tenants
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-canvas-muted transition-colors hover:text-canvas-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>
          </div>
          <p className="text-sm text-canvas-muted">
            Already have an account?{" "}
            <Link to="/auth" className="font-medium text-canvas-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          {role === null ? (
            <div className="duration-300 animate-in fade-in">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-canvas-foreground sm:text-5xl">
                  Welcome to Good Tenants
                </h1>
                <p className="mt-4 text-lg text-canvas-muted">How would you like to get started?</p>
              </div>

              <div className="mt-12">
                <RoleChooser onChoose={setRole} />
              </div>

              <p className="mt-10 text-center text-sm text-canvas-muted/80">
                You can change most of this later. Your account type you cannot, so pick the one
                that describes you today.
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

        <footer className="text-center text-xs text-canvas-muted/70">
          By continuing, you agree to Good Tenants' Terms of Service and Privacy Policy.
        </footer>
      </div>
    </div>
  );
};

export default Register;
