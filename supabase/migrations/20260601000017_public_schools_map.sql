-- ============================================================================
-- Public schools map view
--
-- Replaces public.public_maker_spaces — the map on the marketing site shows
-- EVERY school that has coordinates set, not just maker spaces. A flag on
-- each row tells the front-end whether the school is a maker space so the
-- marker popup can render a small badge.
-- ============================================================================

drop view if exists public.public_maker_spaces;

create or replace view public.public_schools_map as
  select
    id,
    name,
    county,
    latitude,
    longitude,
    is_maker_space
  from public.schools
  where latitude  is not null
    and longitude is not null;

grant select on public.public_schools_map to anon, authenticated;

comment on view public.public_schools_map is
  'Read-only map directory of every school with coordinates set. '
  'Visible to anonymous visitors so the marketing site can render the map.';
