import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
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
// Plus session-hardening behaviour:
//   • Multi-tab sync — Supabase's persistSession backs the JWT into
//     localStorage and the supabase-js client already wires a storage
//     listener that fires `onAuthStateChange('SIGNED_OUT', …)` across
//     tabs. We additionally clear the TanStack Query cache on sign-out
//     so a second user logging in on the same browser never briefly
//     sees the previous user's cached rows.
//   • Token-refresh failure — when Supabase fires `TOKEN_REFRESHED` we
//     just continue; when it fires `SIGNED_OUT` after an attempted
//     refresh, that means the refresh failed (token revoked / expired
//     past the refresh window). The provider surfaces this as a
//     `sessionExpired` flag so UI can show a "Please sign in again"
//     banner before the redirect.
//   • Idle timeout — opt-in. If `VITE_IDLE_TIMEOUT_MINUTES` is set (or
//     localStorage `chipurobo:idle-timeout-min` is set), start an
//     inactivity timer. After N minutes of no input we sign out and
//     redirect. Default off — most users stay signed in.
// =============================================================

const IDLE_TIMEOUT_LS_KEY = 'chipurobo:idle-timeout-min';

function readIdleTimeoutMinutes(): number {
  // Env var wins for deployments that want everyone idle-timed out.
  const fromEnv = import.meta.env.VITE_IDLE_TIMEOUT_MINUTES;
  if (fromEnv && Number(fromEnv) > 0) return Number(fromEnv);
  // Otherwise: a per-browser opt-in (e.g. shared classroom tablet) via
  // localStorage. Admins can flip this on for at-risk users from the
  // settings UI we ship later.
  try {
    const v = localStorage.getItem(IDLE_TIMEOUT_LS_KEY);
    const n = v ? Number(v) : 0;
    return n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

interface AuthState {
  loading: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  school: School | null;
  /** Set when a session refresh fails (token revoked or stale). Consumers
   *  can show a one-off "Session expired" toast and redirect to /login. */
  sessionExpired: boolean;
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
  const qc = useQueryClient();
  const [state, setState] = useState<{
    loading: boolean;
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    school: School | null;
    sessionExpired: boolean;
  }>({
    loading: true,
    user: null,
    session: null,
    profile: null,
    school: null,
    sessionExpired: false,
  });

  // Keep a ref of the last known authenticated user-id so we can detect
  // an authenticated → unauthenticated transition (= refresh failure or
  // explicit sign-out). Differentiating those needs `_event`.
  const lastUserIdRef = useRef<string | null>(null);

  // Hydrate from the current session on mount, then listen for changes.
  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!alive) return;
      if (!session) {
        setState({
          loading: false, user: null, session: null,
          profile: null, school: null, sessionExpired: false,
        });
        return;
      }
      lastUserIdRef.current = session.user.id;
      const { profile, school } = await loadProfileAndSchool(session.user.id);
      if (!alive) return;
      setState({
        loading: false, user: session.user, session,
        profile, school, sessionExpired: false,
      });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Track auth lifecycle so we can react meaningfully:
      //   SIGNED_IN          — user just signed in (this tab or another)
      //   SIGNED_OUT         — explicit sign-out OR refresh failure
      //   TOKEN_REFRESHED    — silent refresh succeeded
      //   USER_UPDATED       — profile metadata changed
      //
      // We treat SIGNED_OUT as "session expired" only if we previously
      // had an authenticated user (otherwise it's just initial state).
      if (event === 'SIGNED_OUT' || !session) {
        const wasSignedIn = lastUserIdRef.current !== null;
        lastUserIdRef.current = null;
        // Wipe cached data so the next user on this device doesn't see
        // the previous user's rows in the brief moment before re-fetch.
        qc.clear();
        setState({
          loading: false, user: null, session: null,
          profile: null, school: null,
          // Only set sessionExpired if this was an *unsolicited* sign-out
          // (the auth lib couldn't refresh). Explicit signOut() callers
          // expect a clean state, so we re-clear the flag in signOut().
          sessionExpired: wasSignedIn,
        });
        return;
      }

      // SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED
      const prevUserId = lastUserIdRef.current;
      lastUserIdRef.current = session.user.id;
      // If the user-id changed (different user logged in on this tab,
      // or first sign-in after a SIGNED_OUT), wipe the cache.
      if (prevUserId && prevUserId !== session.user.id) {
        qc.clear();
      }
      const { profile, school } = await loadProfileAndSchool(session.user.id);
      setState({
        loading: false, user: session.user, session,
        profile, school, sessionExpired: false,
      });
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [qc]);

  // === Idle timeout (opt-in) ===
  // When the env var or localStorage flag sets a positive minute count,
  // start a timer that resets on any user input. When the timer fires we
  // sign the user out — the storage event broadcasts to other tabs.
  useEffect(() => {
    if (!state.user) return;
    const minutes = readIdleTimeoutMinutes();
    if (minutes <= 0) return;

    const ms = minutes * 60_000;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        // Fire-and-forget. The auth state change handler above wipes
        // cache and sets sessionExpired automatically.
        void supabase.auth.signOut();
      }, ms);
    };

    const events: (keyof DocumentEventMap)[] = [
      'mousemove', 'keydown', 'touchstart', 'scroll', 'click',
    ];
    events.forEach((e) => document.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
  }, [state.user]);

  const refresh = useCallback(async () => {
    if (!state.user) return;
    const { profile, school } = await loadProfileAndSchool(state.user.id);
    setState((s) => ({ ...s, profile, school }));
  }, [state.user]);

  const signIn = useCallback(async (email: string, password: string) => {
    // Wipe any sessionExpired flag from a previous failed session so the
    // user doesn't see the toast after a fresh login.
    setState((s) => ({ ...s, sessionExpired: false }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    // Reset expired flag — explicit sign-out is not "expired".
    setState((s) => ({ ...s, sessionExpired: false }));
    await supabase.auth.signOut();
    qc.clear();
  }, [qc]);

  return (
    <AuthCtx.Provider value={{ ...state, refresh, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- provider + hook intentionally live together; fast refresh falls back to full reload for this file only
export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
