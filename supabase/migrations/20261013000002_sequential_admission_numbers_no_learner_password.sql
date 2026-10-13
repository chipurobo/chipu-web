-- ============================================================================
-- Four-digit sequential admission numbers; learners sign in without a password
-- 2026-10-13
--
-- Admission numbers are assigned by the system, per school, as 0001, 0002, …
-- A learner signs in by choosing their school and typing that number. The
-- auth.users row still has a password, derived from the login by one fixed
-- rule (learner_password), so sessions, RLS and every learning record stay
-- exactly as they are. The rule is mirrored in src/lib/learnerLogin.ts.
-- ============================================================================

-- ----------------------------------------------------------- derived password
create or replace function public.learner_password(p_login text)
returns text language sql immutable as $$
  select 'chipu-learner-' || lower(btrim(p_login)) || '-2026';
$$;

-- -------------------------------------------------------- next number per school
create or replace function public.next_admission_number(p_school_id uuid)
returns text language plpgsql as $$
declare v_next int;
begin
  perform pg_advisory_xact_lock(hashtext(p_school_id::text));
  select coalesce(max(admission_number::int), 0) + 1 into v_next
    from public.club_members where school_id = p_school_id and admission_number ~ '^[0-9]{4}$';
  if v_next > 9999 then raise exception 'This school has used all 9999 admission numbers.' using errcode = '22023'; end if;
  return lpad(v_next::text, 4, '0');
end $$;

-- ------------------------------------------------- renumber every existing row
-- Each school's learners get 0001… in the order they joined the roster.
alter table public.club_members drop constraint if exists club_members_admission_number_format;
update public.club_members m set admission_number = n.num
  from (select id, lpad(row_number() over (partition by school_id order by created_at, id)::text, 4, '0') as num
          from public.club_members) n
 where n.id = m.id;
alter table public.club_members add constraint club_members_admission_number_format
  check (admission_number is null or admission_number ~ '^[0-9]{4}$');

-- New roster rows get the next number automatically, whichever screen adds them.
create or replace function public.club_members_assign_admission_number()
returns trigger language plpgsql as $$
begin
  if new.admission_number is null or btrim(new.admission_number) = '' then
    new.admission_number := public.next_admission_number(new.school_id);
  else
    new.admission_number := lpad(btrim(new.admission_number), 4, '0');
  end if;
  return new;
end $$;
drop trigger if exists club_members_assign_admission_number on public.club_members;
create trigger club_members_assign_admission_number before insert on public.club_members
  for each row execute function public.club_members_assign_admission_number();

-- ------------------------------------- rebuild every learner login to the new rule
-- Email becomes <code>-<4 digits>@learners.chipurobo.local and the password the
-- derived one, so the learner just picks the school and types the number.
update auth.users u
   set email = public.admission_login(s.code, m.admission_number) || '@learners.chipurobo.local',
       encrypted_password = extensions.crypt(public.learner_password(public.admission_login(s.code, m.admission_number)), extensions.gen_salt('bf')),
       updated_at = now()
  from public.learner_accounts l
  join public.club_members m on m.id = l.student_id
  join public.schools s on s.id = m.school_id
 where u.id = l.profile_id;

-- ------------------------------------------------- one learner login, by roster row
create or replace function public.admin_create_learner_login(p_student_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth, extensions as $$
declare v_code text; v_adm text; v_school uuid; v_name text; v_login text; v_user uuid;
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  select m.school_id, m.admission_number, m.full_name, s.code into v_school, v_adm, v_name, v_code
    from public.club_members m join public.schools s on s.id = m.school_id where m.id = p_student_id and m.is_active;
  if v_school is null then raise exception 'Choose an active learner.' using errcode = '22023'; end if;
  if exists (select 1 from public.learner_accounts where student_id = p_student_id) then
    raise exception 'This learner already has a login.' using errcode = '23505'; end if;
  if v_adm is null then
    v_adm := public.next_admission_number(v_school);
    update public.club_members set admission_number = v_adm where id = p_student_id;
  end if;
  v_login := public.admission_login(v_code, v_adm);
  v_user := public.mint_login(v_login || '@learners.chipurobo.local', public.learner_password(v_login), v_name);
  update public.profiles set role = 'learner', school_id = v_school, full_name = v_name where id = v_user;
  insert into public.learner_accounts values (v_user, p_student_id);
  return jsonb_build_object('user_id', v_user, 'login', v_login, 'admission_number', v_adm, 'role', 'learner');
end $$;
revoke all on function public.admin_create_learner_login(uuid) from public, anon;
grant execute on function public.admin_create_learner_login(uuid) to authenticated;

-- ---------------------------------------------------------- bulk, no password
-- Rows: [{"admission_number"?: "0001", "full_name"?: "...", "grade"?: "..."}]. A row
-- without a number gets the next one. The password argument is accepted for
-- compatibility and ignored: learners have no password of their own.
create or replace function public.admin_bulk_create_learners(
  p_school_id uuid, p_rows jsonb, p_default_password text default null
) returns jsonb language plpgsql security definer set search_path = public, auth, extensions as $$
declare
  v_code text; v_row jsonb; v_name text; v_adm text; v_grade text;
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
      v_adm := nullif(btrim(coalesce(v_row->>'admission_number', '')), '');
      v_grade := nullif(btrim(coalesce(v_row->>'grade', '')), '');
      if v_adm is not null then
        if v_adm !~ '^[0-9]{1,4}$' then raise exception 'Admission number must be up to 4 digits' using errcode = '22023'; end if;
        v_adm := lpad(v_adm, 4, '0');
      end if;

      v_student := null;
      if v_adm is not null then
        select id into v_student from public.club_members where school_id = p_school_id and admission_number = v_adm;
      end if;
      if v_student is null then
        insert into public.club_members (school_id, full_name, grade, admission_number, in_club, is_active)
        values (p_school_id, v_name, v_grade, v_adm, true, true) returning id, admission_number into v_student, v_adm;
      else
        update public.club_members set full_name = coalesce(v_name, full_name), grade = coalesce(v_grade, grade), is_active = true where id = v_student;
      end if;

      if exists (select 1 from public.learner_accounts where student_id = v_student) then
        v_skipped := v_skipped + 1; continue;
      end if;

      v_login := public.admission_login(v_code, v_adm);
      v_user := public.mint_login(v_login || '@learners.chipurobo.local', public.learner_password(v_login), v_name);
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
