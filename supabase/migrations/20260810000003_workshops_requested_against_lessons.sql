-- ============================================================================
-- Lessons are the curriculum; workshops are requested against them — 2026-08-10
--
-- THE PROBLEM
--
-- lessons.event_id was NOT NULL, so a lesson could not exist unless it
-- belonged to an "event" the dashboard labelled a workshop. The relationship
-- ran workshop → lessons. In practice staff worked around it by creating one
-- event per school visit ("Likoni High School for the VI workshop", "Thika
-- School For the Blind Code Club Workshop"), attaching the schools, and
-- nesting curriculum lessons inside — which is why the same concept appeared
-- as "Workshops" in the sidebar, "Activities" on the page and "Lessons" to
-- schools.
--
-- THE MODEL THIS RESTORES
--
--   • A LESSON is curriculum. It stands alone, authored once by ChipuRobo,
--     and is the paramount entity.
--   • A WORKSHOP is training on a lesson, REQUESTED by a school or teacher and
--     delivered physically or virtually. It hangs off the lesson, not the
--     reverse: requested → scheduled → delivered.
--   • An EVENT stays what it always was — genuine outreach. Bootcamps that
--     were really workshops move out; outreach trips stay.
--
-- NON-DESTRUCTIVE. No event row is deleted and no attendance is moved.
-- Migrated workshops keep a source_event_id pointing back at the row they came
-- from, so event_attendances and event_schools still resolve exactly as before.
-- The admin screen simply stops listing bootcamps as events, because they are
-- now surfaced as workshops.
-- ============================================================================


-- ── 1. Consolidate the RLS helpers ──────────────────────────────────────────
-- 20260810000000 added auth_school_id()/auth_is_admin() believing no helper
-- existed. me_school_id()/me_is_admin() already did, with identical bodies —
-- the earlier search looked for the wrong names. Two names for one concept is
-- how a policy ends up using the one that was not updated, so the MERL
-- policies are repointed at the originals and the duplicates dropped.
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions for select to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions for insert to authenticated
  with check (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions for update to authenticated
  using      (school_id = public.me_school_id() or public.me_is_admin())
  with check (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions for delete to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists session_attendance_select on public.session_attendance;
create policy session_attendance_select on public.session_attendance for select to authenticated
  using (exists (select 1 from public.sessions s
                  where s.id = session_attendance.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())));

drop policy if exists session_attendance_write on public.session_attendance;
create policy session_attendance_write on public.session_attendance for all to authenticated
  using (exists (select 1 from public.sessions s
                  where s.id = session_attendance.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())))
  with check (exists (select 1 from public.sessions s
                  where s.id = session_attendance.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())));

drop policy if exists instruments_admin on public.instruments;
create policy instruments_admin on public.instruments for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());
drop policy if exists instrument_versions_admin on public.instrument_versions;
create policy instrument_versions_admin on public.instrument_versions for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());
drop policy if exists instrument_sections_admin on public.instrument_sections;
create policy instrument_sections_admin on public.instrument_sections for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());
drop policy if exists instrument_questions_admin on public.instrument_questions;
create policy instrument_questions_admin on public.instrument_questions for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());

drop policy if exists instrument_responses_select on public.instrument_responses;
create policy instrument_responses_select on public.instrument_responses for select to authenticated
  using (public.me_is_admin() or (school_id is not null and school_id = public.me_school_id()));
drop policy if exists instrument_responses_insert on public.instrument_responses;
create policy instrument_responses_insert on public.instrument_responses for insert to authenticated
  with check (public.me_is_admin()
              or (school_id is not null and school_id = public.me_school_id())
              or (is_anonymous and school_id is null));
drop policy if exists instrument_responses_update on public.instrument_responses;
create policy instrument_responses_update on public.instrument_responses for update to authenticated
  using      (public.me_is_admin() or (school_id is not null and school_id = public.me_school_id()))
  with check (public.me_is_admin() or (school_id is not null and school_id = public.me_school_id()));
