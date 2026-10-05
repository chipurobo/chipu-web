-- ============================================================================
-- Fill in the schools that were already there — 2026-08-28
--
-- 20260828000000 inserted the network and deliberately skipped any school
-- whose name was already present, so that nothing existing was duplicated or
-- overwritten. On production three of them already existed:
--
--   Machakos School for the Deaf
--   Ngala Secondary for the Deaf
--   St. Lucy School for the VI Meru
--
-- They were skipped, which was the intended behaviour — but they had no
-- coordinates, and get_public_schools_map() only returns schools that do. So
-- they were the only three of the fifty-nine missing from the map. Skipping
-- them protected their existing rows and quietly cost them their pin.
--
-- This backfills ONLY columns that are currently null. An existing value is
-- never replaced: if someone has already set a school's coordinates, level or
-- focus, whatever they set stands. On a database where 20260828000000 inserted
-- every row this updates nothing at all.
-- ============================================================================

with incoming (name, level, special_needs_focus, latitude, longitude) as (
  values
  ('Beth Mugo Secondary', 'secondary', null, -1.2670, 36.7500),
  ('Moi Girls Kamangu', 'secondary', null, -1.0833, 36.6167),
  ('Thika Primary', 'primary', 'visual_impairment', -1.0396, 37.0900),
  ('Alliance Girls High School', 'secondary', null, -1.2470, 36.6690),
  ('Moi Girls Isinya', 'secondary', null, -1.6833, 36.8500),
  ('Misyani Girls', 'secondary', null, -1.3500, 37.4667),
  ('Machakos School for the Deaf', 'secondary', 'hearing_impairment', -1.5100, 37.2700),
  ('NAKURU HIGH SENIOR SCHOOL', 'secondary', null, -0.2900, 36.0800),
  ('Ngala Secondary for the Deaf', 'secondary', 'hearing_impairment', -0.2900, 36.0700),
  ('OLE TIPIS GIRLS', 'secondary', null, -1.0833, 35.8667),
  ('Ngovio Girls', 'secondary', null, -0.5333, 37.4500),
  ('Kiamutugu Boys', 'secondary', null, -0.4667, 37.3833),
  ('KYENI MIXED SECONDARY', 'secondary', null, -1.3667, 38.0106),
  ('ST.PETER CLAVERS- KITHUKI SECONDARY', 'secondary', null, -1.8500, 37.6167),
  ('Kaaga Boys', 'secondary', null, 0.0900, 37.6600),
  ('St. Lucy School for the VI Meru', 'secondary', 'visual_impairment', 0.0500, 37.6500),
  ('S.H. NG''ARARIA GIRLS', 'secondary', null, -0.7167, 37.1000),
  ('Njiiri School', 'secondary', null, -0.9000, 37.0333),
  ('Salient Secondary School', 'secondary', null, -0.3000, 36.4500),
  ('Nyahururu High School', 'secondary', null, 0.0367, 36.3639),
  ('Kirimara Boys Senior School', 'secondary', null, -0.4167, 36.9500),
  ('Kajiunduthi High school', 'secondary', null, -0.3000, 37.6500),
  ('Emining Boys', 'secondary', null, 0.1167, 35.9333),
  ('MOI SIONGIROI GIRLS', 'secondary', null, -0.8667, 35.2167),
  ('Kaptele Secondary School', 'secondary', null, -0.3667, 35.2833),
  ('NGUMO Boys Secondary Schol', 'secondary', null, 0.0333, 36.7000),
  ('Umu salama girls secondary school', 'secondary', null, -0.4536, 39.6461),
  ('ISIOLO BARRACKS SECONDARY', 'secondary', null, 0.3540, 37.5820),
  ('St Peter''s Secondary', 'secondary', null, -3.6300, 39.8500),
  ('Lukore Secondary School', 'secondary', null, -4.2333, 39.4167),
  ('Likoni Primary Shool for the Visually Impaired', 'primary', 'visual_impairment', -4.0870, 39.6600),
  ('Likoni Secondary School for VI', 'secondary', 'visual_impairment', -4.0880, 39.6610),
  ('Chala Secondary', 'secondary', null, -3.3833, 37.6833),
  ('MAU MAU MEMORIAL SENIOR SCHOOL', 'secondary', null, -1.5000, 40.0300),
  ('Kemeloi Boys Secondary school', 'secondary', null, 0.0500, 35.0333),
  ('UASIN GISHU SENIOR SCHOOL', 'secondary', null, 0.5200, 35.2700),
  ('Bungoma High Senior School', 'secondary', null, 0.5667, 34.5600),
  ('Friends School Kamusinga', 'secondary', null, 0.7906, 34.7169),
  ('Kibuk Girls', 'secondary', null, 0.8500, 34.6500),
  ('S A Kolanya Girls', 'secondary', null, 0.6167, 34.2833),
  ('Karabok Mixed Secondary School', 'secondary', null, -0.7333, 34.3667),
  ('Musoli Girls', 'secondary', null, 0.1000, 34.6000),
  ('KISII SCHOOL', 'secondary', null, -0.6817, 34.7680),
  ('Bar Union Secondary School', 'secondary', null, -0.1000, 34.7000),
  ('Kisian Secondary Kisumu', 'secondary', null, -0.0833, 34.6667),
  ('St. Pius Uriri Boys High School', 'secondary', null, -0.9833, 34.3667),
  ('Mochenwa Secondary School', 'secondary', null, -0.5667, 34.9333),
  ('Usenge Boys High', 'secondary', null, -0.0833, 34.1667),
  ('St Mary''s Yala', 'secondary', null, 0.0972, 34.5333),
  ('Chango Senior Secondary', 'secondary', null, 0.0700, 34.7200),
  ('St. Peters Iten Mixed', 'secondary', null, 0.6700, 35.5100),
  ('Mwangaza Muslim Mixed Day', 'secondary', null, 1.0972, 36.7000),
  ('St Joseph Girls', 'secondary', null, 1.0167, 35.0000),
  ('St James Pokotom', 'secondary', null, 3.1167, 35.6000),
  ('ST CECILIA CHEPARERIA', 'secondary', null, 1.2000, 35.2000),
  ('MOKOWE ARID ZONE', 'secondary', null, -2.2667, 40.8667),
  ('Rhamu Girls Secondary', 'secondary', null, 3.9333, 41.2167),
  ('Turbi Girls', 'secondary', null, 3.3200, 37.9800),
  ('Senior Chief Adano Girls Senior School', 'secondary', null, 1.7470, 40.0573)
)
update public.schools s
set
  latitude            = coalesce(s.latitude,  i.latitude),
  longitude           = coalesce(s.longitude, i.longitude),
  level               = coalesce(s.level,     i.level::public.school_level),
  special_needs_focus = coalesce(s.special_needs_focus, i.special_needs_focus),
  updated_at          = now()
from incoming i
where lower(regexp_replace(s.name, '\s+', ' ', 'g')) = lower(i.name)
  and (
    s.latitude            is null or
    s.longitude           is null or
    s.level               is null or
    (s.special_needs_focus is null and i.special_needs_focus is not null)
  );

notify pgrst, 'reload schema';
