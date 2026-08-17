
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

// Schema for login form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  setActiveTab: (tab: string) => void;
}

export const LoginForm = ({ setActiveTab }: LoginFormProps) => {
  const { signIn, getUserRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handlePostLoginRedirect = async (userId: string, userRole: string) => {
    console.log("Handling post-login redirect for:", userId, "with role:", userRole);
    
    try {
      let profileTable = "";
      
      switch (userRole) {
        case "tenant":
          profileTable = "tenant_profiles";
          break;
        case "agent":
          profileTable = "realtor_profiles";
          break;
        case "landlord":
          profileTable = "landlord_profiles";
          break;
        case "admin":
          console.log("Redirecting admin to dashboard");
          navigate("/admin-dashboard");
          return;
        default:
          console.log("Unknown role, redirecting to general dashboard");
          navigate("/dashboard");
          return;
      }

      if (profileTable) {
        console.log("Checking profile in table:", profileTable);
        const { data: profileData, error } = await supabase
          .from(profileTable as "tenant_profiles" | "realtor_profiles" | "landlord_profiles")
          .select("status")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          // If there's an error, default to sending to onboarding
          navigateToOnboarding(userRole);
          return;
        }

        console.log("Profile data:", profileData);
        
        // If profile exists and status is not 'incomplete', redirect to dashboard
        if (profileData && profileData.status && profileData.status !== "incomplete") {
          console.log("Profile complete, redirecting to role dashboard");
          navigate(`/dashboard-${userRole}`);
        } else {
          // If profile doesn't exist or is incomplete, redirect to onboarding
          console.log("Profile incomplete, redirecting to onboarding");
          navigateToOnboarding(userRole);
        }
      }
    } catch (error) {
      console.error("Error in post-login redirect logic:", error);
      navigate("/dashboard"); // Default fallback
    }
  };

  const navigateToOnboarding = (role: string) => {
    console.log("Navigating to onboarding for role:", role);
    switch (role) {
      case "tenant":
        navigate("/onboard-tenant");
        break;
      case "agent":
        navigate("/onboard-agent");
        break;
      case "landlord":
        navigate("/onboard-landlord");
        break;
      default:
        navigate("/dashboard");
        break;
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      console.log("Starting login process");
      
      // Set flag to indicate this is a fresh login
      sessionStorage.setItem('fresh_login', 'true');
      
      await signIn(values.email, values.password);
      
      // Wait a moment for auth state to update
      setTimeout(async () => {
        try {
          // Get the current session to ensure we have the latest user data
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session?.user) {
            const role = session.user.user_metadata?.role;
            console.log("User logged in successfully:", session.user.id, "role:", role);
            
            if (role) {
              await handlePostLoginRedirect(session.user.id, role);
            } else {
              console.log("No role found, redirecting to general dashboard");
              navigate("/dashboard");
            }
          } else {
            console.error("No session found after login");
          }
        } catch (redirectError) {
          console.error("Error during post-login redirect:", redirectError);
          navigate("/dashboard"); // Fallback
        } finally {
          // Clear the fresh login flag after redirect
          sessionStorage.removeItem('fresh_login');
        }
      }, 100);
      
    } catch (error) {
      console.error("Login error:", error);
      sessionStorage.removeItem('fresh_login'); // Clear flag on error
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" autoComplete="email" {...field} />
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
                    autoComplete="current-password"
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
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
