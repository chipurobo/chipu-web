import { createClient } from '@supabase/supabase-js';

// Vite exposes any env var prefixed VITE_* to the browser. If either is
// missing, fail loudly at boot rather than getting a useless 404 every
// query later.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env.local and fill in values from `supabase status`.',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // no OAuth/magic-link callbacks; we use email+password
  },
});
