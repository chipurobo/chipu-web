-- ============================================================================
-- School coordinates + public maker-space map
--
-- 1. Two new columns on public.schools — latitude / longitude (nullable
--    doubles, validated to real geographic ranges).
--
-- 2. A read-only view public.public_maker_spaces that exposes the bare
--    minimum (id, name, county, lat, lng) for maker-space schools that
--    have coordinates filled in. Anonymous (logged-out) visitors of the
--    marketing site read from this view to render the map.
--
-- The view is created by the postgres role (superuser) and runs with the
-- creator's privileges, so RLS on the underlying schools table doesn't
-- block reads through the view. We explicitly grant SELECT on the view
-- to anon + authenticated.
-- ============================================================================

alter table public.schools
  add column if not exists latitude  double precision,
  add column if not exists longitude double precision;

alter table public.schools
  add constraint schools_latitude_range_check
    check (latitude  is null or (latitude  between  -90 and  90)) not valid;

alter table public.schools
  add constraint schools_longitude_range_check
    check (longitude is null or (longitude between -180 and 180)) not valid;

-- Validate any data that's already there (safe on empty table; effectively a no-op).
alter table public.schools validate constraint schools_latitude_range_check;
alter table public.schools validate constraint schools_longitude_range_check;

comment on column public.schools.latitude  is 'Decimal degrees (-90..90).';
comment on column public.schools.longitude is 'Decimal degrees (-180..180).';

-- ----------------------------------------------------------------------------
-- Public maker-space directory view
-- ----------------------------------------------------------------------------
create or replace view public.public_maker_spaces as
  select
    id,
    name,
    county,
    latitude,
    longitude
  from public.schools
  where is_maker_space = true
    and latitude  is not null
    and longitude is not null;

grant select on public.public_maker_spaces to anon, authenticated;

comment on view public.public_maker_spaces is
  'Read-only directory of maker-space schools with coordinates. Visible to '
  'anonymous visitors so the marketing site can render the map.';
