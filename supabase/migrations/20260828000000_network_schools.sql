-- ============================================================================
-- The school network — 59 schools, one per county, on the public map
--
-- These are network schools, NOT maker spaces. is_maker_space stays false, so
-- they render as the ordinary teal pin rather than the terracotta maker-space
-- one. get_public_schools_map() already returns every school that has
-- coordinates, so nothing else has to change for them to appear.
--
-- Two columns are added because the supplied data carries two facts the
-- schools table had nowhere to put:
--
--   level               primary / secondary. The two delivery tracks are split
--                       on exactly this line, so it is not cosmetic.
--   special_needs_focus schools.type collapses every special school into
--                       'special'. That loses whether a school serves learners
--                       who are deaf or learners who are blind — which decides
--                       whether a session needs KSL interpretation or braille.
--                       This records the school's own designation. It is an
--                       institutional fact about the school, never a record
--                       about any learner (see 20260810000012_adaptations.sql).
--
-- ON COORDINATES. These are locality-level: the school's town, ward or nearest
-- centre, not a surveyed position. Every one is inside Kenya and inside the
-- county it is filed under, and no two schools share a pin — but treat them as
-- "roughly here" until someone checks them. They are good enough to draw a
-- national map and not good enough to navigate to.
--
-- Existing rows are left completely alone. If a school of the same name is
-- already present, this migration skips it rather than inserting a second row
-- or overwriting what is there.
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'school_level') then
    create type public.school_level as enum ('primary', 'secondary');
  end if;
end $$;

alter table public.schools
  add column if not exists level public.school_level;

alter table public.schools
  add column if not exists special_needs_focus text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'schools_special_needs_focus_check'
  ) then
    alter table public.schools
      add constraint schools_special_needs_focus_check
        check (special_needs_focus is null
               or special_needs_focus in ('visual_impairment', 'hearing_impairment'));
  end if;
end $$;

comment on column public.schools.level is
  'primary or secondary. Matches the two delivery tracks; null where unknown.';

comment on column public.schools.special_needs_focus is
  'The school''s own designation where it is a special school: '
  'visual_impairment or hearing_impairment. Null for mainstream and '
  'integrated schools. An institutional fact about the school - never a '
  'record about an individual learner.';

