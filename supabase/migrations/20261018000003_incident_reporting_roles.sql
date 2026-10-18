-- Let every authenticated learning role file a safeguarding report for their
-- own school. Do not broaden me_school_id(): it deliberately protects legacy
-- school-operations policies from teacher and learner access.
create or replace function public.can_report_incident_for_school(
  p_target_school_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        p.role = 'admin'
        or (
          p.role in ('school_lead', 'teacher', 'learner')
          and p.school_id = p_target_school_id
        )
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  );
$$;

revoke all on function public.can_report_incident_for_school(uuid)
  from public, anon;
grant execute on function public.can_report_incident_for_school(uuid)
  to authenticated;

comment on function public.can_report_incident_for_school(uuid) is
  'Whether the signed-in user may file an incident for the requested school.';

drop policy if exists incidents_insert on public.incidents;
create policy incidents_insert on public.incidents
  for insert to authenticated
  with check (
    reported_by = auth.uid()
    and status = 'reported'
    and public.can_report_incident_for_school(school_id)
  );

notify pgrst, 'reload schema';
