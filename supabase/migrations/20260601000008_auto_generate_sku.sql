-- ============================================================================
-- Auto-generate product SKUs
--
-- Admin no longer types in a SKU when adding a product. A BEFORE INSERT
-- trigger sets one based on the product name + a global sequence:
--
--   "Braille Input Keypad"     → BIK-0001
--   "Robot Chassis v2"         → RCV-0002
--   "PET Filament Spool (1kg)" → PFS-0003
--
-- The prefix is the first letter of each space/dash separated word in the
-- name, uppercased, truncated to 3 letters; if nothing letter-y is left we
-- fall back to PRD. The counter is a global sequence so collisions are
-- impossible. Explicit SKUs in seed data and migrations are preserved
-- (the trigger only fills in NULL).
-- ============================================================================

create sequence if not exists public.products_sku_seq start 100;

create or replace function public.generate_product_sku(p_name text)
returns text
language plpgsql
as $$
declare
  v_prefix text := '';
  v_words  text[];
  v_word   text;
  v_clean  text;
begin
  v_words := regexp_split_to_array(coalesce(p_name, ''), '[\s\-_]+');
  foreach v_word in array v_words loop
    v_clean := regexp_replace(upper(v_word), '[^A-Z]', '', 'g');
    if length(v_clean) > 0 then
      v_prefix := v_prefix || substr(v_clean, 1, 1);
    end if;
    exit when length(v_prefix) >= 3;
  end loop;

  if length(v_prefix) = 0 then
    v_prefix := 'PRD';
  end if;

  return v_prefix || '-' || lpad(nextval('public.products_sku_seq')::text, 4, '0');
end;
$$;

create or replace function public.products_auto_sku()
returns trigger
language plpgsql
as $$
begin
  if new.sku is null or btrim(new.sku) = '' then
    new.sku := public.generate_product_sku(new.name);
  end if;
  return new;
end;
$$;

drop trigger if exists products_auto_sku_trigger on public.products;
create trigger products_auto_sku_trigger
  before insert on public.products
  for each row execute function public.products_auto_sku();
