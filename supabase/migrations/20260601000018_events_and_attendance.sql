-- ============================================================================
-- Events + attendance
--
-- Three tables and two RPCs:
--
--   events             — outreach / bootcamps (physical or webinar). Admin
--                        is the only writer.
--   event_schools      — many-to-many join. attended_at tracks when a
--                        school actually showed up (null = just invited).
--   event_attendances  — per-student row created when a school is marked
--                        attended. RLS lets school leads see their school's
--                        rows; admin sees all.
--
--   attach_school_to_event(event, school)
--     Admin-only; idempotent. Just adds the school to the event roster.
--
--   mark_school_attended(event, school)
--     Admin-only; idempotent. Sets event_schools.attended_at=now() and
--     bulk-inserts event_attendances rows for every active student at
--     the school (ON CONFLICT DO NOTHING so re-marking is safe).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type public.event_type as enum ('outreach', 'bootcamp_physical', 'bootcamp_webinar');
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 1. events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  event_type  public.event_type not null,
  start_at    timestamptz not null,
  end_at      timestamptz,
  location    text,                       -- physical-event venue
  url         text,                       -- webinar link
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists events_start_at_idx on public.events (start_at desc);

-- ----------------------------------------------------------------------------
-- 2. event_schools (m-n)
-- ----------------------------------------------------------------------------
create table if not exists public.event_schools (
  event_id    uuid not null references public.events(id)  on delete cascade,
  school_id   uuid not null references public.schools(id) on delete cascade,
  attended_at timestamptz,                -- null = invited; non-null = confirmed attended
  created_at  timestamptz not null default now(),
  primary key (event_id, school_id)
);
create index if not exists event_schools_school_idx on public.event_schools (school_id);

-- ----------------------------------------------------------------------------
-- 3. event_attendances (per-student)
-- ----------------------------------------------------------------------------
create table if not exists public.event_attendances (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id)         on delete cascade,
  school_id    uuid not null references public.schools(id)        on delete cascade,
  student_id   uuid not null references public.club_members(id)   on delete cascade,
  attended_at  timestamptz not null default now(),
  unique (event_id, student_id)
);
create index if not exists event_attendances_event_school_idx on public.event_attendances (event_id, school_id);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.events             enable row level security;
alter table public.event_schools      enable row level security;
alter table public.event_attendances  enable row level security;

-- events — everyone reads (so the school lead can see their own attendance
-- context); only admin writes.
drop policy if exists events_read_all on public.events;
create policy events_read_all on public.events
  for select to authenticated using (true);

drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- event_schools — admin all; school_lead sees rows for their school.
drop policy if exists event_schools_select on public.event_schools;
create policy event_schools_select on public.event_schools
  for select to authenticated using (
    public.me_is_admin() or school_id = public.me_school_id()
  );

drop policy if exists event_schools_admin_all on public.event_schools;
create policy event_schools_admin_all on public.event_schools
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- event_attendances — admin all; school_lead sees their school's.
drop policy if exists event_attendances_select on public.event_attendances;
create policy event_attendances_select on public.event_attendances
  for select to authenticated using (
    public.me_is_admin() or school_id = public.me_school_id()
  );

drop policy if exists event_attendances_admin_all on public.event_attendances;
create policy event_attendances_admin_all on public.event_attendances
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- RPCs
-- ============================================================================
create or replace function public.attach_school_to_event(
  p_event_id  uuid,
  p_school_id uuid
) returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  insert into public.event_schools (event_id, school_id)
  values (p_event_id, p_school_id)
  on conflict (event_id, school_id) do nothing;
end;
$$;
grant execute on function public.attach_school_to_event(uuid, uuid) to authenticated;


create or replace function public.mark_school_attended(
  p_event_id  uuid,
  p_school_id uuid
) returns integer
language plpgsql security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  -- Make sure the school is in the roster, and flip attended_at to now.
  insert into public.event_schools (event_id, school_id, attended_at)
  values (p_event_id, p_school_id, now())
  on conflict (event_id, school_id) do update set attended_at = excluded.attended_at;

  -- Bulk-insert attendance rows for every active student at the school.
  with inserted as (
    insert into public.event_attendances (event_id, school_id, student_id)
    select p_event_id, p_school_id, cm.id
      from public.club_members cm
     where cm.school_id = p_school_id and cm.is_active = true
    on conflict (event_id, student_id) do nothing
    returning 1
  )
  select count(*)::integer into v_inserted from inserted;

  return v_inserted;
end;
$$;
grant execute on function public.mark_school_attended(uuid, uuid) to authenticated;


create or replace function public.unmark_school_attended(
  p_event_id  uuid,
  p_school_id uuid
) returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  -- Clear the attended_at on the join row; remove the per-student records.
  update public.event_schools
     set attended_at = null
   where event_id = p_event_id and school_id = p_school_id;

  delete from public.event_attendances
   where event_id = p_event_id and school_id = p_school_id;
end;
$$;
grant execute on function public.unmark_school_attended(uuid, uuid) to authenticated;