drop policy if exists instrument_responses_delete on public.instrument_responses;
create policy instrument_responses_delete on public.instrument_responses for delete to authenticated
  using (public.me_is_admin() or (school_id is not null and school_id = public.me_school_id()));

drop policy if exists instrument_answers_all on public.instrument_answers;
create policy instrument_answers_all on public.instrument_answers for all to authenticated
  using (exists (select 1 from public.instrument_responses r
                  where r.id = instrument_answers.response_id
                    and (public.me_is_admin() or (r.school_id is not null and r.school_id = public.me_school_id()))))
  with check (exists (select 1 from public.instrument_responses r
                  where r.id = instrument_answers.response_id
                    and (public.me_is_admin() or (r.school_id is not null and r.school_id = public.me_school_id()))));

drop policy if exists programme_actions_select on public.programme_actions;
create policy programme_actions_select on public.programme_actions for select to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());
drop policy if exists programme_actions_write on public.programme_actions;
create policy programme_actions_write on public.programme_actions for all to authenticated
  using      (school_id = public.me_school_id() or public.me_is_admin())
  with check (school_id = public.me_school_id() or public.me_is_admin());

drop function if exists public.auth_school_id();
drop function if exists public.auth_is_admin();


-- ── 2. Lessons become standalone curriculum ─────────────────────────────────
-- event_id is kept, not dropped: the historical rows record which bootcamp a
-- lesson was first taught under, and dropping it would lose that. It is simply
-- no longer required, so a lesson can be authored as pure curriculum.
alter table public.lessons alter column event_id drop not null;

comment on column public.lessons.event_id is
  'Legacy link to the event a lesson was originally created under. Null for '
  'curriculum authored directly. A lesson is NOT owned by an event — schools '
  'request a workshop against a lesson (see public.workshops).';

-- The curriculum is not secret, and a school must be able to browse it in
-- order to request a workshop on a lesson. The old policy only exposed lessons
-- belonging to an event the school was already enrolled in, which under the new
-- model would mean nobody could ever discover a lesson to request.
drop policy if exists "Read lessons" on public.lessons;
create policy "Read lessons" on public.lessons for select to authenticated
  using (is_active or public.me_is_admin());


