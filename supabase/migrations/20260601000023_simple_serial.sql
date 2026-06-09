-- ============================================================================
-- Dead-simple serial generation via a sequence
--
-- Originally numbered 20260601000021 alongside a no-op advisory-lock file.
-- The duplicate version broke `supabase db push`, so it lives here under a
-- fresh version. The SQL is idempotent (create sequence IF NOT EXISTS,
-- create or replace functions) so re-applying is safe.
-- ============================================================================

create sequence if not exists public.product_units_serial_seq;

create or replace function public.generate_unit_serial(p_product_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_sku text;
begin
  select sku into v_sku from public.products where id = p_product_id;
  if v_sku is null or btrim(v_sku) = '' then v_sku := 'UNIT'; end if;
  return v_sku || '-' || nextval('public.product_units_serial_seq')::text;
end;
$$;

create or replace function public.product_units_auto_serial()
returns trigger
language plpgsql
as $$
begin
  if new.serial_number is null or btrim(new.serial_number) = '' then
    new.serial_number := public.generate_unit_serial(new.product_id);
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
