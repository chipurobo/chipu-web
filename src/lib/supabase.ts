import { createClient } from '@supabase/supabase-js';

// Vite exposes any env var prefixed VITE_* to the browser. If either is
// missing, fail loudly at boot rather than getting a useless 404 every
// query later.
//
// Supabase recently renamed the browser-facing key from "anon key" (JWT
// like eyJ…) to "publishable key" (sb_publishable_…). Either works with
// supabase-js, so we accept whichever name is set, preferring the newer
// PUBLISHABLE_KEY when both happen to be present.
const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY ' +
      '(legacy: VITE_SUPABASE_ANON_KEY). Copy .env.example to .env.local ' +
      'and fill in values from your Supabase project settings.',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // no OAuth/magic-link callbacks; we use email+password
  },
});
