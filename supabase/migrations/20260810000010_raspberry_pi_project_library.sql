-- ============================================================================
-- Raspberry Pi Foundation project library — 2026-08-10
--
-- Adds the 134 projects the Foundation publishes across the three
-- technologies ChipuRobo teaches:
--
--   Python            90   https://projects.raspberrypi.org/en/technology/python
--   AI and data       17   https://projects.raspberrypi.org/en/technology/ai_and_data
--   Web development   27   https://projects.raspberrypi.org/en/technology/web_development
--
-- Titles, difficulty, step counts and hardware needs were read from the
-- Foundation's own API (learning-admin.raspberrypi.org/api/v2/projects) rather
-- than transcribed, so they match the source exactly, and the project URLs were
-- checked to resolve before being written here.
--
-- Every row carries resource_url — the page a teacher actually opens to run the
-- lesson — so the dashboard renders a link rather than burying it in prose.
--
-- SCHOOL LEVEL IS A STARTING POINT, NOT A CURRICULUM JUDGEMENT. It is derived
-- from the Foundation's own difficulty rating:
--
--   difficulty 1 → primary     (64 lessons)
--   difficulty 2 → both        (43 lessons)   upper primary and junior secondary
--   difficulty 3 → secondary   (27 lessons)
--
-- Nobody has mapped these against the Kenyan curriculum yet, and an admin can
-- change any of them on /dashboard/admin/lessons. They are set so a teacher is
-- not handed 134 undifferentiated lessons on day one.
--
-- These are a LIBRARY, not the core competition curriculum:
--   • kind = async_track, evidenced by lesson_completions.evidence_url
--   • required_for_certificate = false — they extend the certificate path
--     rather than gate it
--   • positions start at 100, leaving 1-99 to the core curriculum
--
-- 43 need hardware, recorded in the description so a teacher sees it before
-- booking rather than mid-session.
--
-- lessons_ensure_workshop() creates a bookable workshop per lesson, so this
-- also adds 134 workshops to the catalogue.
--
-- Idempotent: matched on title, so re-running adds nothing.
-- ============================================================================

insert into public.lessons
  (event_id, position, title, description, resource_url, kind, points,
   required_for_certificate, is_active, level)
select null, v.position, v.title, v.description, v.resource_url,
       'async_track'::public.stage_kind, v.points, false, true, v.level::public.lesson_level