-- ── 3. Workshops ────────────────────────────────────────────────────────────
do $$ begin
  create type public.workshop_mode as enum ('physical', 'virtual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.workshop_status as enum
    ('requested', 'scheduled', 'delivered', 'declined', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists public.workshops (
  id            uuid primary key default gen_random_uuid(),

  -- Nullable only so historical rows survive: a migrated bootcamp that taught
  -- zero or several lessons has no single lesson to point at. Every NEW
  -- request carries one — enforced in the request path, not here, so the
  -- backfill below does not have to invent links that never existed.
  lesson_id     uuid references public.lessons(id) on delete set null,

  school_id     uuid not null references public.schools(id) on delete cascade,
  -- The requesting teacher. Null for migrated rows (nobody requested those —
  -- ChipuRobo created them) and for requests made on a school's behalf.
  requested_by  uuid references public.profiles(id) on delete set null,

  -- Migrated rows carry the event's own title; new requests take their name
  -- from the lesson.
  title         text,
  mode          public.workshop_mode not null,
  status        public.workshop_status not null default 'requested',

  request_note  text,
  scheduled_for timestamptz,
  facilitator   text,
  delivered_at  timestamptz,
  decline_reason text,

  -- Provenance for rows migrated out of events. Nothing was deleted, so
  -- event_schools and event_attendances still resolve through this.
  source_event_id uuid references public.events(id) on delete set null,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint workshops_delivered_has_timestamp
    check (status <> 'delivered' or delivered_at is not null)
);

create index if not exists workshops_school_status_idx on public.workshops (school_id, status);
create index if not exists workshops_lesson_idx        on public.workshops (lesson_id);
create index if not exists workshops_source_event_idx  on public.workshops (source_event_id);

create or replace function public.workshops_touch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  if new.status = 'delivered' and new.delivered_at is null then
    new.delivered_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists workshops_touch_trg on public.workshops;
create trigger workshops_touch_trg
  before insert or update on public.workshops
  for each row execute function public.workshops_touch();

-- Scheduling and delivery are ChipuRobo's call, not the requester's. RLS can
-- scope rows to a school but cannot easily express "this school may only move
-- the status to cancelled", so that rule lives here where it is unambiguous.
create or replace function public.workshops_guard_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No authenticated user in context means this is not an end-user request:
  -- it is the migration backfill below, a service_role job, or direct database
  -- access, all of which are already trusted. Without this the backfill aborts
  -- on any project that actually has bootcamp events to migrate, because
  -- me_is_admin() is false when auth.uid() is null. anon cannot slip through —
  -- it holds no grant on this table and every policy is `to authenticated`.
  if auth.uid() is null or public.me_is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' and new.status <> 'requested' then
    raise exception 'A workshop can only be created with status = requested';
  end if;
  if tg_op = 'UPDATE' and new.status is distinct from old.status
     and new.status <> 'cancelled' then
    raise exception 'Only ChipuRobo staff can schedule, deliver or decline a workshop';
  end if;
  return new;
end;
$$;

drop trigger if exists workshops_guard_status_trg on public.workshops;
create trigger workshops_guard_status_trg
  before insert or update on public.workshops
  for each row execute function public.workshops_guard_status();

alter table public.workshops enable row level security;

drop policy if exists workshops_select on public.workshops;
create policy workshops_select on public.workshops for select to authenticated
  using (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists workshops_insert on public.workshops;
create policy workshops_insert on public.workshops for insert to authenticated
  with check (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists workshops_update on public.workshops;
create policy workshops_update on public.workshops for update to authenticated
  using      (school_id = public.me_school_id() or public.me_is_admin())
  with check (school_id = public.me_school_id() or public.me_is_admin());

drop policy if exists workshops_delete on public.workshops;
create policy workshops_delete on public.workshops for delete to authenticated
  using (public.me_is_admin());

grant select, insert, update, delete on public.workshops to authenticated, service_role;


-- ── 4. Migrate bootcamp events into workshops ───────────────────────────────
-- One workshop per (event, attached school): a workshop belongs to a single
-- school, whereas an event could have several taking part. Outreach is left
-- alone — it is a genuine event, not training on a lesson.
do $$
declare
  v_migrated integer;
  v_orphans  integer;
begin
  insert into public.workshops (
    lesson_id, school_id, title, mode, status,
    scheduled_for, delivered_at, request_note, source_event_id, created_at
  )
  select
    -- Only when the event taught exactly one lesson. Anything else would be a
    -- guess, and a wrong curriculum link is worse than an absent one.
    case when (select count(*) from public.lessons l where l.event_id = e.id) = 1
         then (select l.id from public.lessons l where l.event_id = e.id)
         else null end,
    es.school_id,
    e.title,
    case e.event_type
      when 'bootcamp_physical' then 'physical'::public.workshop_mode
      else 'virtual'::public.workshop_mode
    end,
    case when es.attended_at is not null then 'delivered'::public.workshop_status
         else 'scheduled'::public.workshop_status end,
    e.start_at,
    es.attended_at,
    e.description,
    e.id,
    e.created_at
  from public.events e
  join public.event_schools es on es.event_id = e.id
  where e.event_type in ('bootcamp_physical', 'bootcamp_webinar')
    and not exists (
      select 1 from public.workshops w
       where w.source_event_id = e.id and w.school_id = es.school_id
    );

  get diagnostics v_migrated = row_count;

  -- A bootcamp with no school attached produces no workshop, because a
  -- workshop needs a requester. Those event rows stay untouched but will no
  -- longer appear on the admin events screen, which now lists outreach only.
  select count(*) into v_orphans
    from public.events e
   where e.event_type in ('bootcamp_physical', 'bootcamp_webinar')
     and not exists (select 1 from public.event_schools es where es.event_id = e.id);

  raise notice 'workshops migrated from bootcamp events: %', v_migrated;
  raise notice 'bootcamp events with no school attached (left as events, now hidden from the events screen): %', v_orphans;
end $$;
