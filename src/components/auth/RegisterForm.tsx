import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import agentIllustration from "@/assets/roles/agent.svg";
import landlordIllustration from "@/assets/roles/landlord.svg";
import tenantIllustration from "@/assets/roles/tenant.svg";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Administrator is intentionally not offered here. Admin access is granted
// server-side only; it was previously self-assignable behind a registration
// code that could never validate. See AuthContext.SELF_ASSIGNABLE_ROLES.
const SIGNUP_ROLES = ["tenant", "agent", "landlord"] as const;
type SignupRole = (typeof SIGNUP_ROLES)[number];

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  // Six characters is the floor the auth service itself enforces. A stricter
  // rule here would only move the same rejection from this form to the API.
  password: z.string().min(6, { message: "Passwords need at least 6 characters." }),
  role: z.enum(SIGNUP_ROLES, { required_error: "Please choose one to continue." }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface PrefilledRegistration {
  email?: string;
  role?: SignupRole;
  name?: string;
  phone?: string;
  moveInDate?: string;
  city?: string;
}

interface RoleOption {
  value: SignupRole;
  title: string;
  tagline: string;
  /** What this account type does next, shown once it is chosen. */
  next: string;
  /** Local SVG. Decorative — the card's text carries the meaning, so the
   *  illustrations are hidden from assistive technology rather than described
   *  twice. */
  image: string;
  imageClass: string;
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    value: "tenant",
    title: "I'm looking for a home",
    tagline: "Build one profile and reuse it everywhere",
    next: "Next you'll tell us your budget, timing and where you want to live.",
    image: tenantIllustration,
    imageClass: "bg-blue-50/70",
  },
  {
    value: "landlord",
    title: "I own property",
    tagline: "List a property and meet qualified renters",
    next: "Next you'll add your first property and how you manage it.",
    image: landlordIllustration,
    imageClass: "bg-amber-50/70",
  },
  {
    value: "agent",
    title: "I'm a real estate agent",
    tagline: "Represent clients on both sides of a lease",
    next: "Next you'll add your agency and licence details.",
    image: agentIllustration,
    imageClass: "bg-emerald-50/70",
  },
] as const;

function isSignupRole(value: string | null): value is SignupRole {
  return value !== null && (SIGNUP_ROLES as readonly string[]).includes(value);
}

interface RegisterFormProps {
  setActiveTab: (tab: string) => void;
}

export const RegisterForm = ({ setActiveTab }: RegisterFormProps) => {
  const { signUp } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [prefilledData, setPrefilledData] = useState<PrefilledRegistration | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const roleFromUrl = queryParams.get("role");

  useEffect(() => {
    const storedData = sessionStorage.getItem("prefilled_registration");
    if (!storedData) return;
    try {
      setPrefilledData(JSON.parse(storedData) as PrefilledRegistration);
      // Remove after retrieving so it cannot be applied twice.
      sessionStorage.removeItem("prefilled_registration");
    } catch (error) {
      console.error("Error parsing prefilled registration data:", error);
    }
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", role: undefined },
  });

  // Arriving from a role-specific call to action already answers step one, so
  // skip it rather than asking a question the visitor has just answered.
  useEffect(() => {
    if (isSignupRole(roleFromUrl)) {
      form.setValue("role", roleFromUrl);
      setStep(1);
    }
  }, [roleFromUrl, form]);

  useEffect(() => {
    if (prefilledData?.email) form.setValue("email", prefilledData.email);
    if (prefilledData?.role) {
      form.setValue("role", prefilledData.role);
      setStep(1);
    }
  }, [prefilledData, form]);

  const selectedRole = form.watch("role");
  const activeOption = ROLE_OPTIONS.find((option) => option.value === selectedRole);

  const chooseRole = (role: SignupRole) => {
    form.setValue("role", role, { shouldValidate: true });
    setStep(1);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      await signUp(values.email, values.password, values.role);
      toast({
        title: "Account created",
        description: "Check your email for the confirmation link, then sign in.",
      });
      setActiveTab("login");

      if (prefilledData) {
        sessionStorage.setItem(
          "onboarding_data",
          JSON.stringify({
            name: prefilledData.name,
            phone: prefilledData.phone,
            moveInDate: prefilledData.moveInDate,
            city: prefilledData.city,
          }),
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Progress. Two steps, so a rail reads better than a percentage. */}
      <ol className="flex items-center gap-2" aria-label={`Step ${step + 1} of 2`}>
        {["Your role", "Your details"].map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isDone && !isCurrent && "border-muted-foreground/30 text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isCurrent || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              <span
                className={cn(
                  "ml-1 h-px flex-1 transition-colors",
                  isDone ? "bg-primary" : "bg-border",
                )}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 0 ? (
            <div className="space-y-3 duration-200 animate-in fade-in slide-in-from-right-2">
              <div>
                <h2 className="text-base font-semibold">What brings you here?</h2>
                <p className="text-sm text-muted-foreground">
                  This decides what we ask you next.
                </p>
              </div>

              <div className="space-y-2">
                {ROLE_OPTIONS.map((option) => {
                  const isSelected = selectedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => chooseRole(option.value)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group flex w-full items-center gap-3 overflow-hidden rounded-lg border p-2.5 text-left transition-all",
                        "hover:-translate-y-px hover:border-primary/60 hover:shadow-md",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected ? "border-primary ring-1 ring-primary" : "border-border",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-14 w-[72px] shrink-0 items-center justify-center rounded-md",
                          option.imageClass,
                        )}
                      >
                        <img
                          src={option.image}
                          alt=""
                          aria-hidden="true"
                          width={64}
                          height={48}
                          className="h-12 w-16 object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-tight">
                          {option.title}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {option.tagline}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              <FormField
                control={form.control}
                name="role"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="space-y-4 duration-200 animate-in fade-in slide-in-from-right-2">
              {activeOption && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <span
                    className={cn(
                      "flex h-11 w-14 shrink-0 items-center justify-center rounded-md",
                      activeOption.imageClass,
                    )}
                  >
                    <img
                      src={activeOption.image}
                      alt=""
                      aria-hidden="true"
                      width={48}
                      height={36}
                      className="h-9 w-12 object-contain"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{activeOption.title}</p>
                    <p className="text-xs text-muted-foreground">{activeOption.next}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setStep(0)}
                  >
                    Change
                  </Button>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>Six characters or more.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(0)}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
