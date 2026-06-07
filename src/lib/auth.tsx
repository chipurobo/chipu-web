import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, School } from './database.types';

// =============================================================
// Auth context
//
// Tracks:
//   • the Supabase auth user / session
//   • the matching `profiles` row (role + school_id)
//   • the matching `schools` row (or null for admins)
//
// All three are loaded on session change; consumers can guard on
// `loading`, `user`, and `profile?.role` / `school?.is_maker_space`.
// =============================================================

interface AuthState {
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  school: School | null;
  /** Re-fetch profile + school (call after register-club RPC, etc.). */
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

async function loadProfileAndSchool(userId: string) {
  // Profile is created by the on_auth_user_created trigger, so it always
  // exists for any authenticated user.
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (pErr) {
    console.error('profile fetch error:', pErr);
    return { profile: null, school: null };
  }
  if (!profile) return { profile: null, school: null };

  if (!profile.school_id) {
    // Either admin (no school) or a freshly-signed-up user who hasn't
    // run register-school-with-club yet.
    return { profile: profile as Profile, school: null };
  }
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', profile.school_id)
    .maybeSingle();
  return { profile: profile as Profile, school: (school as School) ?? null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    loading: boolean;
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    school: School | null;
  }>({
    loading: true,
    user: null,
    session: null,
    profile: null,
    school: null,
  });

  // Hydrate from the current session on mount, then listen for changes.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!alive) return;
      if (!session) {
        setState({ loading: false, user: null, session: null, profile: null, school: null });
        return;
      }
      const { profile, school } = await loadProfileAndSchool(session.user.id);
      if (!alive) return;
      setState({ loading: false, user: session.user, session, profile, school });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setState({ loading: false, user: null, session: null, profile: null, school: null });
        return;
      }
      const { profile, school } = await loadProfileAndSchool(session.user.id);
      setState({ loading: false, user: session.user, session, profile, school });
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    if (!state.user) return;
    const { profile, school } = await loadProfileAndSchool(state.user.id);
    setState((s) => ({ ...s, profile, school }));
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthCtx.Provider value={{ ...state, refresh, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
