-- ============================================================================
-- MERL phase 3 — action tracker, visit checklist, webinar feedback — 2026-08-10
--
-- The same action/owner/due-date/status tracker appears three times in the
-- toolkit: 09_Weekly_Monitoring §D, 07_School_Baseline §D and
-- 12_School_Visit_Checklist §D. On paper each is a stranded list. Modelled once
-- and referenced from all three, it becomes the thing none of the paper tools
-- can produce — a single view of everything open across a school, which is
-- what the MERL Plan's weekly "action tracker and escalation where required"
-- actually asks for.
--
-- The visit checklist is seeded as an instrument rather than given its own
-- table: it is a questionnaire like the others, and its visit metadata
-- (purpose, visitor, focal person) is just section A. Actions hang off the
-- response.
-- ============================================================================


-- ── 1. Programme actions ────────────────────────────────────────────────────
do $$ begin
  create type public.action_status as enum ('open', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.action_source as enum (
    'weekly_session', 'school_baseline', 'school_visit', 'other'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.programme_actions (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references public.schools(id) on delete cascade,
  source      public.action_source not null default 'other',

  -- Nullable links rather than a polymorphic (type, id) pair, so the database
  -- still enforces referential integrity on whichever origin applies.
  session_id  uuid references public.sessions(id) on delete cascade,
  response_id uuid references public.instrument_responses(id) on delete cascade,

  description text not null,
  -- The owner is often a school staff member with no platform account, so a
  -- free-text owner is supported alongside the profile link.
  owner_profile_id uuid references public.profiles(id) on delete set null,
  owner_name  text,
  due_date    date,
  status      public.action_status not null default 'open',
  closed_at   timestamptz,
  closed_note text,

  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint programme_actions_closed_has_timestamp
    check (status = 'open' or closed_at is not null)
);

create index if not exists programme_actions_school_status_idx
  on public.programme_actions (school_id, status, due_date);
create index if not exists programme_actions_session_idx  on public.programme_actions (session_id);
create index if not exists programme_actions_response_idx on public.programme_actions (response_id);

-- Keep closed_at honest without making every caller remember it.
create or replace function public.programme_actions_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'closed' and new.closed_at is null then
    new.closed_at := now();
  elsif new.status = 'open' then
    new.closed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists programme_actions_touch_trg on public.programme_actions;
create trigger programme_actions_touch_trg
  before insert or update on public.programme_actions
  for each row execute function public.programme_actions_touch();

alter table public.programme_actions enable row level security;

drop policy if exists programme_actions_select on public.programme_actions;
create policy programme_actions_select on public.programme_actions for select to authenticated
  using (school_id = public.auth_school_id() or public.auth_is_admin());

drop policy if exists programme_actions_write on public.programme_actions;
create policy programme_actions_write on public.programme_actions for all to authenticated
  using      (school_id = public.auth_school_id() or public.auth_is_admin())
  with check (school_id = public.auth_school_id() or public.auth_is_admin());

grant select, insert, update, delete on public.programme_actions to authenticated, service_role;


-- ── 2. Anonymous responses ──────────────────────────────────────────────────
-- 11_Webinar_Feedback: "Responses may be anonymous unless follow-up contact is
-- necessary and agreed." A truly anonymous response has no school_id, which the
-- phase 2 insert policy rejected — so anonymity was impossible to offer. This
-- permits the insert while leaving the SELECT policy untouched: the submitter
-- cannot read it back, which is what makes the anonymity real rather than
-- nominal. Only admins can analyse these.
drop policy if exists instrument_responses_insert on public.instrument_responses;
create policy instrument_responses_insert on public.instrument_responses for insert to authenticated
  with check (
    public.auth_is_admin()
    or (school_id is not null and school_id = public.auth_school_id())
    or (is_anonymous and school_id is null)
  );


-- ── 3. Webinar feedback (11_Webinar_Feedback_Form) ──────────────────────────
do $$
declare v_version uuid; s uuid;
  k_agree jsonb := '[
    {"value":"strongly_disagree","label":"Strongly disagree","score":1},
    {"value":"disagree","label":"Disagree","score":2},
    {"value":"neutral","label":"Neutral","score":3},
    {"value":"agree","label":"Agree","score":4},
    {"value":"strongly_agree","label":"Strongly agree","score":5},
    {"value":"na","label":"Not applicable","score":null}
  ]'::jsonb;
begin
  v_version := public._merl_seed_instrument(
    'webinar-feedback', 'Webinar Feedback Form', 'participant',
    'Inclusive Code Clubs and Robotics Programme',
    'Seeded from 11_Webinar_Feedback_Form.docx. May be submitted anonymously.');

  s := public._merl_seed_section(v_version, 1, 'A', 'Webinar Details');
  perform public._merl_seed_question(s, 1, 'A1', 'Webinar title', 'short_text', null, true);
  perform public._merl_seed_question(s, 2, 'A2', 'Date', 'date');
  perform public._merl_seed_question(s, 3, 'A3', 'Facilitator(s)', 'short_text');
  perform public._merl_seed_question(s, 4, 'A4', 'Participant role', 'single_select',
    '[{"value":"teacher","label":"Teacher"},{"value":"school_leader","label":"School leader"},
      {"value":"learner","label":"Learner (if appropriate)"},{"value":"partner","label":"Partner"},
      {"value":"other","label":"Other"}]'::jsonb);

  s := public._merl_seed_section(v_version, 2, 'B', 'Your Experience');
  perform public._merl_seed_question(s, 1, 'B1', 'The webinar topic was relevant to my needs.', 'scale', k_agree, true);
  perform public._merl_seed_question(s, 2, 'B2', 'The session was understandable and accessible.', 'scale', k_agree, true);
  perform public._merl_seed_question(s, 3, 'B3', 'I can identify at least one idea I can use.', 'scale', k_agree, true);
  perform public._merl_seed_question(s, 4, 'B4', 'I had an opportunity to ask questions or participate.', 'scale', k_agree, true);

  s := public._merl_seed_section(v_version, 3, 'C', 'Feedback');
  perform public._merl_seed_question(s, 1, 'C1', 'What was most useful?', 'long_text');
  perform public._merl_seed_question(s, 2, 'C2', 'What could be improved?', 'long_text');
  perform public._merl_seed_question(s, 3, 'C3', 'What topic or support would you like next?', 'long_text');
  perform public._merl_seed_question(s, 4, 'C4', 'Did you experience any access barrier? If yes, what would help next time?', 'long_text');

  s := public._merl_seed_section(v_version, 4, 'D', 'Follow-Up (optional)', false,
       'Only collect contact details where follow-up is agreed. Leaving these blank keeps the response anonymous.');
  perform public._merl_seed_question(s, 1, 'D1', 'Email / contact if you would like a response', 'short_text');
  perform public._merl_seed_question(s, 2, 'D2', 'Permission to contact you', 'boolean');
end $$;


-- ── 4. School visit checklist (12_School_Visit_Checklist) ───────────────────
do $$
declare v_version uuid; s uuid; i integer;
  k_ypn jsonb := '[
    {"value":"yes","label":"Yes","score":2},
    {"value":"partly","label":"Partly","score":1},
    {"value":"no","label":"No","score":0},
    {"value":"na","label":"Not applicable","score":null}
  ]'::jsonb;
  areas text[] := array[
    'Club schedule and space are clear and workable.',
    'Teacher/facilitator support needs were discussed.',
    'Learner participation and access considerations were reviewed.',
    'Materials and storage arrangements were checked.',
    'Attendance and weekly monitoring records were reviewed.',
    'Agreed safeguarding, consent and data processes were confirmed.',
    'Where relevant, innovation pathway / event readiness was discussed.'
  ];
