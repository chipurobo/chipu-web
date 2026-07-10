-- ============================================================================
-- Fix product_units serial-number collisions.
--
-- The previous generator used `count(*) + 1` for the trailing number. If a
-- unit got deleted along the way (cascade from a deleted order, a manual
-- delete, etc.) the count dropped below the highest suffix already used,
-- and the next insert produced a serial that collided with an existing
-- one → "duplicate key value violates unique constraint
-- product_units_serial_number_key".
--
-- New algorithm:
--   1. Find the MAX numeric suffix among existing serials matching
--      "<SKU>-<digits>" for the product.
--   2. Start at max + 1, then loop probing until we find a value that
--      isn't already taken anywhere in product_units (the serial column
--      is globally unique).
--   3. Safety cap at 999_999 iterations to prevent infinite loops.
-- ============================================================================

create or replace function public.generate_unit_serial(p_product_id uuid)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_sku        text;
  v_prefix     text;
  v_pattern    text;
  v_next       integer;
  v_candidate  text;
  v_attempts   integer := 0;
begin
  select sku into v_sku from public.products where id = p_product_id;
  if v_sku is null or btrim(v_sku) = '' then
    v_sku := 'UNIT';
  end if;

  v_prefix  := v_sku || '-';
  -- Escape regex specials in the prefix so a SKU like "RC-001" matches literally.
  v_pattern := '^' || regexp_replace(v_prefix, '([.+*?()\[\]\\^$|])', '\\\1', 'g') || '[0-9]+$';

  -- Start one past the highest existing numeric suffix for this SKU.
  select coalesce(
           max((regexp_replace(serial_number, '^.*-([0-9]+)$', '\1'))::integer),
           0
         ) + 1
    into v_next
    from public.product_units
   where serial_number ~ v_pattern;

  -- Probe forward until we find a serial that isn't taken anywhere.
  loop
    v_candidate := v_prefix || lpad(v_next::text, 3, '0');
    if not exists (select 1 from public.product_units where serial_number = v_candidate) then
      return v_candidate;
    end if;
    v_next := v_next + 1;
    v_attempts := v_attempts + 1;
    exit when v_attempts > 999999;
  end loop;

  raise exception 'could not generate a unique serial for product %', p_product_id;
end;
$$;
