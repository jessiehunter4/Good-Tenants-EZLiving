import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Check, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { findRole, type SignupRole } from "./registerRoles";

const detailsSchema = z
  .object({
    fullName: z.string().trim().min(2, { message: "Please tell us your name." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().trim().optional(),
    // Six characters, matching the floor the auth service enforces. A stricter
    // rule here would only move the same rejection to the API.
    password: z.string().min(6, { message: "Passwords need at least 6 characters." }),

    // Tenant
    desiredCity: z.string().trim().optional(),
    maxMonthlyRent: z.string().trim().optional(),
    moveTiming: z.enum(["asap", "soon", "flexible"]).optional(),

    // Landlord
    propertyCount: z.string().trim().optional(),
    managementType: z.enum(["self", "company", "hybrid"]).optional(),

    // Agent
    agency: z.string().trim().optional(),
    licenseNumber: z.string().trim().optional(),
    yearsExperience: z.string().trim().optional(),
  })
  .and(z.object({ role: z.enum(["tenant", "landlord", "agent"]) }));

export type DetailsFormValues = z.infer<typeof detailsSchema>;

/** Only the keys the account actually chose. Metadata is copied into the
 *  matching profile row by handle_new_user, so sending a landlord's fields for
 *  a tenant would write columns nobody asked for. */
function metadataFor(values: DetailsFormValues): Record<string, string> {
  const shared: Record<string, string> = { display_name: values.fullName };
  if (values.phone) shared.phone = values.phone;

  switch (values.role) {
    case "tenant":
      return {
        ...shared,
        ...(values.desiredCity ? { desired_city: values.desiredCity } : {}),
        ...(values.maxMonthlyRent ? { max_monthly_rent: values.maxMonthlyRent } : {}),
        ...(values.moveTiming ? { move_date_flexibility: values.moveTiming } : {}),
      };
    case "landlord":
      return {
        ...shared,
        ...(values.propertyCount ? { property_count: values.propertyCount } : {}),
        ...(values.managementType ? { management_type: values.managementType } : {}),
      };
    case "agent":
      return {
        ...shared,
        ...(values.agency ? { agency: values.agency } : {}),
        ...(values.licenseNumber ? { license_number: values.licenseNumber } : {}),
        ...(values.yearsExperience ? { years_experience: values.yearsExperience } : {}),
      };
  }
}

interface RegisterDetailsFormProps {
  role: SignupRole;
  defaultEmail?: string;
  defaultFullName?: string;
  defaultPhone?: string;
  defaultCity?: string;
  onBack: () => void;
  onRegistered: () => void;
}

export const RegisterDetailsForm = ({
  role,
  defaultEmail,
  defaultFullName,
  defaultPhone,
  defaultCity,
  onBack,
  onRegistered,
}: RegisterDetailsFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const option = findRole(role);

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      role,
      fullName: defaultFullName ?? "",
      email: defaultEmail ?? "",
      phone: defaultPhone ?? "",
      password: "",
      desiredCity: defaultCity ?? "",
      maxMonthlyRent: "",
      moveTiming: "flexible",
      propertyCount: "",
      managementType: "self",
      agency: "",
      licenseNumber: "",
      yearsExperience: "",
    },
  });

  const goToDetails = async () => {
    const valid = await form.trigger(["fullName", "email", "password", "phone"]);
    if (valid) setStep(2);
  };

  const onSubmit = async (values: DetailsFormValues) => {
    try {
      setIsLoading(true);
      await signUp(values.email, values.password, values.role, metadataFor(values));
      toast({
        title: "Account created",
        description: "Check your email for the confirmation link, then sign in.",
      });
      onRegistered();
    } catch (error) {
      // signUp surfaces its own toast; this keeps the button from hanging.
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl bg-card p-6 text-card-foreground shadow-2xl sm:p-8">
      <ol className="mb-6 flex items-center gap-2" aria-label={`Step ${step + 1} of 3`}>
        {["Role", "Account", "Details"].map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
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
                  "text-xs font-medium",
                  isCurrent || isDone ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
              <span
                className={cn("ml-1 h-px flex-1", isDone ? "bg-primary" : "bg-border")}
                aria-hidden="true"
              />
            </li>
          );
        })}
      </ol>

      {option && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
              option.badgeClass,
            )}
          >
            <option.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight">{option.title}</p>
            <p className="text-xs text-muted-foreground">{option.next}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="shrink-0">
            Change
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4 duration-200 animate-in fade-in slide-in-from-right-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jesse Hunter" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="font-normal text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="(949) 555-0134" autoComplete="tel" {...field} />
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
                          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
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

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onBack}>
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="button" className="flex-1" onClick={goToDetails}>
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 duration-200 animate-in fade-in slide-in-from-right-2">
              {role === "tenant" && (
                <>
                  <FormField
                    control={form.control}
                    name="desiredCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where are you looking?</FormLabel>
                        <FormControl>
                          <Input placeholder="Irvine" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxMonthlyRent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly budget</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" placeholder="3200" {...field} />
                        </FormControl>
                        <FormDescription>
                          The most you want to pay per month. You can change this later.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moveTiming"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>When do you want to move?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose one" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="asap">As soon as possible</SelectItem>
                            <SelectItem value="soon">In the next few months</SelectItem>
                            <SelectItem value="flexible">I'm flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {role === "landlord" && (
                <>
                  <FormField
                    control={form.control}
                    name="propertyCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How many properties do you let?</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" placeholder="3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="managementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How do you manage them?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose one" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="self">Myself</SelectItem>
                            <SelectItem value="company">Through a management company</SelectItem>
                            <SelectItem value="hybrid">A bit of both</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {role === "agent" && (
                <>
                  <FormField
                    control={form.control}
                    name="agency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agency</FormLabel>
                        <FormControl>
                          <Input placeholder="Jessie Hunter Team" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Licence number{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="DRE #01234567" {...field} />
                        </FormControl>
                        <FormDescription>
                          Verification happens later; this just starts the record.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Years in the business{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="numeric" placeholder="8" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
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

export default RegisterDetailsForm;
