-- ============================================================================
-- Certifications
--
-- ChipuRobo admin issues certificates to students and teachers from a
-- curated template catalogue. No public verification — the data is
-- treated as sensitive and visibility is limited to:
--   • admin (everything)
--   • the school lead whose school the recipient belongs to
--   • the teacher recipient themselves (for teacher certificates)
--
-- Two tables: templates (curated catalogue) and issuances (per-person
-- awards). Each issuance points at exactly ONE of student_id / teacher_id
-- via a CHECK constraint.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum
-- ----------------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'cert_audience') then
    create type public.cert_audience as enum ('student', 'teacher');
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 1. certificate_templates  (catalogue, admin-curated)
-- ----------------------------------------------------------------------------
create table if not exists public.certificate_templates (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  programme      text,                                   -- e.g. "Inclusive Robotics"
  audience       public.cert_audience not null,          -- 'student' or 'teacher'
  duration_text  text,                                   -- e.g. "8 weeks", "1 day workshop"
  criteria_text  text,                                   -- what it takes to earn it
  hero_color     text default '#0d9488',                 -- accent for the printed cert
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);
create index if not exists certificate_templates_audience_idx
  on public.certificate_templates (audience, is_active);

-- ----------------------------------------------------------------------------
-- 2. certificate_issuances  (per-recipient awards)
-- ----------------------------------------------------------------------------
create table if not exists public.certificate_issuances (
  id           uuid primary key default gen_random_uuid(),
  template_id  uuid not null references public.certificate_templates(id) on delete restrict,
  student_id   uuid references public.club_members(id) on delete cascade,
  teacher_id   uuid references public.profiles(id)     on delete cascade,
  school_id    uuid not null references public.schools(id) on delete cascade,
  notes        text,
  issued_at    timestamptz not null default now(),
  issued_by    uuid references auth.users(id) on delete set null,
  revoked_at   timestamptz,
  constraint   certificate_issuances_one_recipient_check
    check ((student_id is not null) <> (teacher_id is not null))
);
create index if not exists certificate_issuances_student_idx on public.certificate_issuances (student_id);
create index if not exists certificate_issuances_teacher_idx on public.certificate_issuances (teacher_id);
create index if not exists certificate_issuances_school_idx  on public.certificate_issuances (school_id);

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.certificate_templates  enable row level security;
alter table public.certificate_issuances  enable row level security;

-- Templates: readable by every authenticated user (school leads need this to
-- show the title beside each issued certificate). Only admin can write.
drop policy if exists certificate_templates_read on public.certificate_templates;
create policy certificate_templates_read on public.certificate_templates
  for select to authenticated using (true);

drop policy if exists certificate_templates_admin_all on public.certificate_templates;
create policy certificate_templates_admin_all on public.certificate_templates
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- Issuances: admin all; school lead sees rows for their school; teacher
-- recipients see their own teacher rows.
drop policy if exists certificate_issuances_select on public.certificate_issuances;
create policy certificate_issuances_select on public.certificate_issuances
  for select to authenticated using (
    public.me_is_admin()
    or school_id  = public.me_school_id()
    or teacher_id = auth.uid()
  );

drop policy if exists certificate_issuances_admin_all on public.certificate_issuances;
create policy certificate_issuances_admin_all on public.certificate_issuances
  for all to authenticated
  using (public.me_is_admin())
  with check (public.me_is_admin());

-- ============================================================================
-- Helper RPCs (admin-only)
-- ============================================================================

-- Bulk issue one template to many students at one school in one transaction.
create or replace function public.admin_bulk_issue_student_certificate(
  p_template_id uuid,
  p_school_id   uuid,
  p_student_ids uuid[],
  p_notes       text default null
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if not public.me_is_admin() then
    raise exception 'permission denied: admin only' using errcode = '42501';
  end if;

  with rows as (
    insert into public.certificate_issuances (
      template_id, student_id, school_id, notes, issued_by
    )
    select p_template_id, sid, p_school_id, p_notes, auth.uid()
      from unnest(p_student_ids) as sid
     where exists (
       select 1 from public.club_members cm
        where cm.id = sid and cm.school_id = p_school_id
     )
    returning 1
  )
  select count(*)::integer into v_inserted from rows;

  return v_inserted;
end;
$$;
grant execute on function public.admin_bulk_issue_student_certificate(uuid, uuid, uuid[], text) to authenticated;
