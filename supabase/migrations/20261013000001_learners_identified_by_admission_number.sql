-- ============================================================================
-- Learners are identified by school and admission number, not by name
-- 2026-10-13
--
-- Schools give ChipuRobo admission numbers, not names. A roster row may have
-- no name at all; everywhere a learner is shown, the admission number is the
-- label when there is no name. Nothing else about the learner model changes.
-- ============================================================================

alter table public.club_members alter column full_name drop not null;
alter table public.club_members drop constraint if exists club_members_identity_check;
alter table public.club_members add constraint club_members_identity_check
  check (nullif(btrim(coalesce(full_name, '')), '') is not null or admission_number is not null);
comment on column public.club_members.full_name is
  'Optional. Schools usually give an admission number only; use learner_label() for display.';

-- The one place a learner label is built on the database side.
create or replace function public.learner_label(p_full_name text, p_admission_number text, p_learner_code text)
returns text language sql immutable as $$
  select coalesce(nullif(btrim(coalesce(p_full_name, '')), ''), p_admission_number, p_learner_code, 'Learner');
$$;

-- Teachers and learners read the roster through this; the label falls back to
-- the admission number so no screen ever shows an empty name.
create or replace function public.get_my_learning_students(p_school_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'school_id', s.school_id,
    'full_name', public.learner_label(s.full_name, s.admission_number, s.learner_code),
    'admission_number', s.admission_number,
    'grade', s.grade, 'learner_code', s.learner_code,
    'is_active', s.is_active, 'in_club', s.in_club)
    order by public.learner_label(s.full_name, s.admission_number, s.learner_code)), '[]'::jsonb)
  from public.club_members s where s.school_id = p_school_id
    and (public.can_teach_learning_student(s.id) or public.is_my_learning_student(s.id));
$$;

create or replace function public.admin_list_learning_accounts(p_school_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'role', p.role,
      'full_name', case when p.role = 'learner' then public.learner_label(p.full_name, m.admission_number, m.learner_code) else p.full_name end,
      'login', case when p.role = 'learner' then split_part(u.email, '@', 1) else u.email end,
      'student_id', l.student_id, 'admission_number', m.admission_number
    ) order by p.role, 3), '[]'::jsonb)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.learner_accounts l on l.profile_id = p.id
    left join public.club_members m on m.id = l.student_id
    where p.school_id = p_school_id and p.role in ('teacher', 'learner'));
end;
$$;

-- Bulk creation no longer needs a name. Rows: [{"admission_number": "...", "full_name"?: "...", "grade"?: "...", "password"?: "..."}]
create or replace function public.admin_bulk_create_learners(
  p_school_id uuid, p_rows jsonb, p_default_password text default null
) returns jsonb language plpgsql security definer set search_path = public, auth, extensions as $$
declare
  v_code text; v_row jsonb; v_name text; v_adm text; v_grade text; v_password text;
  v_student uuid; v_login text; v_user uuid;
  v_created int := 0; v_skipped int := 0; v_errors jsonb := '[]'::jsonb; v_logins jsonb := '[]'::jsonb;
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  select code into v_code from public.schools where id = p_school_id;
  if v_code is null then raise exception 'School not found.' using errcode = '22023'; end if;
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then raise exception 'Rows must be a list.' using errcode = '22023'; end if;
  if jsonb_array_length(p_rows) > 500 then raise exception 'Send up to 500 learners per call.' using errcode = '22023'; end if;

  for v_row in select * from jsonb_array_elements(p_rows) loop
    begin
      v_name := nullif(btrim(coalesce(v_row->>'full_name', '')), '');
      v_adm := btrim(coalesce(v_row->>'admission_number', ''));
      v_grade := nullif(btrim(coalesce(v_row->>'grade', '')), '');
      v_password := coalesce(nullif(v_row->>'password', ''), p_default_password);
      if v_adm = '' then raise exception 'Missing admission number' using errcode = '22023'; end if;
      if v_password is null or length(v_password) < 8 then raise exception 'Password must be at least 8 characters' using errcode = '22023'; end if;

      select id into v_student from public.club_members
       where school_id = p_school_id and lower(admission_number) = lower(v_adm);
      if v_student is null then
        insert into public.club_members (school_id, full_name, grade, admission_number, in_club, is_active)
        values (p_school_id, v_name, v_grade, v_adm, true, true) returning id into v_student;
      else
        update public.club_members set full_name = coalesce(v_name, full_name), grade = coalesce(v_grade, grade), is_active = true where id = v_student;
      end if;

      if exists (select 1 from public.learner_accounts where student_id = v_student) then
        v_skipped := v_skipped + 1; continue;
      end if;

      v_login := public.admission_login(v_code, v_adm);
      v_user := public.mint_login(v_login || '@learners.chipurobo.local', v_password, v_name);
      update public.profiles set role = 'learner', school_id = p_school_id, full_name = v_name where id = v_user;
      insert into public.learner_accounts values (v_user, v_student);
      v_created := v_created + 1;
      v_logins := v_logins || jsonb_build_object('admission_number', v_adm, 'login', v_login, 'student_id', v_student);
    exception when others then
      v_errors := v_errors || jsonb_build_object('admission_number', v_adm, 'full_name', v_name, 'message', sqlerrm);
    end;
  end loop;
  return jsonb_build_object('created', v_created, 'skipped', v_skipped, 'errors', v_errors, 'logins', v_logins);
end $$;
