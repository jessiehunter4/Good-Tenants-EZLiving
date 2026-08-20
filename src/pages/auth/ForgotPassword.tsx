import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FieldError from "@/components/admin/FieldError";
import { BRAND } from "@/config/brand";
import { supabase } from "@/integrations/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/features/auth/passwordReset";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Asking for a reset link.
 *
 * The merged app had no way to do this at all — someone who forgot their
 * password was simply locked out. The rentals site had the page that follows
 * this one, but nothing that could send them to it.
 */
const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useDocumentMeta({ title: "Reset your password — Good Tenants EZ Living", noindex: true });

  const submit = form.handleSubmit(async ({ email }) => {
    setSending(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    /*
     * Shown whether or not that address has an account. Telling the difference
     * would turn this form into a way to discover who has one, which is exactly
     * what a password reset form must not be.
     */
    setSent(true);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-5 py-12">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" className="mb-4 text-espresso hover:bg-clay/40">
          <Link to="/auth">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to sign in
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <Link to="/" className="text-center text-2xl font-bold text-espresso">
                {BRAND.name}
              </Link>
            </div>
            <CardTitle className="text-center">
              {sent ? "Check your email" : "Reset your password"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="text-center">
                <MailCheck className="mx-auto h-10 w-10 text-success" />
                <p className="mt-4 text-sm text-espresso-muted">
                  If there is an account for that address, a link to set a new password is on its
                  way. It expires in an hour.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 w-full border-clay text-espresso"
                  onClick={() => setSent(false)}
                >
                  Use a different address
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoFocus
                    autoComplete="email"
                    {...form.register("email")}
                    className="mt-1.5"
                  />
                  <FieldError message={form.formState.errors.email?.message} />
                </div>

                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-espresso text-sand hover:bg-espresso/90"
                >
                  {sending ? "Sending…" : "Send me a link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
