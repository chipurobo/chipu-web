-- ============================================================================
-- Tracks from the Theory of Change, and the technologies they name — 2026-08-10
--
-- The ToC defines two delivery tracks by CONTENT:
--
--   Primary track    robotics concepts, problem-solving, introductory coding
--   Secondary track  coding, AI, and 3D design and print
--
-- 20260810000010 set lessons.level from the Raspberry Pi Foundation's own
-- DIFFICULTY rating instead, which is a different axis entirely — it says how
-- hard a project is, not which track it belongs to. A level 1 3D-printing
-- project is easy AND squarely in the secondary track; difficulty could never
-- express that. This migration re-derives every level from the track
-- definitions above.
--
-- It also adds the two technologies the ToC names that were never imported:
--
--   3D design and print               31   named in the secondary track
--   Robotics and physical computing   26   the primary track's "robotics concepts"
--
-- Mapping, so the reasoning is inspectable rather than folklore:
--
--   physical_computing  → primary   (robotics concepts; advanced ones open to both)
--   3d_and_cad          → secondary (named explicitly)
--   ai_and_data         → secondary (named explicitly)
--   web_development     → secondary (coding; introductory ones open to both)
--   python              → primary at difficulty 1 ("introductory coding"),
--                         both at 2, secondary at 3
--
-- Scratch is deliberately still absent: the ToC's tracks name robotics, coding,
-- AI and 3D, and block-based coding is not among them. 81 Scratch projects are
-- available in the same API if that turns out to be wanted for early primary.
-- ============================================================================

-- ── 1. The technologies the ToC names ───────────────────────────────────────
insert into public.lessons
  (event_id, position, title, description, resource_url, kind, points,
   required_for_certificate, is_active, level)
select null, v.position, v.title, v.description, v.resource_url,
       'async_track'::public.stage_kind, v.points, false, true, v.level::public.lesson_level
