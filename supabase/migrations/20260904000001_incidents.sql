-- ============================================================================
-- Incident reporting — 2026-09-04
--
-- Replaces assessment as the thing a school submits. This is the most
-- sensitive table in the database, and it is built to a specific brief:
--
--   Identify the learner by CODE, never by name.
--   Readable by the super admin only, for now.
--   No anonymous reports — the reporter is always attached.
--   Never scored on the leaderboard.
--
-- WHY learner_code IS TEXT AND NOT A FOREIGN KEY TO club_members.
-- A foreign key would be the ordinary choice, and it is the wrong one here.
-- It would invite exactly one join — club_members.full_name — and that join
-- is the whole thing this design is avoiding. The mapping from LRN-000123 to
-- a child lives with the school that already knows the child, which is where
-- the README says it stays. A code also lets a school report an incident
-- involving someone who is not on the roster.
--
-- WHY THE REPORTER CANNOT READ THEIR OWN REPORT BACK.
-- Select is admin-only. A safeguarding concern may involve a colleague at the
-- reporter's own school, so school-scoped visibility — which is how every
-- other table here works — would be the wrong default. The consequence is
-- real and deliberate: once submitted, a report leaves the school's hands.
-- When roles are worked out, this is the policy to revisit.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'incident_status') then
    create type public.incident_status as enum
      ('reported', 'acknowledged', 'under_review', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'incident_severity') then
    create type public.incident_severity as enum ('low', 'medium', 'high');
  end if;
end $$;

create table if not exists public.incidents (
  id           uuid primary key default gen_random_uuid(),
  school_id    uuid not null references public.schools(id) on delete restrict,

  -- Deliberately not a foreign key. See the header.
  learner_code text
    check (learner_code is null or learner_code ~ '^LRN-[0-9]{6}$'),

  occurred_on  date not null default current_date
    check (occurred_on <= current_date),
  severity     public.incident_severity not null default 'medium',
  description  text not null check (length(btrim(description)) >= 20),

  -- Never null: anonymous reporting is switched off by design.
  reported_by  uuid not null references public.profiles(id) on delete restrict,

  status       public.incident_status not null default 'reported',
  admin_notes  text,
  closed_at    timestamptz,
  closed_by    uuid references public.profiles(id) on delete set null,

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint incidents_closed_consistency
    check ((status = 'closed') = (closed_at is not null))
);

create index if not exists incidents_school_id_idx on public.incidents (school_id);
create index if not exists incidents_status_idx    on public.incidents (status, created_at desc);

comment on table public.incidents is
  'Safeguarding incident reports. The most sensitive table here: select is '
  'restricted to admins, learners are identified by code only, and this table '
  'must never feed the leaderboard.';

comment on column public.incidents.learner_code is
  'Participant code (LRN-nnnnnn), not a foreign key and never a name. The '
  'mapping to a child stays with the school. Null where no single learner is '
  'involved.';

comment on column public.incidents.reported_by is
  'Always set. Anonymous reporting is deliberately not supported.';

-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table public.incidents enable row level security;

-- A school lead files a report for their own school, under their own name.
-- They cannot choose a different school, and they cannot file as someone else.
drop policy if exists incidents_insert on public.incidents;
create policy incidents_insert on public.incidents
  for insert to authenticated
  with check (
    reported_by = auth.uid()
    and (public.me_is_admin() or school_id = public.me_school_id())
    and status = 'reported'
  );

-- Reading is admin-only, including for the person who filed it.
drop policy if exists incidents_select_admin on public.incidents;
create policy incidents_select_admin on public.incidents
  for select to authenticated
  using (public.me_is_admin());

drop policy if exists incidents_update_admin on public.incidents;
create policy incidents_update_admin on public.incidents
  for update to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- No delete policy on purpose: a safeguarding record is not something the
-- application removes. Deletion, if it is ever right, happens deliberately
-- and out of band.

-- Supabase's default privileges hand `anon` SELECT and `authenticated`
-- DELETE/TRUNCATE on every new table in this schema. RLS happens to mask both,
-- but the most sensitive table here should not be relying on a policy to undo
-- a grant it never wanted. Take the grants away first, then give back exactly
-- what is needed.
revoke all on public.incidents from anon, authenticated;
grant select, insert, update on public.incidents to authenticated;

-- ----------------------------------------------------------------------------
-- A school lead needs to know their report was filed without being able to
-- read it back. This returns only that, and only for their own school.
-- ----------------------------------------------------------------------------
create or replace function public.my_school_incident_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from incidents
  where school_id = public.me_school_id();
$$;

revoke execute on function public.my_school_incident_count() from public, anon;
grant  execute on function public.my_school_incident_count() to authenticated;

comment on function public.my_school_incident_count() is
  'How many reports this school has filed. A count and nothing else — the '
  'rows themselves stay admin-only.';

notify pgrst, 'reload schema';
