-- ============================================================================
-- School codes, admission numbers and bulk learner logins
-- 2026-10-13
--
-- A learner signs in with their SCHOOL and ADMISSION NUMBER, not a username
-- they have to remember. Under the hood the login is still an auth.users row
-- whose email is "<school code>-<admission number>@learners.chipurobo.local",
-- so nothing about sessions, RLS or the learner_accounts link changes.
--
--   schools.code                 short, unique, URL-safe label per school,
--                                generated from the name unless set by an admin
--   club_members.admission_number the school's own number for the learner,
--                                unique within the school (not globally: two
--                                schools can both have "2026/001")
--   admission_login(code, adm)   the one place the username is derived, used
--                                by the database and mirrored in the client
--   school_login_options         names and codes for the sign-in page, readable
--                                before sign-in like public_schools_map
--   admin_bulk_create_learners   roster rows in, logins out, up to 500 a call
-- ============================================================================

-- ---------------------------------------------------------------- school code
alter table public.schools add column if not exists code text;

-- Short and memorable: the first two meaningful words of the name, so
-- "Alliance Girls High School" becomes "alliance-girls" and a login stays
-- short enough to type: "alliance-girls-2026-014".
create or replace function public.slug_for_school_name(p_name text)
returns text language plpgsql immutable as $$
declare v_words text[]; v_out text := ''; w text;
begin
  select array_agg(t.w order by t.n) into v_words
    from unnest(string_to_array(btrim(regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', ' ', 'g')), ' ')) with ordinality as t(w, n)
   where t.w <> '' and t.w not in ('school','schools','secondary','primary','senior','junior','high','mixed','day','boarding','the','of','for','and','centre','center');
  if v_words is null then return ''; end if;
  foreach w in array v_words loop
    if v_out = '' then v_out := left(w, 14);
    elsif length(v_out) + 1 + length(w) <= 14 then v_out := v_out || '-' || w;
    else exit; end if;
  end loop;
  return v_out;
end $$;

-- Backfill every school without a code, adding -2, -3 … on collisions.
do $$
declare r record; v_base text; v_code text; v_n int;
begin
  for r in select id, name from public.schools where code is null order by created_at, name loop
    v_base := coalesce(nullif(public.slug_for_school_name(r.name), ''), 'school');
    v_code := v_base; v_n := 1;
    while exists (select 1 from public.schools where code = v_code) loop
      v_n := v_n + 1; v_code := left(v_base, 14 - length('-' || v_n)) || '-' || v_n;
    end loop;
    update public.schools set code = v_code where id = r.id;
  end loop;
end $$;

alter table public.schools alter column code set not null;
alter table public.schools drop constraint if exists schools_code_format;
alter table public.schools add constraint schools_code_format check (code ~ '^[a-z0-9][a-z0-9-]{1,19}$');
create unique index if not exists schools_code_key on public.schools (code);

-- New schools get a code automatically so existing onboarding paths keep working.
create or replace function public.schools_default_code()
returns trigger language plpgsql as $$
declare v_base text; v_code text; v_n int := 1;
begin
  if new.code is not null then new.code := lower(btrim(new.code)); return new; end if;
  v_base := coalesce(nullif(public.slug_for_school_name(new.name), ''), 'school');
  v_code := v_base;
  while exists (select 1 from public.schools where code = v_code) loop
    v_n := v_n + 1; v_code := left(v_base, 14 - length('-' || v_n)) || '-' || v_n;
  end loop;
  new.code := v_code;
  return new;
end $$;
drop trigger if exists schools_default_code on public.schools;
create trigger schools_default_code before insert on public.schools
  for each row execute function public.schools_default_code();

comment on column public.schools.code is
  'Short unique label used in learner logins: <code>-<admission number>. Generated from the name; an admin may change it before learners are created.';

-- ---------------------------------------------------------- admission numbers
alter table public.club_members add column if not exists admission_number text;
alter table public.club_members drop constraint if exists club_members_admission_number_format;
alter table public.club_members add constraint club_members_admission_number_format
  check (admission_number is null or admission_number ~ '^[A-Za-z0-9][A-Za-z0-9/._ -]{0,19}$');
create unique index if not exists club_members_school_admission_key
  on public.club_members (school_id, lower(admission_number)) where admission_number is not null;

comment on column public.club_members.admission_number is
  'The school''s own number for this learner. Unique within the school. Used with schools.code to build the learner login.';

-- ------------------------------------------------------------ login builder
-- Mirrored in src/lib/learnerLogin.ts. Change both or neither.
create or replace function public.admission_login(p_code text, p_admission text)
returns text language plpgsql immutable as $$
declare v_login text;
begin
  v_login := lower(btrim(p_code)) || '-' || btrim(regexp_replace(lower(btrim(coalesce(p_admission, ''))), '[^a-z0-9]+', '-', 'g'), '-');
  if v_login !~ '^[a-z0-9][a-z0-9._-]{2,31}$' then
    raise exception 'Login "%" must be 3–32 characters. Shorten the school code or admission number.', v_login using errcode = '22023';
  end if;
  return v_login;
end $$;

-- ------------------------------------------------ sign-in page school list
create or replace view public.school_login_options as
  select id, name, code from public.schools;
grant select on public.school_login_options to anon, authenticated;
comment on view public.school_login_options is
  'Names and codes only, for the learner sign-in page. Readable before sign-in like public_schools_map.';

-- ------------------------------------------------------------- bulk create
-- p_rows: [{"full_name": "...", "admission_number": "...", "grade": "...", "password": "..."}]
-- A row without its own password uses p_default_password. Existing roster rows
-- (same school and admission number) are reused and updated; learners who
-- already have a login are skipped, never recreated.
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
      v_name := btrim(coalesce(v_row->>'full_name', ''));
      v_adm := btrim(coalesce(v_row->>'admission_number', ''));
      v_grade := nullif(btrim(coalesce(v_row->>'grade', '')), '');
      v_password := coalesce(nullif(v_row->>'password', ''), p_default_password);
      if v_name = '' then raise exception 'Missing full name' using errcode = '22023'; end if;
      if v_adm = '' then raise exception 'Missing admission number' using errcode = '22023'; end if;
      if v_password is null or length(v_password) < 8 then raise exception 'Password must be at least 8 characters' using errcode = '22023'; end if;

      select id into v_student from public.club_members
       where school_id = p_school_id and lower(admission_number) = lower(v_adm);
      if v_student is null then
        insert into public.club_members (school_id, full_name, grade, admission_number, in_club, is_active)
        values (p_school_id, v_name, v_grade, v_adm, true, true) returning id into v_student;
      else
        update public.club_members set full_name = v_name, grade = coalesce(v_grade, grade), is_active = true where id = v_student;
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
revoke all on function public.admin_bulk_create_learners(uuid, jsonb, text) from public, anon;
grant execute on function public.admin_bulk_create_learners(uuid, jsonb, text) to authenticated;
comment on function public.admin_bulk_create_learners(uuid, jsonb, text) is
  'Admin only. Creates roster rows and learner logins from admission numbers, up to 500 per call. Idempotent: reruns update names and skip learners who already have a login.';

-- The admin accounts list shows the admission number next to each login.
create or replace function public.admin_list_learning_accounts(p_school_id uuid)
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.me_is_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'role', p.role, 'full_name', p.full_name,
      'login', case when p.role = 'learner' then split_part(u.email, '@', 1) else u.email end,
      'student_id', l.student_id, 'admission_number', m.admission_number
    ) order by p.role, p.full_name), '[]'::jsonb)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.learner_accounts l on l.profile_id = p.id
    left join public.club_members m on m.id = l.student_id
    where p.school_id = p_school_id and p.role in ('teacher', 'learner'));
end;
$$;