from (values

  (300, '3D bug', '3D design and print · 7 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/blockscad-bug', 1, 'secondary'),
  (301, '3D key ring', '3D design and print · 7 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/blockscad-coder-keyring', 1, 'secondary'),
  (302, '3D pendant', '3D design and print · 7 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/blockscad-pendant', 1, 'secondary'),
  (303, '3D printable shoe charm', '3D design and print · 6 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/shoe-charm', 1, 'secondary'),
  (304, 'A guide to Unity', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/unity-guide', 1, 'secondary'),
  (305, 'Explore a 3D world', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/explore-a-3d-world', 1, 'secondary'),
  (306, 'Render a snow scene', '3D design and print · 5 steps', 'https://projects.raspberrypi.org/en/projects/blender-render-snow-scene', 1, 'secondary'),
  (307, 'Blender: Add material effects to a marble', '3D design and print · 9 steps', 'https://projects.raspberrypi.org/en/projects/blender-marble', 2, 'secondary'),
  (308, 'Blender: Create a 3D tiled floor', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/blender-tiled-floor', 2, 'secondary'),
  (309, 'Block house', '3D design and print · 5 steps', 'https://projects.raspberrypi.org/en/projects/blender-block-house', 2, 'secondary'),
  (310, 'Collisions and Colours', '3D design and print · 1 steps', 'https://projects.raspberrypi.org/en/projects/collisions-and-colours', 2, 'secondary'),
  (311, 'Colour a snowman', '3D design and print · 5 steps', 'https://projects.raspberrypi.org/en/projects/blender-colour-snowman', 2, 'secondary'),
  (312, 'Make a dice with FreeCAD', '3D design and print · 8 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/freecad-dice', 2, 'secondary'),
  (313, 'Non-player characters', '3D design and print · 8 steps', 'https://projects.raspberrypi.org/en/projects/non-player-characters', 2, 'secondary'),
  (314, 'Quest seeker', '3D design and print · 6 steps', 'https://projects.raspberrypi.org/en/projects/quest-seeker', 2, 'secondary'),
  (315, 'Rainbow run', '3D design and print · 9 steps', 'https://projects.raspberrypi.org/en/projects/rainbow-run', 2, 'secondary'),
  (316, 'Rocket', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/blender-rocket', 2, 'secondary'),
  (317, 'Snowman', '3D design and print · 6 steps', 'https://projects.raspberrypi.org/en/projects/blender-snowman', 2, 'secondary'),
  (318, 'Tree of cubes', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/blender-tree-of-cubes', 2, 'secondary'),
  (319, 'World builder', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/world-builder', 2, 'secondary'),
  (320, '3D adventure', '3D design and print · 6 steps', 'https://projects.raspberrypi.org/en/projects/3d-adventure', 3, 'secondary'),
  (321, 'Animate a snow scene', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/blender-animate-snow-scene', 3, 'secondary'),
  (322, 'Create a travel chess set with FreeCAD', '3D design and print · 8 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/freecad-chess-set', 3, 'secondary'),
  (323, 'Disco dance floor', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/disco-dance-floor', 3, 'secondary'),
  (324, 'Don''t fall through', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/dont-fall-through', 3, 'secondary'),
  (325, 'Make a headphone tidy with FreeCAD', '3D design and print · 9 steps · needs 3d printer', 'https://projects.raspberrypi.org/en/projects/freecad-headphone-tidy', 3, 'secondary'),
  (326, 'Marble mayhem!', '3D design and print · 6 steps', 'https://projects.raspberrypi.org/en/projects/marble-mayhem', 3, 'secondary'),
  (327, 'Party monkey', '3D design and print · 9 steps', 'https://projects.raspberrypi.org/en/projects/blender-party-monkey', 3, 'secondary'),
  (328, 'Pixel art reveal', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/pixel-art-reveal', 3, 'secondary'),
  (329, 'Star collector', '3D design and print · 7 steps', 'https://projects.raspberrypi.org/en/projects/star-collector', 3, 'secondary'),
  (330, 'Track designer', '3D design and print · 8 steps', 'https://projects.raspberrypi.org/en/projects/track-designer', 3, 'secondary'),
  (331, 'Against the Clock', 'Robotics and physical computing · 4 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/against-the-clock', 1, 'primary'),
  (332, 'Fortune Teller', 'Robotics and physical computing · 5 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/fortune-teller', 1, 'primary'),
  (333, 'Frustration', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/frustration', 1, 'primary'),
  (334, 'Hobby selector', 'Robotics and physical computing · 1 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/hobby-selector', 1, 'primary'),
  (335, 'Interactive badge', 'Robotics and physical computing · 6 steps · needs microbit, electronic components', 'https://projects.raspberrypi.org/en/projects/interactive-badge', 1, 'primary'),
  (336, 'Our beat', 'Robotics and physical computing · 5 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/our-beat', 1, 'primary'),
  (337, 'Rate Your Mates', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/rate-your-mates', 1, 'primary'),
  (338, 'Setting up your Raspberry Pi', 'Robotics and physical computing · 9 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/raspberry-pi-setting-up', 1, 'primary'),
  (339, 'Silly reminder', 'Robotics and physical computing · 1 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/silly-reminder', 1, 'primary'),
  (340, 'Sleep tracker', 'Robotics and physical computing · 9 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/sleep-tracker', 1, 'primary'),
  (341, 'Sock puppet', 'Robotics and physical computing · 9 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/sock-puppet', 1, 'primary'),
  (342, 'Sound level meter', 'Robotics and physical computing · 6 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/sound-meter', 1, 'primary'),
  (343, 'Using your Raspberry Pi', 'Robotics and physical computing · 12 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/raspberry-pi-using', 1, 'primary'),
  (344, 'Bike gloves', 'Robotics and physical computing · 4 steps · needs electronic components', 'https://projects.raspberrypi.org/en/projects/bike-gloves', 2, 'primary'),
  (345, 'Create a new command on Raspberry Pi', 'Robotics and physical computing · 8 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/raspberry-pi-command', 2, 'primary'),
  (346, 'Getting started with Raspberry Pi Pico', 'Robotics and physical computing · 11 steps · needs electronic components, raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/getting-started-with-the-pico', 2, 'primary'),
  (347, 'Getting started with soldering', 'Robotics and physical computing · 6 steps · needs electronic components', 'https://projects.raspberrypi.org/en/projects/getting-started-with-soldering', 2, 'primary'),
  (348, 'How''s your day?', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/hows-your-day', 2, 'primary'),
  (349, 'Music player', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/music-player', 2, 'primary'),
  (350, 'Reaction', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/reaction', 2, 'primary'),
  (351, 'Time to make', 'Robotics and physical computing · 10 steps · needs electronic components, raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/time-to-make', 2, 'primary'),
  (352, 'Touch-free tap', 'Robotics and physical computing · 7 steps · needs electronic components, raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/touch-free-tap', 2, 'primary'),
  (353, '3D-Printed Astro Pi Mark II Flight Case', 'Robotics and physical computing · 12 steps', 'https://projects.raspberrypi.org/en/projects/astro-pi-flight-case-mk2', 3, 'both'),
  (354, 'Active assistant', 'Robotics and physical computing · 7 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/active-assistant', 3, 'both'),
  (355, 'Friend frame', 'Robotics and physical computing · 10 steps · needs electronic components, raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/friend-frame', 3, 'both'),
  (356, 'Party game', 'Robotics and physical computing · 5 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/party-game', 3, 'both')
) as v(position, title, description, resource_url, points, level)
where not exists (select 1 from public.lessons l where l.title = v.title);


-- ── 2. Re-derive every imported lesson's track ──────────────────────────────
-- Matched on the technology recorded in the description by the import, which
-- is why that prefix exists. The core ChipuRobo curriculum (positions 1-99) is
-- taught across both levels and is left alone.
update public.lessons set level = 'secondary'
 where position >= 100
   and (description like '3D design and print%' or description like 'AI and data%');

update public.lessons set level = 'secondary'
 where position >= 100 and description like 'Web development%'
   and points >= 2;
update public.lessons set level = 'both'
 where position >= 100 and description like 'Web development%'
   and points = 1;

update public.lessons set level = 'primary'
 where position >= 100 and description like 'Robotics and physical computing%'
   and points <= 2;
update public.lessons set level = 'both'
 where position >= 100 and description like 'Robotics and physical computing%'
   and points = 3;

update public.lessons set level = 'primary'   where position >= 100 and description like 'Python%' and points = 1;
update public.lessons set level = 'both'      where position >= 100 and description like 'Python%' and points = 2;
update public.lessons set level = 'secondary' where position >= 100 and description like 'Python%' and points = 3;


do $$
declare v_total integer; v_p integer; v_s integer; v_b integer;
begin
  select count(*) into v_total from public.lessons;
  select count(*) into v_p from public.lessons where level = 'primary';
  select count(*) into v_s from public.lessons where level = 'secondary';
  select count(*) into v_b from public.lessons where level = 'both';
  raise notice 'lessons: % — primary %, secondary %, both %', v_total, v_p, v_s, v_b;
end $$;
