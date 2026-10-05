-- Published Blockly lessons and capstones require actual program evidence,
-- including when called directly through the older optional-argument RPC.
create function public.require_blockly_submission()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.blockly_workspace is null and exists(select 1 from public.learning_assignments
    where id=new.assignment_id and learning_plan->>'delivery'='blockly') then
    raise exception 'This lesson or project requires a Blockly program.' using errcode='22023';
  end if;
  return new;
end;
$$;
revoke all on function public.require_blockly_submission() from public,anon,authenticated;
create trigger learning_submissions_require_blockly before insert on public.learning_submissions
  for each row execute function public.require_blockly_submission();
