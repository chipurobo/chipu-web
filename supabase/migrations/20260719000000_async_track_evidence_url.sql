-- ============================================================================
-- Async tracks + completion evidence — 2026-07-19
--
-- Supports blending self-paced external coursework (freeCodeCamp's free
-- open-source tracks) into the existing programme structure.
--
-- ChipuRobo is NOT affiliated with or endorsed by freeCodeCamp.org. Learners
-- hold their own accounts on freecodecamp.org and any certification is issued
-- by them, not by us. Nothing here stores a learner credential or talks to
-- their API — a teacher records the certificate's public verification URL and
-- anyone reviewing later clicks through to the source.
--
--   1. stage_kind gains 'async_track' so self-paced work is distinguishable
--      from an in-person lesson in reporting and in the UI.
--   2. lesson_completions gains evidence_url — a link to whatever proves the
--      completion. Generic on purpose: it serves project submissions and any
--      other evidence-based stage, not only freeCodeCamp.
-- ============================================================================


-- ── 1. New stage kind ───────────────────────────────────────────────────────
--
-- Same pattern as 20260601000025, which added 'outreach'. The value is not
-- referenced elsewhere in this migration, so adding it here is safe.
alter type public.stage_kind add value if not exists 'async_track';


-- ── 2. Evidence URL on a completion ─────────────────────────────────────────
--
-- Why a link and not an uploaded file: a verification URL resolves against
-- the issuer's own domain and therefore proves the certificate exists. A
-- screenshot or PDF proves only that someone had an image, and would add an
-- upload path, a storage bucket and a MIME allowlist for no gain in trust.
alter table public.lesson_completions
  add column if not exists evidence_url text;

comment on column public.lesson_completions.evidence_url is
  'Public URL proving the completion — e.g. a freeCodeCamp certification '
  'verification link (freecodecamp.org/certification/<user>/<cert>). '
  'Recorded by a teacher; students have no accounts. http(s) only.';


-- ── 3. Scheme constraint ────────────────────────────────────────────────────
--
-- This column is rendered as an href in the dashboard, so a `javascript:`
-- value would be a stored XSS payload. The frontend sanitises via
-- lib/safeUrl, but the frontend is not a security boundary — anyone with a
-- school_lead session can write this column directly through PostgREST.
-- Enforce the scheme where it cannot be bypassed.
alter table public.lesson_completions
  drop constraint if exists lesson_completions_evidence_url_http;

alter table public.lesson_completions
  add constraint lesson_completions_evidence_url_http
  check (evidence_url is null or evidence_url ~* '^https?://[^[:space:]]+$');


notify pgrst, 'reload schema';
