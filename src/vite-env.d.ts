/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Platform Supabase project URL, e.g. https://<ref>.supabase.co */
  readonly VITE_SUPABASE_URL: string;
  /** New-format publishable key. Compiled into the bundle by design. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  /** "1" enables the local sign-in bypass. Dev server only — see lib/devBypass.ts. */
  readonly VITE_DEV_BYPASS_AUTH?: string;
  /** Role to impersonate under the bypass: tenant | agent | landlord | admin. */
  readonly VITE_DEV_BYPASS_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
