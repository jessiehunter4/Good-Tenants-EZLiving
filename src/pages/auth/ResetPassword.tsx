import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/admin/FieldError";
import { BRAND } from "@/config/brand";
import { errorMessage } from "@/hooks/admin/crud";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathFor } from "@/features/access/dashboardPath";
import { useAuth } from "@/contexts/AuthContext";
import {
  isRecoveryUrl,
  newPasswordSchema,
  recoveryError,
  type NewPasswordForm,
} from "@/features/auth/passwordReset";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

const REDIRECT_DELAY_MS = 2000;

/** Carried across from `comingsoonhomrentals-com/src/pages/ResetPassword.tsx`. */
const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, getUserRole } = useAuth();
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  const linkError = recoveryError(location.hash);
  const cameFromLink = isRecoveryUrl(location.hash, location.search);

  const form = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  useDocumentMeta({ title: "Set a new password — Good Tenants EZ Living", noindex: true });

  // Send them where they belong once the password is changed.
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(async () => {
      const role = await getUserRole();
      navigate(dashboardPathFor(role));
    }, REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [done, getUserRole, navigate]);

  const submit = form.handleSubmit(async ({ password }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(errorMessage(error, "Could not change your password"));
      return;
    }
    setDone(true);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-5 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <Link to="/" className="text-center text-2xl font-bold text-espresso">
                {BRAND.name}
              </Link>
            </div>
            <CardTitle className="text-center">
              {done ? "Password changed" : "Set a new password"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {done ? (
              <div className="text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-success" />
                <p className="mt-4 text-sm text-espresso-muted">
                  You are signed in. Taking you to your dashboard…
                </p>
              </div>
            ) : linkError ? (
              <Expired message={linkError} />
            ) : !cameFromLink && !session ? (
              /*
               * No recovery token and no session. Landing here directly cannot
               * change anybody's password, so say so rather than showing a form
               * that will fail on submit.
               */
              <Expired message="Open this page from the link in your reset email." />
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="new-password"
                      type={show ? "text" : "password"}
                      autoFocus
                      autoComplete="new-password"
                      {...form.register("password")}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-espresso-muted"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={form.formState.errors.password?.message} />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Again, to be sure</Label>
                  <Input
                    id="confirm-password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    {...form.register("confirm")}
                    className="mt-1.5"
                  />
                  <FieldError message={form.formState.errors.confirm?.message} />
                </div>

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full bg-espresso text-sand hover:bg-espresso/90"
                >
                  {form.formState.isSubmitting ? "Saving…" : "Change my password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Expired = ({ message }: { message: string }) => (
  <div className="text-center">
    <AlertCircle className="mx-auto h-10 w-10 text-warning" />
    <p className="mt-4 text-sm text-espresso-muted">{message}</p>
    <Button asChild className="mt-6 w-full bg-espresso text-sand hover:bg-espresso/90">
      <Link to="/forgot-password">Send a new link</Link>
    </Button>
  </div>
);

export default ResetPassword;
