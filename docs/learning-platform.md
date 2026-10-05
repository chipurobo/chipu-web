# ChipuRobo learning platform implementation

The product specification calls for a platform used directly by teachers and
learners. Learning actions belong in the authenticated dashboard, alongside
the existing lesson planning and student workflows. Its competency
catalogue is a versioned draft, ready to be reconciled with the full current
KICD Grade 10 design before it is used to award levels.

## Curriculum basis and review status

Grade 10 is the common curriculum reference for all participating learners,
including younger learners, as requested. Beginner, Intermediate and Expert
describe ChipuRobo learning stages; they are not school grades or KICD
assessment ratings. Existing primary and secondary delivery tracks remain
separate from these stages.

KICD's [official Grade 10 listing](https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-ten/)
links to [Computer Studies Grade 10 July 2025](https://drive.google.com/file/d/1e5lBROYbbw6JeVCduFMCkWh1MbluV5M8/view).
The hosted file restricts downloading. Its full outcomes and assessment rubric
could not be verified in this session. Do not describe the current mapping as
an approved KICD rubric or as coverage of the full syllabus.

The accessible indexed material for the earlier official
[Computer Science Grade 10 June 2024 reference](https://kicd.ac.ke/wp-content/uploads/2024/07/Computer-Science-Grade-10-June-2024.pdf)
supports the strand outline and selected outcomes from program development
(3.2, printed page 32) and identifiers and operators (3.3, printed page 34).
The original PDF URL currently does not return a PDF. Source scope and the
verification limitation are retained in the catalogue and visible in the UI.

The draft adapts algorithm planning, input/output programming and testing into
practical activities. References to control structures and functions currently
come from the indexed outline; verify their detailed outcomes in the current
design before finalising the corresponding level descriptors. Physical
computing, project design and communication activities are labelled ChipuRobo
extensions, not additional official KICD outcomes.

The review conversation uses four proposed descriptions: not yet observed,
developing, demonstrated and extending. These are not the official KICD rubric.
Replace or reconcile them after reading the current rubric. Teacher observations
are stored against individual evidence; they do not award an overall level.

## Implemented dashboard actions

- Admin → Lessons → New lesson: use an activity template or write a lesson;
  select a pathway, Beginner/Intermediate/Expert learning level, competency
  outcomes, activity steps and expected evidence. Delivery tracks remain separate.
- Admin → Lessons → Set learning outcomes / Edit learning plan: save the same
  plan on an existing lesson. Changing a plan does not rewrite prior assignments.
- Teacher / School → Lessons → Assign lesson: select active roster students, add class
  instructions and an optional due date, then save a real assignment.
- Open lesson → Review assignment: see the assigned task and record each
  student's evidence, competency review and feedback. Reviews are append-only;
  previous observations remain in Review history. Teachers can review actual
  learner submissions or record evidence observed during an activity.
- Learner → My learning: open assigned lessons in the embedded Blockly workspace,
  build and run programs, save blocks to resume later, and submit the program with
  described work or code,
  an optional evidence link and reflection, then return to see teacher feedback.
  Resubmissions preserve earlier work. Learners cannot rate their own competence.
- Learner → My learning → Blockly lessons: start any of the 20 published exercises
  (8 Beginner, 7 Intermediate, 5 Expert), or continue work already started.
  Starting a lesson creates a private individual assignment atomically; repeated
  starts return the existing assignment. Teachers can also assign the lessons.
- Learner → Capstone projects: choose a routine guide, classroom supplies planner
  or simulated obstacle controller. Each has a project brief, expected behaviour
  and completion criteria, and uses the same Blockly workspace and submission
  pipeline. Teacher review decides whether the evidence meets the brief; clicking
  Submit does not certify completion or award a competency.
- Teacher → Review assignment → View submitted Blockly program: open the exact
  submitted blocks, generated JavaScript and last output alongside the learner's
  explanation. Later draft edits cannot rewrite the submitted program.
- Teacher / School → Learner progress; Learner → My progress: see the latest observed rating for each competency
  at each level, with links to its evidence. A newer developing observation
  replaces an older demonstrated observation in the display, without deleting
  history. Unobserved outcomes stay unassessed. No overall level is awarded.
- Admin → Learning accounts: create teacher email logins and learner username
  logins linked to active school roster records. Allocate each teacher's learners
  and update teaching groups. A learner does not need a personal email address.

Blockly 13 provides the embedded block editor and keyboard navigation. Beginner
toolboxes include output, text, numbers, decisions, repetition and variables;
Intermediate adds more loops and lists; Expert adds functions. Instructions and
feedback stay in the dashboard. JSON workspace serialization preserves editable
blocks. Run executes generated JavaScript in a dedicated JS-Interpreter worker
without browser, network, storage or authentication APIs, with step, output and
wall-time limits. The output is learner-supplied evidence, not proof of competency.
The current runner supports browser exercises; Raspberry Pi and physical robot
deployment remain a separate integration.

See [Blockly serialization](https://docs.blockly.com/guides/configure/serialization/),
[JavaScript execution](https://docs.blockly.com/guides/app-integration/running-javascript/)
and [keyboard navigation](https://docs.blockly.com/guides/configure/keyboard-nav/).
Bundled media in `public/blockly-media/` is copied from Blockly 13.3.0, with its
license; update it when upgrading the package.

The login form offers Teacher, Learner and Admin. These choices validate the
actual account role; they do not change permissions. Existing school leads sign
in through Teacher and retain school operations. New teachers receive learning
actions only; learners receive their own assignments, submissions and progress.
Account hydration completes before navigating from login to the dashboard.

There is no public `/learning` page or standalone `/dashboard/pathways` library.
The ten activity briefs are templates used in the lesson-creation action. There
is no persona switch that grants learner permissions.

Apply the seven migrations `20261005000000_dashboard_learning_actions.sql`,
`20261005000001_learning_account_roles.sql` and
`20261005000002_learning_accounts_and_submissions.sql` and
`20261005000003_blockly_learning_programs.sql`,
`20261005000004_blockly_lesson_course.sql` and
`20261005000005_blockly_capstone_projects.sql` and
`20261005000006_require_blockly_submissions.sql` before using these actions.
The enum extension is a separate migration so its new values are committed before
the policies and RPCs use them. The preview on port 55000 uses local Supabase. Reads and writes
report backend errors; they never fall back to fabricated/local records.
All seven migrations were applied to local Supabase and the linked hosted
development project on 2026-10-05. Preview accounts and example learner work
were created only in the local database; hosted account creation remains an
explicit action in Admin → Learning accounts.

The assignment RPC validates school access, active distinct recipients and a
saved plan, then creates assignment and recipients in one transaction. Evidence
review requires an assigned individual, described evidence, feedback and valid
competencies from the assignment snapshot. Anonymous access and direct writes
to assignment/evidence tables are denied. Teacher assignments require allocated
learners. Learner submission RPCs derive the student from the authenticated
identity; the client cannot choose another student. Reviews retain a link to
the submission they evaluated. New roles cannot inherit school-wide operations
through the legacy `me_school_id()` policies. Safe learning RPCs expose only
school labels and the permitted learner roster fields.
The published lesson and capstone content is also kept in
`supabase/learning/blockly-lessons.json` and `blockly-capstones.json`. Tests compare
published lesson content with that source. These are original ChipuRobo exercises
using the draft competency mapping, not approved KICD lesson content. Do not edit
applied migrations to update content; create a new migration and retain snapshots.
Teachers can read and review self-started work only for their allocated learners.
The database requires a Blockly program on submission for the published lessons
and capstones; a direct RPC call containing only text cannot bypass that requirement.

## Next implementation stages

1. Finalise the source mapping. Read the full current KICD design, reconcile
   every selected outcome and rubric, and agree progression rules. Approve a
   new immutable framework version; retain historical versions for evidence.
2. Extend account administration with password recovery for learners without
   email, shared-device onboarding and account lifecycle controls.
3. Extend the current individual lesson assignments with group work. Every group
   submission must identify individual contributions; group membership alone
   must not award a competency.
4. Add accessible quizzes with versioned questions, attempts and results.
   Keep formal
   programme baseline/midline/endline instruments in the wider M&E system.
5. Add agreed progression decisions backed by reviewed evidence and learner
   portfolios. The current progress view shows observations. Completion,
   confidence, independence and competency are
   separate facts. A level filter or leaderboard score cannot award a level.
6. Add pilot reporting with defined cohorts, denominators and time windows.
   Capture activation, resource use, learning activity, reviewed artifacts,
   progression and retention as first-party product events.

The current database policies enforce learning access for each role:
learners see their own assigned work and evidence; teachers see learners in
their assigned classes; school leads administer their own school; admins have
the explicitly required network access. Test cross-school and within-school
isolation at the database boundary. Learner identities, records and evidence
remain within the authenticated dashboard.

## Accessibility acceptance and validation

Native selects, checkboxes, links and disclosures support keyboard use. The
closed mobile dashboard drawer is hidden from keyboard and screen-reader
navigation; Escape restores focus to its trigger. Activity instructions include
alternative evidence formats and distinguish access accommodations from help
with the learning task.

Run `npm run test:learning` for framework integrity and real PostgreSQL execution
of the new migration, including RPC validation and cross-school RLS tests.
PGlite tests use minimal existing-table fixtures; they do not validate the full
historical Supabase migration chain. Run `npx playwright install chromium`,
then `npm run test:learning-ui` for authenticated desktop/mobile journeys,
keyboard, failed saves, persistence and automated WCAG AA checks. Browser tests
use isolated dummy Supabase settings and mock sessions/API responses for all four roles.
Automated tests do not connect to the hosted database. CI runs these for
main, dev and PRs. The migration was additionally applied against the full
local Supabase schema, and a rolled-back integration transaction verified
assignment creation, evidence saving and cross-school read/write denial. A real
local-browser integration also verified teacher and learner authentication,
submission, teacher review, feedback, progress and denial of a peer's assignment.
Blockly journeys additionally test running, saved-work restoration, changed
program submission, failed saves, runaway loops and teacher access to submitted
blocks. Local preview accounts and credentials are kept only in gitignored `.context/`.
Local Supabase integration requires Docker; local startup excluded Storage
and the optional services because the Storage health check timed out.

Automated checks do not establish the pilot's independent-task-completion
target. Validate these tasks with participating VI and HI learners and
teachers before rollout:

| Task | Evidence to record |
| --- | --- |
| Open an assigned Beginner task and explain its outcome | Completion, time, prompting, assistive setup and any navigation barrier |
| Follow the activity instructions and identify what evidence to keep | Comprehension, independent completion and content barriers |
| Teacher prepares an activity and identifies evidence to review | Completion, time, preparation barriers and support needed |
| Return to the dashboard lessons and open another assignment | Focus/navigation barriers and preserved assignment context |

Use participant codes and record access accommodations without diagnoses.
For each barrier, record the task, severity, observed behaviour, fix, owner and
retest result. Track each learner's independent completion separately from
competency attainment. Do not report the 80% target as achieved until the
participating cohort has been tested and the denominator documented.

Login, accounts, assignments, submissions and feedback have automated desktop
and mobile accessibility checks. Quizzes and portfolios must add their own
journeys, and every usable journey still needs target-user testing.
