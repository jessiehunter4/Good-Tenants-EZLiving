import { z } from "zod";

/**
 * Password recovery.
 *
 * The merged app had none: someone who forgot their password had no route back
 * into their account. The rentals site had the second half — a page to set a
 * new password — but nothing that asked for the email in the first place, so
 * the link that reaches that page could never be sent.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter the email you signed up with").max(320),
});
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

/** Six characters, matching the rule the registration form already applies. */
export const MIN_PASSWORD_LENGTH = 6;

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
      .max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Those two do not match",
    path: ["confirm"],
  });
export type NewPasswordForm = z.infer<typeof newPasswordSchema>;

/**
 * Whether the browser is in a recovery session.
 *
 * Supabase puts the recovery token in the URL fragment and exchanges it for a
 * session before the page sees it. A session alone is not proof of recovery,
 * though — an already signed-in person visiting this page has one too — so the
 * fragment is what distinguishes "arrived from a reset email" from "wandered
 * in", and it is checked before deciding what to show.
 */
export function isRecoveryUrl(hash: string, search: string): boolean {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(fragment);
  if (params.get("type") === "recovery") return true;
  if (params.has("access_token")) return true;
  // Supabase's newer PKCE flow puts a code in the query string instead.
  return new URLSearchParams(search).has("code");
}

/** Recovery links expire; the error comes back in the fragment. */
export function recoveryError(hash: string): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(fragment);
  const code = params.get("error_code");
  const description = params.get("error_description");
  if (!code && !description) return null;
  if (code === "otp_expired" || description?.includes("expired")) {
    return "That link has expired. Ask for a new one below.";
  }
  return description?.replace(/\+/g, " ") ?? "That link is no longer valid.";
}