begin
  v_version := public._merl_seed_instrument(
    'school-visit-checklist', 'School Visit Checklist', 'school',
    'Support, quality and inclusion review',
    'Seeded from 12_School_Visit_Checklist.docx. Not a safeguarding incident form or a punitive inspection tool.');

  s := public._merl_seed_section(v_version, 1, 'A', 'Visit Details');
  perform public._merl_seed_question(s, 1, 'A1', 'Visitor(s)', 'short_text', null, true);
  perform public._merl_seed_question(s, 2, 'A2', 'School focal person', 'short_text');
  perform public._merl_seed_question(s, 3, 'A3', 'Purpose of visit', 'single_select',
    '[{"value":"start_up","label":"Start-up"},{"value":"routine","label":"Routine support"},
      {"value":"follow_up","label":"Follow-up"},{"value":"observation","label":"Observation"},
      {"value":"other","label":"Other"}]'::jsonb, true);

  s := public._merl_seed_section(v_version, 2, 'B', 'Checklist', false,
       'Follow-up on any area is recorded as a programme action so it can be tracked to closure.');
  for i in 1 .. array_length(areas, 1) loop
    perform public._merl_seed_question(s, (i * 2) - 1, 'B' || i || 'a', areas[i], 'scale', k_ypn);
    perform public._merl_seed_question(s, i * 2, 'B' || i || 'b', areas[i] || ' — check / evidence', 'long_text');
  end loop;

  s := public._merl_seed_section(v_version, 3, 'C', 'Observation and Feedback');
  perform public._merl_seed_question(s, 1, 'C1', 'What is working well?', 'long_text');
  perform public._merl_seed_question(s, 2, 'C2', 'What barriers or risks need attention?', 'long_text');
  perform public._merl_seed_question(s, 3, 'C3', 'What learner voice or teacher feedback was shared?', 'long_text');
  perform public._merl_seed_question(s, 4, 'C4', 'What agreed adaptation would strengthen inclusion or delivery?', 'long_text');

  s := public._merl_seed_section(v_version, 4, 'E', 'Confirmation', true);
  perform public._merl_seed_question(s, 1, 'E1', 'Confirmed with school representative', 'boolean');
end $$;


-- ── 5. Retire the seed helpers ──────────────────────────────────────────────
-- They exist only to keep the seed blocks readable. Leaving them behind would
-- put three unsecured, un-RLS'd writers to the instrument tables in the public
-- schema, reachable by anyone holding an authenticated JWT.
drop function if exists public._merl_seed_question(uuid, integer, text, text, public.question_type, jsonb, boolean, text);
drop function if exists public._merl_seed_section(uuid, integer, text, text, boolean, text);
drop function if exists public._merl_seed_instrument(text, text, public.instrument_subject, text, text);
