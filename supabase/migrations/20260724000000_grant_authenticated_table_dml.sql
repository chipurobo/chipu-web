-- Ensure clean local/Cloud databases have the table privileges that RLS
-- policies expect. RLS still decides which rows each authenticated user can
-- see or change; these grants only let requests reach those policies.
do $$
declare
  r record;
begin
  for r in
    select format('%I.%I', n.nspname, c.relname) as fqname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute 'grant select, insert, update, delete on ' || r.fqname || ' to authenticated';
    execute 'grant select, insert, update, delete on ' || r.fqname || ' to service_role';
  end loop;
end
$$;
