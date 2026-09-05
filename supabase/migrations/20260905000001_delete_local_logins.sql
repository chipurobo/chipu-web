-- ============================================================================
-- Delete every non-admin account, keep every school
-- 2026-09-05
--
-- Schools survive automatically: public.schools has no foreign key to
-- auth.users or to profiles. What blocks the delete is the handful of rows
-- that POINT AT the account, so each is dealt with explicitly rather than
-- letting a cascade decide.
--
--   code_clubs.registered_by        RESTRICT, not null  -> reassigned to admin
--   stock_ledger.recorded_by        RESTRICT, not null  -> reassigned to admin
--   project_judgments.judged_by     NO ACTION, not null -> reassigned to admin
--   lesson_completions.recorded_by  NO ACTION, nullable -> set to null
--   profiles.id                     CASCADE             -> goes with the user
--
-- Reassigning rather than deleting keeps the club, the stock movements and the
-- judgments themselves. Only the person attached to them changes, to the
-- ChipuRobo admin account, which is the truthful owner once the teacher's
-- account no longer exists. A learner's lesson completion keeps its result and
-- simply loses the name of whoever ticked it, which is better than inventing
-- an attribution.
--
-- INCIDENTS ARE A HARD STOP. incidents.reported_by is RESTRICT and not null by
-- design: you are not supposed to be able to delete the person who filed a
-- safeguarding report, and quietly reattributing one to an admin would be
-- worse than refusing. If any of these accounts has filed one, this migration
-- aborts and changes nothing.
--
-- SCOPE: every account that is not an admin, not only the .local ones. The
-- end state is the two ChipuRobo/iHub admin logins and nothing else. That
-- includes accounts already on a real address, which is why this is worth
-- reading twice before it runs.
--
-- Schools, their contact emails, rosters, clubs, stock and judgments all
-- survive. Only the ability to sign in as those teachers is removed; new
-- logins are created later against real addresses.
-- ============================================================================

do $$
declare
  v_admin      uuid;
  v_incidents  int;
  v_targets    int;
  r            record;
begin
  -- Prefer the named ChipuRobo admin; fall back to any admin.
  select p.id into v_admin
    from public.profiles p join auth.users u on u.id = p.id
   where p.role = 'admin' and lower(u.email) = 'admin@chipurobo.com'
   limit 1;
  if v_admin is null then
    select id into v_admin from public.profiles where role = 'admin' order by id limit 1;
  end if;
  if v_admin is null then
    raise exception 'no admin account to inherit these records; aborting';
  end if;

  create temporary table _doomed on commit drop as
    select p.id
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.role <> 'admin';

  select count(*) into v_targets from _doomed;

  select count(*) into v_incidents
    from public.incidents i where i.reported_by in (select id from _doomed);
  if v_incidents > 0 then
    raise exception
      'aborting: % safeguarding report(s) were filed by these accounts. '
      'A reporter must not be deleted or silently reattributed.', v_incidents;
  end if;

  for r in select p.id, p.full_name, u.email, s.name as school
             from _doomed d
             join public.profiles p on p.id = d.id
             join auth.users u      on u.id = d.id
             left join public.schools s on s.id = p.school_id
            order by s.name nulls last
  loop
    raise notice 'deleting % (%) - school "%" is kept',
      r.full_name, r.email, coalesce(r.school, 'none');
  end loop;

  update public.code_clubs        set registered_by = v_admin where registered_by in (select id from _doomed);
  update public.stock_ledger      set recorded_by   = v_admin where recorded_by   in (select id from _doomed);
  update public.project_judgments set judged_by     = v_admin where judged_by     in (select id from _doomed);
  update public.lesson_completions set recorded_by  = null    where recorded_by   in (select id from _doomed);

  -- profiles rows disappear with the user via ON DELETE CASCADE.
  delete from auth.users where id in (select id from _doomed);

  raise notice '---- % non-admin account(s) deleted; every school kept ----', v_targets;
end $$;
