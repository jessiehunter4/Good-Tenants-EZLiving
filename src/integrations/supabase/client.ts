// Supabase browser client.
//
// This file was originally generated with the project URL and key inlined as
// string literals. It is now hand-maintained: the merged platform has its own
// project, and hardcoding a second one would put the wrong database in the
// bundle the moment either changes. Configuration comes from the environment.
//
// Only the publishable key belongs here. It is compiled into the browser bundle
// by design, and it is safe there *because* every table in the platform database
// carries row-level security and explicit grants — not because the key is
// special. The secret key must never be read from this file.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { isDevAuthBypass } from '@/lib/devBypass';
import { createDevSupabaseStub } from '@/lib/devSupabaseStub';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

function createSupabaseClient() {
  // Under the development bypass, answer locally instead of over the network,
  // so the dashboards and onboarding flows stay reviewable without a database.
  // See lib/devSupabaseStub.ts. Never active in a production build.
  if (isDevAuthBypass()) {
    return createDevSupabaseStub();
  }

  // Fail loudly. A client built against undefined credentials produces requests
  // to "undefined/rest/v1/..." and a wall of network errors that look like an
  // outage rather than a missing variable.
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY in .env.local — see .env.example.',
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export const supabase = createSupabaseClient();