-- ----------------------------------------------------------------------------
-- The 59 schools
-- ----------------------------------------------------------------------------
with incoming (name, county, type, level, special_needs_focus, latitude, longitude) as (
  values
  ('Beth Mugo Secondary', 'Nairobi City', 'mainstream', 'secondary', null, -1.2670, 36.7500),
  ('Moi Girls Kamangu', 'Kiambu', 'mainstream', 'secondary', null, -1.0833, 36.6167),
  ('Thika Primary', 'Kiambu', 'special', 'primary', 'visual_impairment', -1.0396, 37.0900),
  ('Alliance Girls High School', 'Kiambu', 'mainstream', 'secondary', null, -1.2470, 36.6690),
  ('Moi Girls Isinya', 'Kajiado', 'mainstream', 'secondary', null, -1.6833, 36.8500),
  ('Misyani Girls', 'Machakos', 'mainstream', 'secondary', null, -1.3500, 37.4667),
  ('Machakos School for the Deaf', 'Machakos', 'special', 'secondary', 'hearing_impairment', -1.5100, 37.2700),
  ('NAKURU HIGH SENIOR SCHOOL', 'Nakuru', 'mainstream', 'secondary', null, -0.2900, 36.0800),
  ('Ngala Secondary for the Deaf', 'Nakuru', 'special', 'secondary', 'hearing_impairment', -0.2900, 36.0700),
  ('OLE TIPIS GIRLS', 'Narok', 'mainstream', 'secondary', null, -1.0833, 35.8667),
  ('Ngovio Girls', 'Embu', 'mainstream', 'secondary', null, -0.5333, 37.4500),
  ('Kiamutugu Boys', 'Kirinyaga', 'mainstream', 'secondary', null, -0.4667, 37.3833),
  ('KYENI MIXED SECONDARY', 'Kitui', 'mainstream', 'secondary', null, -1.3667, 38.0106),
  ('ST.PETER CLAVERS- KITHUKI SECONDARY', 'Makueni', 'mainstream', 'secondary', null, -1.8500, 37.6167),
  ('Kaaga Boys', 'Meru', 'mainstream', 'secondary', null, 0.0900, 37.6600),
  ('St. Lucy School for the VI Meru', 'Meru', 'special', 'secondary', 'visual_impairment', 0.0500, 37.6500),
  ('S.H. NG''ARARIA GIRLS', 'Murang''a', 'mainstream', 'secondary', null, -0.7167, 37.1000),
  ('Njiiri School', 'Murang''a', 'mainstream', 'secondary', null, -0.9000, 37.0333),
  ('Salient Secondary School', 'Nyandarua', 'mainstream', 'secondary', null, -0.3000, 36.4500),
  ('Nyahururu High School', 'Nyandarua', 'mainstream', 'secondary', null, 0.0367, 36.3639),
  ('Kirimara Boys Senior School', 'Nyeri', 'mainstream', 'secondary', null, -0.4167, 36.9500),
  ('Kajiunduthi High school', 'Tharaka-Nithi', 'mainstream', 'secondary', null, -0.3000, 37.6500),
  ('Emining Boys', 'Baringo', 'mainstream', 'secondary', null, 0.1167, 35.9333),
  ('MOI SIONGIROI GIRLS', 'Bomet', 'mainstream', 'secondary', null, -0.8667, 35.2167),
  ('Kaptele Secondary School', 'Kericho', 'mainstream', 'secondary', null, -0.3667, 35.2833),
  ('NGUMO Boys Secondary Schol', 'Laikipia', 'mainstream', 'secondary', null, 0.0333, 36.7000),
  ('Umu salama girls secondary school', 'Garissa', 'mainstream', 'secondary', null, -0.4536, 39.6461),
  ('ISIOLO BARRACKS SECONDARY', 'Isiolo', 'mainstream', 'secondary', null, 0.3540, 37.5820),
  ('St Peter''s Secondary', 'Kilifi', 'mainstream', 'secondary', null, -3.6300, 39.8500),
  ('Lukore Secondary School', 'Kwale', 'mainstream', 'secondary', null, -4.2333, 39.4167),
  ('Likoni Primary Shool for the Visually Impaired', 'Mombasa', 'special', 'primary', 'visual_impairment', -4.0870, 39.6600),
  ('Likoni Secondary School for VI', 'Mombasa', 'special', 'secondary', 'visual_impairment', -4.0880, 39.6610),
  ('Chala Secondary', 'Taita/Taveta', 'mainstream', 'secondary', null, -3.3833, 37.6833),
  ('MAU MAU MEMORIAL SENIOR SCHOOL', 'Tana River', 'mainstream', 'secondary', null, -1.5000, 40.0300),
  ('Kemeloi Boys Secondary school', 'Nandi', 'mainstream', 'secondary', null, 0.0500, 35.0333),
  ('UASIN GISHU SENIOR SCHOOL', 'Uasin Gishu', 'mainstream', 'secondary', null, 0.5200, 35.2700),
  ('Bungoma High Senior School', 'Bungoma', 'mainstream', 'secondary', null, 0.5667, 34.5600),
  ('Friends School Kamusinga', 'Bungoma', 'mainstream', 'secondary', null, 0.7906, 34.7169),
  ('Kibuk Girls', 'Bungoma', 'mainstream', 'secondary', null, 0.8500, 34.6500),
  ('S A Kolanya Girls', 'Busia', 'mainstream', 'secondary', null, 0.6167, 34.2833),
  ('Karabok Mixed Secondary School', 'Homa Bay', 'mainstream', 'secondary', null, -0.7333, 34.3667),
  ('Musoli Girls', 'Kakamega', 'mainstream', 'secondary', null, 0.1000, 34.6000),
  ('KISII SCHOOL', 'Kisii', 'mainstream', 'secondary', null, -0.6817, 34.7680),
  ('Bar Union Secondary School', 'Kisumu', 'mainstream', 'secondary', null, -0.1000, 34.7000),
  ('Kisian Secondary Kisumu', 'Kisumu', 'mainstream', 'secondary', null, -0.0833, 34.6667),
  ('St. Pius Uriri Boys High School', 'Migori', 'mainstream', 'secondary', null, -0.9833, 34.3667),
  ('Mochenwa Secondary School', 'Nyamira', 'mainstream', 'secondary', null, -0.5667, 34.9333),
  ('Usenge Boys High', 'Siaya', 'mainstream', 'secondary', null, -0.0833, 34.1667),
  ('St Mary''s Yala', 'Siaya', 'mainstream', 'secondary', null, 0.0972, 34.5333),
  ('Chango Senior Secondary', 'Vihiga', 'mainstream', 'secondary', null, 0.0700, 34.7200),
  ('St. Peters Iten Mixed', 'Elgeyo/Marakwet', 'mainstream', 'secondary', null, 0.6700, 35.5100),
  ('Mwangaza Muslim Mixed Day', 'Samburu', 'mainstream', 'secondary', null, 1.0972, 36.7000),
  ('St Joseph Girls', 'Trans Nzoia', 'mainstream', 'secondary', null, 1.0167, 35.0000),
  ('St James Pokotom', 'Turkana', 'mainstream', 'secondary', null, 3.1167, 35.6000),
  ('ST CECILIA CHEPARERIA', 'West Pokot', 'mainstream', 'secondary', null, 1.2000, 35.2000),
  ('MOKOWE ARID ZONE', 'Lamu', 'mainstream', 'secondary', null, -2.2667, 40.8667),
  ('Rhamu Girls Secondary', 'Mandera', 'mainstream', 'secondary', null, 3.9333, 41.2167),
  ('Turbi Girls', 'Marsabit', 'mainstream', 'secondary', null, 3.3200, 37.9800),
  ('Senior Chief Adano Girls Senior School', 'Wajir', 'mainstream', 'secondary', null, 1.7470, 40.0573)
)
insert into public.schools
  (name, county, type, level, special_needs_focus, latitude, longitude, is_maker_space)
select
  i.name,
  i.county,
  i.type::public.school_type,
  i.level::public.school_level,
  i.special_needs_focus,
  i.latitude,
  i.longitude,
  false
from incoming i
where not exists (
  select 1 from public.schools s
  where lower(regexp_replace(s.name, '\s+', ' ', 'g')) = lower(i.name)
);

notify pgrst, 'reload schema';