from (values

  (100, 'About me', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/about-me', 1, 'primary'),
  (101, 'Astro Pi: Mission Zero', 'Python · 5 steps · needs sense hat', 'https://projects.raspberrypi.org/en/projects/astro-pi-mission-zero', 1, 'primary'),
  (102, 'Colourful creations', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/editor-colourful-creations', 1, 'primary'),
  (103, 'Crafty critters', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/crafty-critters', 1, 'primary'),
  (104, 'Documenting your code', 'Python · 11 steps', 'https://projects.raspberrypi.org/en/projects/documenting-your-code', 1, 'primary'),
  (105, 'Don''t collide!', 'Python · 11 steps', 'https://projects.raspberrypi.org/en/projects/editor-dont-collide', 1, 'primary'),
  (106, 'Editor Hello 🌍🌎🌏', 'Python · 17 steps', 'https://projects.raspberrypi.org/en/projects/editor-hello-world', 1, 'primary'),
  (107, 'Emoji animation', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-emoji-animation', 1, 'primary'),
  (108, 'Encoded art', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/editor-encoded-art', 1, 'primary'),
  (109, 'Escape the maze', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-rpg', 1, 'primary'),
  (110, 'Getting started with GUIs', 'Python · 13 steps', 'https://projects.raspberrypi.org/en/projects/getting-started-with-guis', 1, 'primary'),
  (111, 'Getting started with your Raspberry Pi Pico W', 'Python · 6 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/get-started-pico-w', 1, 'primary'),
  (112, 'Holi', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/editor-holi', 1, 'primary'),
  (113, 'LED firefly', 'Python · 8 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/led-firefly', 1, 'primary'),
  (114, 'Make a face', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/editor-make-a-face', 1, 'primary'),
  (115, 'Modern Art', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/editor-modern-art', 1, 'primary'),
  (116, 'Party popper', 'Python · 7 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/party-popper', 1, 'primary'),
  (117, 'Password generator', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/editor-password-generator', 1, 'primary'),
  (118, 'Pixel art', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-pixel-art', 1, 'primary'),
  (119, 'Python bytes - Disgusting dishes', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/python-bytes-disgusting-dishes', 1, 'primary'),
  (120, 'Python bytes - Gross groceries', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/python-bytes-gross-groceries', 1, 'primary'),
  (121, 'Python bytes - Recipe wreckers', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/python-bytes-recipe-wreckers', 1, 'primary'),
  (122, 'Python wild - Dot the bug', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/python-wild-dot-the-bug', 1, 'primary'),
  (123, 'Python wild - Hop the frog', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/python-wild-hop-the-frog', 1, 'primary'),
  (124, 'Rock, Paper, Scissors', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/editor-rock-paper-scissors', 1, 'primary'),
  (125, 'Rocket Launch', 'Python · 11 steps', 'https://projects.raspberrypi.org/en/projects/editor-rocket-launch', 1, 'primary'),
  (126, 'Scary ''spot the difference''', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/scary-spot-the-difference', 1, 'primary'),
  (127, 'Secure messages', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/editor-secure-messages', 1, 'primary'),
  (128, 'Shakespearean insult generator', 'Python · 4 steps', 'https://projects.raspberrypi.org/en/projects/shakespearean-insult-generator', 1, 'primary'),
  (129, 'Story time', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/storytime', 1, 'primary'),
  (130, 'Target practice', 'Python · 13 steps', 'https://projects.raspberrypi.org/en/projects/editor-target-practice', 1, 'primary'),
  (131, 'Team chooser', 'Python · 11 steps', 'https://projects.raspberrypi.org/en/projects/editor-team-chooser', 1, 'primary'),
  (132, 'The parent detector', 'Python · 7 steps · needs raspberry pi camera module, electronic components, raspberry pi', 'https://projects.raspberrypi.org/en/projects/parent-detector', 1, 'primary'),
  (133, 'Treat flip cards', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/editor-flip-treat-webcards', 1, 'primary'),
  (134, 'Turtle race', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-turtle-race', 1, 'primary'),
  (135, 'Turtley Amazing', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/editor-turtley-amazing', 1, 'primary'),
  (136, 'Ultrasonic theremin', 'Python · 5 steps · needs raspberry pi, electronic components', 'https://projects.raspberrypi.org/en/projects/ultrasonic-theremin', 1, 'primary'),
  (137, 'Using pip on Raspberry Pi', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/using-pip-on-raspberry-pi', 1, 'primary'),
  (138, 'Using pip on Windows', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/using-pip-on-windows', 1, 'primary'),
  (139, 'Balloon Pi-tay Popper', 'Python · 10 steps · needs electronic components', 'https://projects.raspberrypi.org/en/projects/balloon-pi-tay-popper', 2, 'both'),
  (140, 'Beating heart', 'Python · 8 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/beating-heart', 2, 'both'),
  (141, 'Build a Python Web Server with Flask', 'Python · 7 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/python-web-server-with-flask', 2, 'both'),
  (142, 'Charting champions', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/charting-champions', 2, 'both'),
  (143, 'Codebreaker', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-codebreaker', 2, 'both'),
  (144, 'Cress Egg Heads', 'Python · 6 steps · needs raspberry pi camera module, raspberry pi', 'https://projects.raspberrypi.org/en/projects/cress-egg-heads', 2, 'both'),
  (145, 'Explorer HAT buggy', 'Python · 8 steps · needs electronic components', 'https://projects.raspberrypi.org/en/projects/explorer-hat-buggy', 2, 'both'),
  (146, 'Getting started with the Camera Module', 'Python · 8 steps · needs electronic components, raspberry pi camera module, raspberry pi', 'https://projects.raspberrypi.org/en/projects/getting-started-with-picamera', 2, 'both'),
  (147, 'GPIO music box', 'Python · 7 steps · needs electronic components, raspberry pi', 'https://projects.raspberrypi.org/en/projects/gpio-music-box', 2, 'both'),
  (148, 'Introduction to Raspberry Pi Pico guide', 'Python · 14 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/introduction-to-the-pico', 2, 'both'),
  (149, 'LEGO® data dashboard', 'Python · 7 steps · needs build hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/lego-data-dash', 2, 'both'),
  (150, 'LEGO® data plotter', 'Python · 8 steps · needs build hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/lego-plotter', 2, 'both'),
  (151, 'LEGO® game controller', 'Python · 8 steps · needs build hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/lego-game-controller', 2, 'both'),
  (152, 'LEGO® remote controlled car', 'Python · 6 steps · needs build hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/lego-robot-car', 2, 'both'),
  (153, 'LEGO® robot face', 'Python · 11 steps · needs build hat, raspberry pi, raspberry pi camera module', 'https://projects.raspberrypi.org/en/projects/lego-robot-face', 2, 'both'),
  (154, 'Mapping data', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/editor-mapping-data', 2, 'both'),
  (155, 'People in space', 'Python · 8 steps · needs raspberry pi, electronic components', 'https://projects.raspberrypi.org/en/projects/people-in-space-indicator', 2, 'both'),
  (156, 'Persuasive data presentation', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/persuasive-data-presentation', 2, 'both'),
  (157, 'Physical Computing with Python', 'Python · 15 steps · needs electronic components, raspberry pi', 'https://projects.raspberrypi.org/en/projects/physical-computing', 2, 'both'),
  (158, 'Powerful patterns', 'Python · 8 steps', 'https://projects.raspberrypi.org/en/projects/editor-powerful-patterns', 2, 'both'),
  (159, 'Python Quick Reaction Game', 'Python · 6 steps · needs electronic components, raspberry pi', 'https://projects.raspberrypi.org/en/projects/python-quick-reaction-game', 2, 'both'),
  (160, 'Python wild - Wiggle the snake', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/python-wild-wiggle-the-snake', 2, 'both'),
  (161, 'Robo-Trumps', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/robo-trumps', 2, 'both'),
  (162, 'Sense HAT music player', 'Python · 7 steps · needs raspberry pi, sense hat', 'https://projects.raspberrypi.org/en/projects/sensehat-scratch-mp3-player', 2, 'both'),
  (163, 'Sense HAT random sparkles', 'Python · 5 steps · needs electronic components, raspberry pi, sense hat', 'https://projects.raspberrypi.org/en/projects/editor-sense-hat-random-sparkles', 2, 'both'),
  (164, 'Solar system', 'Python · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-solar-system-simulator', 2, 'both'),
  (165, 'Teach a computer to read', 'Python · 7 steps', 'https://projects.raspberrypi.org/en/projects/teach-a-computer-to-read', 2, 'both'),
  (166, 'Turtle snowflakes', 'Python · 14 steps', 'https://projects.raspberrypi.org/en/projects/editor-turtle-snowflakes', 2, 'both'),
  (167, 'Where is the Space Station?', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/where-is-the-space-station', 2, 'both'),
  (168, 'Whoopi cushion', 'Python · 7 steps · needs raspberry pi, electronic components', 'https://projects.raspberrypi.org/en/projects/whoopi-cushion', 2, 'both'),
  (169, 'Amazing image identifier', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/amazing-image-identifier', 3, 'secondary'),
  (170, 'Build a line-following robot', 'Python · 7 steps · needs electronic components, raspberry pi', 'https://projects.raspberrypi.org/en/projects/rpi-python-line-following', 3, 'secondary'),
  (171, 'Build a robot buggy', 'Python · 6 steps · needs raspberry pi, electronic components', 'https://projects.raspberrypi.org/en/projects/build-a-buggy', 3, 'secondary'),
  (172, 'Build an OctaPi', 'Python · 12 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/build-an-octapi', 3, 'secondary'),
  (173, 'Calculate the speed of the ISS using photos', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/astropi-iss-speed', 3, 'secondary'),
  (174, 'Capture plant health with NDVI and Raspberry Pi', 'Python · 8 steps · needs raspberry pi, raspberry pi camera module', 'https://projects.raspberrypi.org/en/projects/astropi-ndvi', 3, 'secondary'),
  (175, 'Cats vs dogs', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/cats-vs-dogs', 3, 'secondary'),
  (176, 'CodeCraft', 'Python · 10 steps', 'https://projects.raspberrypi.org/en/projects/codecraft', 3, 'secondary'),
  (177, 'Flappy Astronaut', 'Python · 17 steps · needs sense hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/flappy-astronaut', 3, 'secondary'),
  (178, 'Getting started with the Sense HAT', 'Python · 12 steps · needs sense hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/getting-started-with-the-sense-hat', 3, 'secondary'),
  (179, 'Infrared Bird Box', 'Python · 14 steps · needs electronic components, raspberry pi camera module, raspberry pi', 'https://projects.raspberrypi.org/en/projects/infrared-bird-box', 3, 'secondary'),
  (180, 'Mood indicator', 'Python · 8 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/mood-indicator', 3, 'secondary'),
  (181, 'OctaPi: brute-force Enigma', 'Python · 9 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/octapi-brute-force-enigma', 3, 'secondary'),
  (182, 'OctaPi: public key cryptography', 'Python · 10 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/octapi-public-key-cryptography', 3, 'secondary'),
  (183, 'Popular pets', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/editor-popular-pets', 3, 'secondary'),
  (184, 'Push Button Stop Motion', 'Python · 7 steps · needs electronic components, raspberry pi, raspberry pi camera module', 'https://projects.raspberrypi.org/en/projects/push-button-stop-motion', 3, 'secondary'),
  (185, 'Rock, paper, scissors by hand', 'Python · 6 steps', 'https://projects.raspberrypi.org/en/projects/rock-paper-scissors-by-hand', 3, 'secondary'),
  (186, 'Sense HAT data logger', 'Python · 7 steps · needs sense hat, raspberry pi', 'https://projects.raspberrypi.org/en/projects/sense-hat-data-logger', 3, 'secondary'),
  (187, 'Sensory gadget', 'Python · 6 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/sensory-gadget', 3, 'secondary'),
  (188, 'Sound machine', 'Python · 8 steps · needs raspberry pi pico', 'https://projects.raspberrypi.org/en/projects/sound-machine', 3, 'secondary'),
  (189, 'Testing your computer''s vision', 'Python · 5 steps', 'https://projects.raspberrypi.org/en/projects/testing-your-computers-vision', 3, 'secondary'),
  (190, 'AI-generated images', 'AI and data · 3 steps', 'https://projects.raspberrypi.org/en/projects/ai-image', 1, 'primary'),
  (191, 'Alien language', 'AI and data · 6 steps', 'https://projects.raspberrypi.org/en/projects/alien-language', 1, 'primary'),
  (192, 'Apple vs tomato', 'AI and data · 5 steps', 'https://projects.raspberrypi.org/en/projects/apple-vs-tomato', 1, 'primary'),
  (193, 'Chomp the cheese', 'AI and data · 5 steps', 'https://projects.raspberrypi.org/en/projects/chomp-the-cheese', 1, 'primary'),
  (194, 'Dance detector', 'AI and data · 4 steps · needs microbit', 'https://projects.raspberrypi.org/en/projects/dance-detector', 1, 'primary'),
  (195, 'Dinosaur decision tree', 'AI and data · 5 steps', 'https://projects.raspberrypi.org/en/projects/decision-tree', 1, 'primary'),
  (196, 'Doodle detector', 'AI and data · 7 steps', 'https://projects.raspberrypi.org/en/projects/doodle-detector', 1, 'primary'),
  (197, 'Fish food', 'AI and data · 7 steps', 'https://projects.raspberrypi.org/en/projects/fish-food', 1, 'primary'),
  (198, 'Prompt a large language model', 'AI and data · 3 steps', 'https://projects.raspberrypi.org/en/projects/ai-LLM-prompt', 1, 'primary'),
  (199, 'Prompt an AI image generator', 'AI and data · 2 steps', 'https://projects.raspberrypi.org/en/projects/ai-image-prompt', 1, 'primary'),
  (200, 'Smart assistant', 'AI and data · 7 steps', 'https://projects.raspberrypi.org/en/projects/smart-assistant', 1, 'primary'),
  (201, 'Teach a machine', 'AI and data · 4 steps', 'https://projects.raspberrypi.org/en/projects/teach-a-machine', 1, 'primary'),
  (202, 'This is our Code Club podcast', 'AI and data · 5 steps', 'https://projects.raspberrypi.org/en/projects/your-codeclub-story', 1, 'primary'),
  (203, 'Astro Pi Flight Data Analysis', 'AI and data · 4 steps', 'https://projects.raspberrypi.org/en/projects/astro-pi-flight-data-analysis', 2, 'both'),
  (204, 'Did you like it?', 'AI and data · 7 steps', 'https://projects.raspberrypi.org/en/projects/did-you-like-it', 2, 'both'),
  (205, 'Run an AI image generator on your Raspberry Pi', 'AI and data · 3 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/ai-images-on-pi', 2, 'both'),
  (206, 'Run a large language model on your Raspberry Pi', 'AI and data · 5 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/llm-rpi', 3, 'secondary'),
  (207, 'Anime expressions', 'Web development · 8 steps', 'https://projects.raspberrypi.org/en/projects/anime-expressions', 1, 'primary'),
  (208, 'Bird watch website', 'Web development · 15 steps', 'https://projects.raspberrypi.org/en/projects/editor-cd-sebento-htmlcss-1', 1, 'primary'),
  (209, 'Build a robot', 'Web development · 5 steps', 'https://projects.raspberrypi.org/en/projects/editor-build-a-robot', 1, 'primary'),
  (210, 'Flip treat webcards', 'Web development · 7 steps', 'https://projects.raspberrypi.org/en/projects/flip-treat-webcards', 1, 'primary'),
  (211, 'Happy birthday', 'Web development · 7 steps', 'https://projects.raspberrypi.org/en/projects/editor-happy-birthday', 1, 'primary'),
  (212, 'Magazine', 'Web development · 13 steps', 'https://projects.raspberrypi.org/en/projects/editor-magazine', 1, 'primary'),
  (213, 'Pixel art', 'Web development · 9 steps', 'https://projects.raspberrypi.org/en/projects/pixel-art', 1, 'primary'),
  (214, 'Recipe', 'Web development · 11 steps', 'https://projects.raspberrypi.org/en/projects/editor-recipe', 1, 'primary'),
  (215, 'Sunrise', 'Web development · 7 steps', 'https://projects.raspberrypi.org/en/projects/editor-sunrise', 1, 'primary'),
  (216, 'Tell a story', 'Web development · 5 steps', 'https://projects.raspberrypi.org/en/projects/editor-tell-a-story', 1, 'primary'),
  (217, 'Top 5 emojis', 'Web development · 8 steps', 'https://projects.raspberrypi.org/en/projects/top-5-emoji-list', 1, 'primary'),
  (218, 'Wanted!', 'Web development · 6 steps', 'https://projects.raspberrypi.org/en/projects/editor-wanted', 1, 'primary'),
  (219, 'Animated story', 'Web development · 8 steps', 'https://projects.raspberrypi.org/en/projects/animated-story', 2, 'both'),
  (220, 'Bird watch website 3.0', 'Web development · 15 steps', 'https://projects.raspberrypi.org/en/projects/editor-cd-sebento-htmlcss-3', 2, 'both'),
  (221, 'Build a LAMP Web Server with WordPress', 'Web development · 8 steps · needs raspberry pi', 'https://projects.raspberrypi.org/en/projects/lamp-web-server-with-wordpress', 2, 'both'),
  (222, 'Comic character', 'Web development · 13 steps', 'https://projects.raspberrypi.org/en/projects/editor-comic-character', 2, 'both'),
  (223, 'Mystery Letter', 'Web development · 6 steps', 'https://projects.raspberrypi.org/en/projects/mystery-letter', 2, 'both'),
  (224, 'Pick your favourite', 'Web development · 9 steps', 'https://projects.raspberrypi.org/en/projects/pick-your-favourite', 2, 'both'),
  (225, 'Quiz time!', 'Web development · 9 steps', 'https://projects.raspberrypi.org/en/projects/quiz-time', 2, 'both'),
  (226, 'Share your world', 'Web development · 6 steps', 'https://projects.raspberrypi.org/en/projects/share-your-world', 2, 'both'),
  (227, 'Stickers!', 'Web development · 9 steps', 'https://projects.raspberrypi.org/en/projects/editor-stickers', 2, 'both'),
  (228, 'Talk like a Pirate', 'Web development · 10 steps', 'https://projects.raspberrypi.org/en/projects/talk-like-a-pirate', 2, 'both'),
  (229, 'Bird watch website 2.0', 'Web development · 12 steps', 'https://projects.raspberrypi.org/en/projects/editor-cd-sebento-htmlcss-2', 3, 'secondary'),
  (230, 'Build a webpage', 'Web development · 7 steps', 'https://projects.raspberrypi.org/en/projects/build-a-webpage', 3, 'secondary'),
  (231, 'Mood board', 'Web development · 8 steps', 'https://projects.raspberrypi.org/en/projects/mood-board', 3, 'secondary'),
  (232, 'Sell me something', 'Web development · 8 steps', 'https://projects.raspberrypi.org/en/projects/sell-me-something', 3, 'secondary'),
  (233, 'Welcome to Antarctica', 'Web development · 11 steps', 'https://projects.raspberrypi.org/en/projects/editor-welcome-to-antarctica', 3, 'secondary')
) as v(position, title, description, resource_url, points, level)
where not exists (
  select 1 from public.lessons l where l.title = v.title
);

do $$
declare v_total integer; v_linked integer; v_prim integer; v_sec integer; v_both integer;
begin
  select count(*) into v_total  from public.lessons;
  select count(*) into v_linked from public.lessons where resource_url is not null;
  select count(*) into v_prim   from public.lessons where level = 'primary';
  select count(*) into v_sec    from public.lessons where level = 'secondary';
  select count(*) into v_both   from public.lessons where level = 'both';
  raise notice 'lessons: % (% linked) — primary %, secondary %, both %',
    v_total, v_linked, v_prim, v_sec, v_both;
end $$;
