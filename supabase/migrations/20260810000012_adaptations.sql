-- ============================================================================
-- Record WHICH adaptation was used, not just that support happened — 2026-08-10
--
-- The Theory of Change is about learners with hearing and visual impairments.
-- "Adapt and label robotics kits" is a core Activity and "adapted kits and
-- printed parts in use" is a named Output. Yet the only things the dashboard
-- recorded were:
--
--   club_members.has_disability      a boolean
--   club_members.disability_notes    free text the MERL Plan says must not
--                                    carry diagnoses
--   sessions.inclusion_supports      free text
--   session_attendance.support_note  free text
--
-- So the one thing that makes ChipuRobo distinctive could not be counted. An
-- evaluator asking "show me adapted delivery" would be handed prose.
--
-- This adds a controlled vocabulary and a join, so adapted delivery becomes a
-- number. It deliberately describes the ADAPTATION, never the learner's
-- condition — recording that braille materials were used says what the
-- programme did; it does not put a diagnosis in the database, which is exactly
-- the line 03_MERL_Plan §4 draws.
--
-- The free-text fields stay. A vocabulary cannot anticipate everything, and
-- "other" plus a note is better than forcing a wrong category.
-- ============================================================================

-- ── 1. The vocabulary ───────────────────────────────────────────────────────
create table if not exists public.adaptation_types (
  code        text primary key,
  label       text not null,
  description text,
  -- Which impairment the adaptation primarily serves. 'any' covers adaptations
  -- that are not specific to one, like extra time.
  serves      text not null default 'any'
    check (serves in ('hearing', 'visual', 'any')),
  position    integer not null default 0,
  is_active   boolean not null default true
);

insert into public.adaptation_types (code, label, description, serves, position) values
  ('ksl_interpretation', 'KSL interpretation',
   'Kenyan Sign Language interpretation during the session.', 'hearing', 1),
  ('captioned_material', 'Captioned or written material',
   'Written or captioned instructions in place of spoken delivery.', 'hearing', 2),
  ('visual_demonstration', 'Visual demonstration',
   'Concepts shown physically rather than explained aloud.', 'hearing', 3),
  ('braille_material', 'Braille material',
   'Worksheets or labels produced in braille.', 'visual', 4),
  ('tactile_material', 'Tactile material or labelling',
   'Raised, textured or 3D-printed labels and parts a learner can identify by touch.', 'visual', 5),
  ('audio_description', 'Audio description',
   'Spoken description of what is on screen or on the bench.', 'visual', 6),
  ('screen_reader', 'Screen reader',
   'Learner works through a screen reader.', 'visual', 7),
  ('large_print', 'Large print or high contrast',
   'Enlarged or high-contrast material for low vision.', 'visual', 8),
  ('adapted_kit', 'Adapted robotics kit',
   'A kit adapted or labelled for this learner group — the Activity the ToC calls out.', 'any', 9),
  ('peer_support', 'Peer or paired working',
   'Learners paired so they support each other through a task.', 'any', 10),
  ('extra_time', 'Extra time',
   'Additional time to complete the activity.', 'any', 11),
  ('other', 'Other',
   'Anything the vocabulary does not cover. Describe it in the session notes.', 'any', 99)
on conflict (code) do nothing;

alter table public.adaptation_types enable row level security;

drop policy if exists adaptation_types_read on public.adaptation_types;
create policy adaptation_types_read on public.adaptation_types for select to authenticated
  using (is_active or public.me_is_admin());

drop policy if exists adaptation_types_admin on public.adaptation_types;
create policy adaptation_types_admin on public.adaptation_types for all to authenticated
  using (public.me_is_admin()) with check (public.me_is_admin());

grant select                 on public.adaptation_types to authenticated, service_role;
grant insert, update, delete on public.adaptation_types to authenticated, service_role;


-- ── 2. Which adaptations a session actually used ────────────────────────────
create table if not exists public.session_adaptations (
  session_id      uuid not null references public.sessions(id) on delete cascade,
  adaptation_code text not null references public.adaptation_types(code) on delete restrict,
  -- How many learners it was used for, where the facilitator knows. Null means
  -- "used in this session" without a count, which is still worth recording.
  learner_count   integer check (learner_count is null or learner_count >= 0),
  created_at      timestamptz not null default now(),
  primary key (session_id, adaptation_code)
);

create index if not exists session_adaptations_code_idx
  on public.session_adaptations (adaptation_code);

alter table public.session_adaptations enable row level security;

-- Scope inherited from the parent session, so a school lead can never tag
-- another school's session.
drop policy if exists session_adaptations_select on public.session_adaptations;
create policy session_adaptations_select on public.session_adaptations for select to authenticated
  using (exists (select 1 from public.sessions s
                  where s.id = session_adaptations.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())));

drop policy if exists session_adaptations_write on public.session_adaptations;
create policy session_adaptations_write on public.session_adaptations for all to authenticated
  using (exists (select 1 from public.sessions s
                  where s.id = session_adaptations.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())))
  with check (exists (select 1 from public.sessions s
                  where s.id = session_adaptations.session_id
                    and (s.school_id = public.me_school_id() or public.me_is_admin())));

grant select, insert, update, delete on public.session_adaptations to authenticated, service_role;


-- ── 3. Adapted kits in use ──────────────────────────────────────────────────
-- "Adapted kits and printed parts in use" is a named Output. A product can now
-- declare that it is an adapted variant and how, so the count comes off the
-- catalogue rather than out of somebody's memory.
alter table public.products
  add column if not exists adaptation_code text
    references public.adaptation_types(code) on delete set null;

comment on column public.products.adaptation_code is
  'Set when this product is an adapted variant — a braille-labelled kit, a '
  'tactile printed part. Null for standard items. Lets "adapted kits in use" '
  'be counted from the catalogue and the stock ledger.';


-- ── 4. Report ───────────────────────────────────────────────────────────────
do $$
declare v_types integer;
begin
  select count(*) into v_types from public.adaptation_types;
  raise notice 'adaptation vocabulary: % entries', v_types;
end $$;
