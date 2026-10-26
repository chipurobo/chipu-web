-- New learners start on the CBC classroom course. Only learners a school
-- marks as coding-club members (club_members.in_club) get the Beginner,
-- Intermediate and Expert course. Existing learners keep their current flag.

alter table public.club_members alter column in_club set default false;

-- Bulk-created learners follow the same rule; a row can still say
-- "in_club": "yes" to put that learner in the coding club.
CREATE OR REPLACE FUNCTION public.admin_bulk_create_learners(p_school_id uuid, p_rows jsonb, p_default_password text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
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
        values (p_school_id, v_name, v_grade, v_adm,
                coalesce(lower(v_row->>'in_club') in ('true', 'yes', 'y', '1'), false), true) returning id, admission_number into v_student, v_adm;
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
end $function$;
