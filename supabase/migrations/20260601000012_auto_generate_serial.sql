-- ============================================================================
-- Auto-generate product_units.serial_number
--
-- Maker spaces no longer type a serial when fabricating a unit. A BEFORE
-- INSERT trigger generates one as:
--
--   "<product.sku>-<NNN>"
--
-- where NNN is the next per-product count, zero-padded to 3 digits.
--
--   Product BK-0001 → units BK-0001-001, BK-0001-002, BK-0001-003, …
--   Product RC-0002 → units RC-0002-001, RC-0002-002, …
--
-- Explicitly-set serial_number values are preserved (the trigger only
-- fills when NULL / blank), so any historical data is untouched.
-- ============================================================================

create or replace function public.generate_unit_serial(p_product_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_sku  text;
  v_next integer;
begin
  select sku into v_sku
    from public.products
   where id = p_product_id;

  if v_sku is null or btrim(v_sku) = '' then
    v_sku := 'UNIT';
  end if;

  -- Per-product count + 1. Races are unlikely for a single maker space
  -- but the unique constraint on serial_number is the ultimate guard.
  select count(*) + 1
    into v_next
    from public.product_units
   where product_id = p_product_id;

  return v_sku || '-' || lpad(v_next::text, 3, '0');
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

drop trigger if exists product_units_auto_serial_trigger on public.product_units;
create trigger product_units_auto_serial_trigger
  before insert on public.product_units
  for each row execute function public.product_units_auto_serial();
