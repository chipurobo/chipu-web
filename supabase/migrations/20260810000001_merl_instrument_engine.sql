-- ============================================================================
-- MERL phase 2 — versioned instrument engine — 2026-08-10
--
-- Six of the ten MERL documents are questionnaires with the same anatomy:
-- an administration header, sections of typed questions, and a programme-team
-- section the respondent never sees. 08_Endline explicitly reuses the baseline
-- scales ("keep questions and scales aligned with baseline if comparison is
-- intended"), and 04_Indicator_Matrix scores outcomes on *matched* baseline /
-- endline pairs. So this is one engine, not six features.
--
-- Why versioned: every source document is still a blank template carrying a
-- "Version: [insert version]" header, and the Indicator Matrix asks for a
-- "version-control process". Questions WILL change after MERL approval. A
-- version is frozen once responses exist against it, so historical answers
-- keep meaning instead of silently re-pointing at edited wording.
--
-- Why raw answers and no scores: the readiness scoring rule, the missing-data
-- rule and the baseline/endline matching rule are all "[insert]" in the source.
-- Answers are stored with a per-option `score` in the question definition so a
-- rule can be applied later, in a view, without a data migration.
--
-- Administration fields (school, date, consent, assessor) are columns on the
-- response, not questions — they are identical across every instrument and the
-- indicators disaggregate by them.
-- ============================================================================


-- ── 1. Enums ────────────────────────────────────────────────────────────────
do $$ begin
  create type public.instrument_subject as enum ('teacher', 'learner', 'school', 'participant');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.instrument_round as enum ('baseline', 'endline', 'adhoc');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.instrument_version_status as enum ('draft', 'active', 'retired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.response_status as enum ('draft', 'submitted');
exception when duplicate_object then null; end $$;

-- 'scale' covers every rated row in the toolkit — the teacher 1-5 confidence
-- ladder, the learner "Not yet / A little / Yes / Not sure" check-in, the
-- webinar agreement scale and the visit checklist's Yes/Partly/No/N-A — because
-- they differ only in their option list and scores, which live in jsonb.
do $$ begin
  create type public.question_type as enum (
    'scale', 'single_select', 'multi_select', 'short_text', 'long_text',
    'boolean', 'integer', 'date'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.assessor_mode as enum ('self', 'assessor');
exception when duplicate_object then null; end $$;


-- ── 2. Definition tables ────────────────────────────────────────────────────
create table if not exists public.instruments (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  subtitle     text,
  subject_type public.instrument_subject not null,
  description  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.instrument_versions (
  id            uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.instruments(id) on delete cascade,
  version       integer not null,
  status        public.instrument_version_status not null default 'draft',
  notes         text,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (instrument_id, version)
);

create table if not exists public.instrument_sections (
  id          uuid primary key default gen_random_uuid(),
  version_id  uuid not null references public.instrument_versions(id) on delete cascade,
  position    integer not null,
  code        text,                       -- 'A', 'B', … as printed on the form
  title       text not null,
  description text,
  -- "Scoring and Follow-Up (completed by programme team)" / "Programme Team
  -- Use". Never rendered to a self-administering respondent.
  staff_only  boolean not null default false,
  unique (version_id, position)
);

create table if not exists public.instrument_questions (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.instrument_sections(id) on delete cascade,
  position   integer not null,
  code       text,
  prompt     text not null,
  help_text  text,
  qtype      public.question_type not null,
  -- [{value, label, score}] — score is null for opt-outs like "Not sure" or
  -- "Not applicable" so they are excluded from a mean rather than counted zero.
  options    jsonb,
  required   boolean not null default false,
  unique (section_id, position),
  constraint instrument_questions_options_required
    check (qtype not in ('scale', 'single_select', 'multi_select') or options is not null)
);

create index if not exists instrument_versions_instrument_idx on public.instrument_versions (instrument_id);
create index if not exists instrument_sections_version_idx     on public.instrument_sections (version_id, position);
create index if not exists instrument_questions_section_idx    on public.instrument_questions (section_id, position);


-- ── 3. Response tables ──────────────────────────────────────────────────────
create table if not exists public.instrument_responses (
  id            uuid primary key default gen_random_uuid(),
  version_id    uuid not null references public.instrument_versions(id) on delete restrict,
  -- Nullable so an anonymous webinar response ("responses may be anonymous
  -- unless follow-up contact is necessary and agreed") still has a home.
  school_id     uuid references public.schools(id) on delete cascade,
  learner_id    uuid references public.club_members(id) on delete set null,
  teacher_id    uuid references public.profiles(id) on delete set null,
  is_anonymous  boolean not null default false,

  round         public.instrument_round not null default 'adhoc',
  -- 04_Indicator_Matrix scores outcomes on "matched" respondents; this is the
  -- link an endline draws back to its baseline.
  matched_response_id uuid references public.instrument_responses(id) on delete set null,

  -- 03_MERL_Plan §4: approved consent/assent, "particularly for minors".
  consent_confirmed boolean not null default false,
  consent_note      text,

  assessor_mode public.assessor_mode not null default 'assessor',
  status        public.response_status not null default 'draft',
  collected_at  date not null default current_date,
  collected_by  uuid references public.profiles(id) on delete set null,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),

  -- An anonymous response must not carry a subject; a named one must not be
  -- flagged anonymous. Without this the anonymity guarantee is only a habit.
  constraint instrument_responses_anonymous_has_no_subject
    check (not is_anonymous or (learner_id is null and teacher_id is null)),
  constraint instrument_responses_one_subject
    check ((learner_id is not null)::int + (teacher_id is not null)::int <= 1)
);

create table if not exists public.instrument_answers (
  id            uuid primary key default gen_random_uuid(),
  response_id   uuid not null references public.instrument_responses(id) on delete cascade,
  question_id   uuid not null references public.instrument_questions(id) on delete cascade,
  value_number  numeric,
  value_text    text,
  value_bool    boolean,
  value_options text[],
  created_at    timestamptz not null default now(),
  unique (response_id, question_id)
);

create index if not exists instrument_responses_school_idx  on public.instrument_responses (school_id, collected_at desc);
create index if not exists instrument_responses_version_idx on public.instrument_responses (version_id);
create index if not exists instrument_responses_matched_idx on public.instrument_responses (matched_response_id);
create index if not exists instrument_answers_response_idx  on public.instrument_answers (response_id);


-- ── 4. RLS ──────────────────────────────────────────────────────────────────
alter table public.instruments          enable row level security;
alter table public.instrument_versions  enable row level security;
alter table public.instrument_sections  enable row level security;
alter table public.instrument_questions enable row level security;
alter table public.instrument_responses enable row level security;
alter table public.instrument_answers   enable row level security;

-- Definitions are readable by any signed-in user (a school lead must render
-- the form) but only admins author them.
drop policy if exists instruments_read on public.instruments;
create policy instruments_read on public.instruments for select to authenticated using (true);
drop policy if exists instruments_admin on public.instruments;
create policy instruments_admin on public.instruments for all to authenticated
  using (public.auth_is_admin()) with check (public.auth_is_admin());

drop policy if exists instrument_versions_read on public.instrument_versions;
create policy instrument_versions_read on public.instrument_versions for select to authenticated using (true);
drop policy if exists instrument_versions_admin on public.instrument_versions;
create policy instrument_versions_admin on public.instrument_versions for all to authenticated
  using (public.auth_is_admin()) with check (public.auth_is_admin());

drop policy if exists instrument_sections_read on public.instrument_sections;
create policy instrument_sections_read on public.instrument_sections for select to authenticated using (true);
drop policy if exists instrument_sections_admin on public.instrument_sections;
create policy instrument_sections_admin on public.instrument_sections for all to authenticated
  using (public.auth_is_admin()) with check (public.auth_is_admin());

drop policy if exists instrument_questions_read on public.instrument_questions;
create policy instrument_questions_read on public.instrument_questions for select to authenticated using (true);
drop policy if exists instrument_questions_admin on public.instrument_questions;
create policy instrument_questions_admin on public.instrument_questions for all to authenticated
  using (public.auth_is_admin()) with check (public.auth_is_admin());

-- Responses are school-scoped. Anonymous responses have no school, so only
-- admins can read them back — which is the point of collecting them anonymously.
drop policy if exists instrument_responses_select on public.instrument_responses;
create policy instrument_responses_select on public.instrument_responses for select to authenticated
  using (public.auth_is_admin() or (school_id is not null and school_id = public.auth_school_id()));

drop policy if exists instrument_responses_insert on public.instrument_responses;
create policy instrument_responses_insert on public.instrument_responses for insert to authenticated
  with check (public.auth_is_admin() or (school_id is not null and school_id = public.auth_school_id()));

drop policy if exists instrument_responses_update on public.instrument_responses;
create policy instrument_responses_update on public.instrument_responses for update to authenticated
  using      (public.auth_is_admin() or (school_id is not null and school_id = public.auth_school_id()))
  with check (public.auth_is_admin() or (school_id is not null and school_id = public.auth_school_id()));

drop policy if exists instrument_responses_delete on public.instrument_responses;
create policy instrument_responses_delete on public.instrument_responses for delete to authenticated
  using (public.auth_is_admin() or (school_id is not null and school_id = public.auth_school_id()));

drop policy if exists instrument_answers_all on public.instrument_answers;
create policy instrument_answers_all on public.instrument_answers for all to authenticated
  using (exists (
    select 1 from public.instrument_responses r
     where r.id = instrument_answers.response_id
       and (public.auth_is_admin() or (r.school_id is not null and r.school_id = public.auth_school_id()))
  ))
  with check (exists (
    select 1 from public.instrument_responses r
     where r.id = instrument_answers.response_id
       and (public.auth_is_admin() or (r.school_id is not null and r.school_id = public.auth_school_id()))
  ));


-- ── 5. Grants ───────────────────────────────────────────────────────────────
grant select                         on public.instruments          to authenticated, service_role;
grant select                         on public.instrument_versions  to authenticated, service_role;
grant select                         on public.instrument_sections  to authenticated, service_role;
grant select                         on public.instrument_questions to authenticated, service_role;
grant insert, update, delete         on public.instruments          to authenticated, service_role;
grant insert, update, delete         on public.instrument_versions  to authenticated, service_role;
grant insert, update, delete         on public.instrument_sections  to authenticated, service_role;
grant insert, update, delete         on public.instrument_questions to authenticated, service_role;
grant select, insert, update, delete on public.instrument_responses to authenticated, service_role;
grant select, insert, update, delete on public.instrument_answers   to authenticated, service_role;


-- ── 6. Seed helper ──────────────────────────────────────────────────────────
-- Temporary; dropped at the end of the phase 3 migration once seeding is done.
create or replace function public._merl_seed_question(
  p_section  uuid,
  p_pos      integer,
  p_code     text,
  p_prompt   text,
  p_type     public.question_type,
  p_options  jsonb   default null,
  p_required boolean default false,
  p_help     text    default null
) returns void
language sql
as $$
  insert into public.instrument_questions
    (section_id, position, code, prompt, qtype, options, required, help_text)
  values (p_section, p_pos, p_code, p_prompt, p_type, p_options, p_required, p_help)
  on conflict (section_id, position) do nothing;
$$;

create or replace function public._merl_seed_section(
  p_version uuid, p_pos integer, p_code text, p_title text,
  p_staff_only boolean default false, p_description text default null
) returns uuid
language plpgsql
as $$
declare v_id uuid;
begin
  insert into public.instrument_sections (version_id, position, code, title, staff_only, description)
  values (p_version, p_pos, p_code, p_title, p_staff_only, p_description)
  on conflict (version_id, position) do nothing;
  select id into v_id from public.instrument_sections where version_id = p_version and position = p_pos;
  return v_id;
end;
$$;

create or replace function public._merl_seed_instrument(
  p_slug text, p_title text, p_subject public.instrument_subject,
  p_subtitle text, p_notes text
) returns uuid
language plpgsql
as $$
declare v_instrument uuid; v_version uuid;
begin
  insert into public.instruments (slug, title, subtitle, subject_type)
  values (p_slug, p_title, p_subtitle, p_subject)
  on conflict (slug) do nothing;
  select id into v_instrument from public.instruments where slug = p_slug;

  insert into public.instrument_versions (instrument_id, version, status, notes, published_at)
  values (v_instrument, 1, 'active', p_notes, now())
  on conflict (instrument_id, version) do nothing;
  select id into v_version from public.instrument_versions
   where instrument_id = v_instrument and version = 1;

  return v_version;
end;
$$;


-- ── 7. Shared option sets ───────────────────────────────────────────────────
-- Held as constants in the seed blocks below rather than a lookup table: the
-- option list is part of the frozen version, so copying it is correct — a later
-- version that changes the wording must not retroactively alter old answers.


-- ── 8. Teacher baseline (05_Teacher_Baseline_Assessment) ────────────────────
do $$
declare v_version uuid; s uuid;
  k_conf jsonb := '[
    {"value":"1","label":"Not yet confident","score":1},
    {"value":"2","label":"Slightly confident","score":2},
    {"value":"3","label":"Somewhat confident","score":3},
    {"value":"4","label":"Confident","score":4},
    {"value":"5","label":"Very confident","score":5},
    {"value":"na","label":"Not applicable","score":null}
  ]'::jsonb;
begin
  v_version := public._merl_seed_instrument(
    'teacher-baseline', 'Teacher Baseline Assessment', 'teacher',
    'Inclusive Code Clubs and Robotics Programme',
    'Seeded from 05_Teacher_Baseline_Assessment.docx');

  s := public._merl_seed_section(v_version, 1, 'A', 'Administration Details', false,
       'School, date, consent and assessor mode are recorded on the response itself.');
  perform public._merl_seed_question(s, 1, 'A1', 'Role / subject area', 'short_text');

  s := public._merl_seed_section(v_version, 2, 'B', 'Current Experience');
  perform public._merl_seed_question(s, 1, 'B1',
    'Have you previously facilitated a Code Club, coding, digital making or robotics activity?',
    'single_select',
    '[{"value":"yes","label":"Yes"},{"value":"no","label":"No"},{"value":"prefer_not","label":"Prefer not to say"}]'::jsonb);
  perform public._merl_seed_question(s, 2, 'B2', 'What support or learning have you previously received that is relevant to this role?', 'long_text');
  perform public._merl_seed_question(s, 3, 'B3', 'What are your main hopes for participating in this programme?', 'long_text');
  perform public._merl_seed_question(s, 4, 'B4', 'What barriers might affect your ability to facilitate a regular club?', 'long_text');
  perform public._merl_seed_question(s, 5, 'B5', 'What support or accommodation would help you facilitate inclusively?', 'long_text');

  s := public._merl_seed_section(v_version, 3, 'C', 'Facilitation Readiness Self-Assessment', false,
       '1 = Not yet confident, 5 = Very confident. These six statements are the scored readiness items.');
  perform public._merl_seed_question(s, 1, 'C1', 'I can plan a learner-centred Code Club session.', 'scale', k_conf, true);
  perform public._merl_seed_question(s, 2, 'C2', 'I can support learners with different prior experience.', 'scale', k_conf, true);
  perform public._merl_seed_question(s, 3, 'C3', 'I can facilitate collaborative problem-solving.', 'scale', k_conf, true);
  perform public._merl_seed_question(s, 4, 'C4', 'I can support learners to use coding, digital-making or robotics resources safely.', 'scale', k_conf, true);
  perform public._merl_seed_question(s, 5, 'C5', 'I can make reasonable adjustments to support inclusion.', 'scale', k_conf, true);
  perform public._merl_seed_question(s, 6, 'C6', 'I know where to seek support when I am unsure.', 'scale', k_conf, true);

  s := public._merl_seed_section(v_version, 4, 'D', 'Baseline Reflection');
  perform public._merl_seed_question(s, 1, 'D1', 'What would success look like for you by the end of the programme?', 'long_text');
  perform public._merl_seed_question(s, 2, 'D2', 'What one area would you most like support with first?', 'long_text');
  perform public._merl_seed_question(s, 3, 'D3', 'Additional comments', 'long_text');

  s := public._merl_seed_section(v_version, 5, 'E', 'Scoring and Follow-Up', true,
       'Completed by the programme team. The readiness score rule is not yet approved, so the score is recorded manually for now.');
  perform public._merl_seed_question(s, 1, 'E1', 'Baseline score', 'integer');
  perform public._merl_seed_question(s, 2, 'E2', 'Priority support need(s)', 'long_text');
end $$;


-- ── 9. Learner baseline (06_Learner_Baseline_Assessment) ────────────────────
do $$
declare v_version uuid; s uuid;
  k_ican jsonb := '[
    {"value":"not_yet","label":"Not yet","score":1},
    {"value":"a_little","label":"A little","score":2},
    {"value":"yes","label":"Yes","score":3},
    {"value":"not_sure","label":"Not sure","score":null}
  ]'::jsonb;
begin
  v_version := public._merl_seed_instrument(
    'learner-baseline', 'Learner Baseline Assessment', 'learner',
    'Age-appropriate, inclusive learner tool',
    'Seeded from 06_Learner_Baseline_Assessment.docx');

  s := public._merl_seed_section(v_version, 1, 'A', 'Administration Details', false,
       'Administer in an age-appropriate, accessible format. Parent/guardian consent and learner assent are recorded on the response.');
  -- Age group is a question rather than a column on club_members: the Indicator
  -- Matrix allows this disaggregation only "if appropriate/approved", and
  -- adding a demographic column to a child's record needs sign-off first.
  perform public._merl_seed_question(s, 1, 'A1', 'Age group / class (as approved)', 'short_text');

  s := public._merl_seed_section(v_version, 2, 'B', 'My Experience', false,
       'The facilitator may use words, symbols or another accessible response method.');
  perform public._merl_seed_question(s, 1, 'B1', 'Before today, have you taken part in coding, digital making or robotics?', 'single_select',
    '[{"value":"yes","label":"Yes"},{"value":"no","label":"No"},{"value":"not_sure","label":"Not sure"}]'::jsonb);
  perform public._merl_seed_question(s, 2, 'B2', 'How do you feel about trying new activities that use technology or making?', 'single_select',
    '[{"value":"not_comfortable","label":"Not comfortable yet","score":1},
      {"value":"a_little","label":"A little comfortable","score":2},
      {"value":"comfortable","label":"Comfortable","score":3},
      {"value":"very","label":"Very comfortable","score":4}]'::jsonb);
  perform public._merl_seed_question(s, 3, 'B3', 'When an activity is difficult, what do you usually do?', 'single_select',
    '[{"value":"ask","label":"Ask for help"},{"value":"keep_trying","label":"Keep trying"},
      {"value":"with_others","label":"Work with others"},{"value":"other","label":"Something else"}]'::jsonb);
  perform public._merl_seed_question(s, 4, 'B4', 'What would help you take part comfortably in a Code Club?', 'long_text');

  s := public._merl_seed_section(v_version, 3, 'C', 'I Can Check-In', false,
       'The scored learner items. "Not sure" is not scored so it cannot drag a mean downwards.');
  perform public._merl_seed_question(s, 1, 'C1', 'I can try a new coding, making or robotics activity.', 'scale', k_ican, true);
  perform public._merl_seed_question(s, 2, 'C2', 'I can work with other learners on a challenge.', 'scale', k_ican, true);
  perform public._merl_seed_question(s, 3, 'C3', 'I can share an idea or ask a question.', 'scale', k_ican, true);
  perform public._merl_seed_question(s, 4, 'C4', 'I can keep trying when something does not work at first.', 'scale', k_ican, true);
  perform public._merl_seed_question(s, 5, 'C5', 'I can use help or an adjustment that makes participation easier.', 'scale', k_ican, true);

  s := public._merl_seed_section(v_version, 4, 'D', 'Learner Voice');
  perform public._merl_seed_question(s, 1, 'D1', 'What would you like to learn or make?', 'long_text');
  perform public._merl_seed_question(s, 2, 'D2', 'Is there anything the facilitator should know to help you take part? (Optional)', 'long_text');
  perform public._merl_seed_question(s, 3, 'D3', 'Anything else you would like to share?', 'long_text');

  s := public._merl_seed_section(v_version, 5, 'E', 'Facilitator Notes', true,
       'Record only relevant participation support needs and agreed accommodations. Do not record diagnoses or sensitive details.');
  perform public._merl_seed_question(s, 1, 'E1', 'Observation / agreed support', 'long_text');
end $$;


-- ── 10. School baseline (07_School_Baseline_Assessment) ─────────────────────
do $$
declare v_version uuid; s uuid; i integer;
  domains text[] := array[
    'Leadership and focal-person support',
    'Space and timetable for weekly club',
    'Teacher availability and support needs',
    'Learner recruitment and participation approach',
    'Accessibility and reasonable accommodations',
    'Safeguarding and child-protection arrangements',
    'Materials, storage and power/connectivity (where relevant)',
    'Data collection, consent and communication process'
  ];
begin
  v_version := public._merl_seed_instrument(
    'school-baseline', 'School Baseline Assessment', 'school',
    'School readiness and inclusion profile',
    'Seeded from 07_School_Baseline_Assessment.docx');

  s := public._merl_seed_section(v_version, 1, 'A', 'School Profile');
  perform public._merl_seed_question(s, 1, 'A1', 'School focal person / contact', 'short_text');
  perform public._merl_seed_question(s, 2, 'A2', 'Existing Code Club, coding or robotics activity', 'long_text');
  perform public._merl_seed_question(s, 3, 'A3', 'Agreed programme period', 'short_text');

  -- Section B is a matrix: each readiness domain carries a current position and
  -- the support needed. The "Owner / date" column becomes a programme action
  -- (phase 3) rather than free text, so it can be tracked to closure.
  s := public._merl_seed_section(v_version, 2, 'B', 'Readiness and Access Review', false,
       'Record evidence and agreed actions rather than assumptions. Owner and due date are captured as programme actions.');
  for i in 1 .. array_length(domains, 1) loop
    perform public._merl_seed_question(s, (i * 2) - 1, 'B' || i || 'a',
      domains[i] || ' — current position / evidence', 'long_text');
    perform public._merl_seed_question(s, i * 2, 'B' || i || 'b',
      domains[i] || ' — support or action needed', 'long_text');
  end loop;

  s := public._merl_seed_section(v_version, 3, 'C', 'School Priorities');
  perform public._merl_seed_question(s, 1, 'C1', 'What does the school want the programme to support?', 'long_text');
  perform public._merl_seed_question(s, 2, 'C2', 'What barriers could affect regular participation?', 'long_text');
  perform public._merl_seed_question(s, 3, 'C3', 'What existing strengths can the programme build on?', 'long_text');
  perform public._merl_seed_question(s, 4, 'C4', 'How will the school support continuity if a facilitator is absent or changes role?', 'long_text');
end $$;


-- ── 11. Endline (08_Endline_Assessment) ─────────────────────────────────────
do $$
declare v_version uuid; s uuid;
  k_compare jsonb := '[
    {"value":"lower","label":"Lower","score":-1},
    {"value":"same","label":"Same","score":0},
    {"value":"higher","label":"Higher","score":1},
    {"value":"not_comparable","label":"Not comparable","score":null}
  ]'::jsonb;
begin
  -- Subject is 'participant': the same instrument is used with teachers,
  -- learners or a school representative, chosen per response.
  v_version := public._merl_seed_instrument(
    'endline', 'Endline Assessment', 'participant',
    'Programme close-out and reflection tool',
    'Seeded from 08_Endline_Assessment.docx. Pair with the matching baseline via matched_response_id.');

  s := public._merl_seed_section(v_version, 1, 'B', 'Participation Summary');
  perform public._merl_seed_question(s, 1, 'B1', 'Which programme activities did you take part in or support?', 'multi_select',
    '[{"value":"teacher_training","label":"Teacher training"},{"value":"weekly_clubs","label":"Weekly Code Clubs"},
      {"value":"bootcamp","label":"Holiday bootcamp"},{"value":"hackathon","label":"Hackathon"},
      {"value":"webinar","label":"Webinar"},{"value":"ksef","label":"KSEF Track 14 pathway"},
      {"value":"showcase","label":"National showcase"},{"value":"other","label":"Other"}]'::jsonb);
  perform public._merl_seed_question(s, 2, 'B2', 'How regularly were you able to participate / support?', 'single_select',
    '[{"value":"regularly","label":"Regularly","score":3},{"value":"sometimes","label":"Sometimes","score":2},
      {"value":"rarely","label":"Rarely","score":1},{"value":"na","label":"Not applicable","score":null}]'::jsonb);
  perform public._merl_seed_question(s, 3, 'B3', 'What made participation easier?', 'long_text');
  perform public._merl_seed_question(s, 4, 'B4', 'What made participation difficult?', 'long_text');

  s := public._merl_seed_section(v_version, 2, 'C', 'Change and Experience', false,
       'Use the response scale that matches the baseline tool. The comparison field is only meaningful on a matched response.');
  perform public._merl_seed_question(s, 1, 'C1a', 'Confidence / readiness to participate or facilitate — endline response / evidence', 'long_text');
  perform public._merl_seed_question(s, 2, 'C1b', 'Confidence / readiness — compared with baseline', 'scale', k_compare);
  perform public._merl_seed_question(s, 3, 'C2a', 'Ability to work on coding, making or robotics activity — endline response / evidence', 'long_text');
  perform public._merl_seed_question(s, 4, 'C2b', 'Ability to work on coding, making or robotics — compared with baseline', 'scale', k_compare);
  perform public._merl_seed_question(s, 5, 'C3a', 'Ability to seek/provide support and participate inclusively — endline response / evidence', 'long_text');
  perform public._merl_seed_question(s, 6, 'C3b', 'Ability to seek/provide support inclusively — compared with baseline', 'scale', k_compare);
  perform public._merl_seed_question(s, 7, 'C4a', 'Continuity of Code Club delivery / participation — endline response / evidence', 'long_text');
  perform public._merl_seed_question(s, 8, 'C4b', 'Continuity of delivery / participation — compared with baseline', 'scale', k_compare);

  s := public._merl_seed_section(v_version, 3, 'D', 'Outcomes, Learning and Next Steps');
  perform public._merl_seed_question(s, 1, 'D1', 'What is the most meaningful change you noticed?', 'long_text');
  perform public._merl_seed_question(s, 2, 'D2', 'What activity or support was most useful, and why?', 'long_text');
  perform public._merl_seed_question(s, 3, 'D3', 'What should be improved in a future cycle?', 'long_text');
  perform public._merl_seed_question(s, 4, 'D4', 'What should happen next to sustain inclusive Code Club or robotics learning?', 'long_text');

  s := public._merl_seed_section(v_version, 4, 'E', 'Programme Team Use', true);
  perform public._merl_seed_question(s, 1, 'E1', 'Comparison / scoring rule used', 'long_text');
  perform public._merl_seed_question(s, 2, 'E2', 'Key evidence source(s)', 'long_text');
  perform public._merl_seed_question(s, 3, 'E3', 'Follow-up or referral needed', 'long_text');
end $$;
