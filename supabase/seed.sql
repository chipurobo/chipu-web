-- ============================================================================
-- Seed for local development.
-- Run automatically by `supabase db reset` (and once on `supabase start`).
--
-- This file does NOT create auth users — let the CLI do that. Instead it
-- seeds a tiny product catalogue and two demo schools, then later (after
-- you create a real admin auth user in Supabase Studio) you can run the
-- "promote me to admin" snippet at the bottom from the SQL Editor.
-- ============================================================================

-- ---- Demo products ---------------------------------------------------------
insert into public.products (id, name, description, category, is_durable, sku) values
  ('11111111-1111-1111-1111-111111111111',
   'Braille Input Keypad',
   'Tactile keypad designed for blind and low-vision learners. Pairs with the inclusive curriculum.',
   'braille',
   true,
   'BK-001'),
  ('22222222-2222-2222-2222-222222222222',
   'PET Filament Spool (1kg)',
   'Recycled-PET 3D-printer filament fabricated at maker-space labs.',
   'consumable',
   false,
   'PF-001'),
  ('33333333-3333-3333-3333-333333333333',
   'Robot Chassis v2',
   'Raspberry Pi controlled robot chassis with sensors and motors.',
   'robotics',
   true,
   'RC-002'),
  ('44444444-4444-4444-4444-444444444444',
   'Cyberbrick Soccer Kit',
   'Junior Secondary Cyberbrick League soccer-robotics kit.',
   'robotics',
   true,
   'CB-001'),
  ('55555555-5555-5555-5555-555555555555',
   'Lesson Pack — KSL Module 1',
   'Kenyan Sign Language lesson pack (consumable workbooks + activity cards).',
   'consumable',
   false,
   'LP-KSL-01')
on conflict (id) do nothing;

-- ---- Demo schools ----------------------------------------------------------
-- These start unlinked to any auth user. Useful for testing admin views and
-- the "place an order" flow without going through signup.
insert into public.schools (id, name, type, is_maker_space, county) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'Kibera Primary',
   'mainstream',
   false,
   'Nairobi'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
   'Strathmore Maker Lab',
   'integrated',
   true,
   'Nairobi'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',
   'Thika School for the Blind',
   'special',
   false,
   'Kiambu')
on conflict (id) do nothing;

-- ============================================================================
-- POST-SEED: promote yourself to admin
-- ============================================================================
-- After you create your first auth user (sign up via the dashboard or
-- Supabase Studio → Authentication), run this from the SQL Editor with your
-- own email substituted in:
--
--   update public.profiles
--      set role = 'admin', school_id = null
--    where id = (select id from auth.users where email = 'you@chipurobo.com');
--
-- That user can then access everything site-wide.
-- ============================================================================
