# ChipuRobo learning platform implementation

The product specification calls for a platform used directly by teachers and
learners. Learning actions belong in the authenticated dashboard, alongside
the existing lesson planning and student workflows. Its competency
catalogue uses a versioned ChipuRobo adaptation of selected KICD Grade 10
outcomes. Curriculum maps are a Desktop reference for curriculum staff.

## Curriculum basis and review status

Grade 10 is the common curriculum reference for all participating learners,
including younger learners, as requested. Beginner, Intermediate and Expert
describe ChipuRobo learning stages; they are not school grades or KICD
assessment ratings. Existing primary and secondary delivery tracks remain
separate from these stages.

KICD's [official Grade 10 listing](https://kicd.ac.ke/cbc-materials/curriculum-designs/grade-ten/)
links to [Computer Studies Grade 10 July 2025](https://drive.google.com/file/d/1e5lBROYbbw6JeVCduFMCkWh1MbluV5M8/view).
The software-development references were verified in its public viewer on
6 October 2026: strand summary (printed page xii), program development
(3.2, page 32), identifiers and operators (3.3, page 34), control structures
(3.4, page 36), functions (3.6, page 40) and assessment-method examples
(page 58). The download restriction does not prevent reading these pages.

The current design supports algorithm design, input/output and operators,
sequence/iteration/selection, modular programming and testing during the
program-development cycle. The appendix includes projects, portfolios and
observations among suggested assessment methods. This verifies selected
references, not full syllabus coverage or an official Beginner/Intermediate/Expert
rubric. These stages, their descriptors and review bands remain ChipuRobo
adaptations for teaching and assessing the programme. Historical assignments retain
framework version 0.1; this source verification does not rewrite their outcomes.
Physical robotics, project design and communication remain ChipuRobo extensions.
A browser simulation alone does not demonstrate an Expert physical-computing
outcome.

The review conversation uses four proposed descriptions: not yet observed,
developing, demonstrated and extending. These are not the official KICD rubric.
Teacher observations
are stored against individual evidence; a separate reviewed progression decision
is required to award a level.

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
- Teacher / School → Learner progress: see the latest observed rating for each competency
  at each level, with links to its evidence. A newer developing observation
  replaces an older demonstrated observation in the display, without deleting
  history. Unobserved outcomes stay unassessed. Level decisions are recorded separately.
- Learner → My progress: see activity/submission counts, latest teacher feedback
  and links to continue Blockly work. A newer submission is shown as awaiting
  feedback while earlier feedback remains available. The competency matrix,
  level-review controls and decision history belong to the teacher workflow.
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
All seven migrations were applied to local Supabase and the existing hosted `chipurobo` project on 2026-10-05. Preview accounts and example learner work
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

## Quizzes, portfolios, progression and reporting

Apply migrations `20261006000000_quizzes_and_portfolios.sql`,
`20261006000001_progression_and_reporting.sql` and
`20261006000002_knowledge_check_content.sql` and
`20261006000003_evidence_based_progression.sql` for these additional journeys.

- Dashboard → Knowledge checks: three original ChipuRobo level checks (five
  questions each), attached to lesson/module references. The assignment brief
  links to its level's checks. Learners answer labelled radio groups without a
  timer; all answers are required. The server grades private answer keys and
  stores immutable question/version/answer/feedback snapshots per attempt.
  Admins publish replacements with the quiz builder; old attempts remain intact.
- Dashboard → My portfolio: learners curate their own immutable submissions,
  edit portfolio titles/reflections, reopen submitted Blockly code and view
  teacher feedback. Removing a portfolio entry preserves the submitted work.
  Teachers see allocated learners, admins select a school. The JSON export
  contains curated artifacts, assignment competency mappings, reviews, quiz
  evidence and progression decisions. It is a private evidence bundle; there
  is no anonymous public portfolio URL.
- Teacher / School → Learner progress → Level progression: see strengths in observed competency bands,
  missing evidence and next steps. Teachers record an award, defer for further
  practice, or revoke a prior decision, with a reason. Each decision records
  its criteria version and exact evidence IDs. There is no curriculum approval
  or sign-off requirement. The Desktop `curriculum maps.docx` is a reference
  for curriculum staff, without administrative or dependency-advisory content.
  An award requires the latest observations to demonstrate all
  required competencies, a passed level quiz, a demonstrated submitted Blockly
  capstone and any previous level. A score/submission never awards a level
  automatically; later observations never overwrite decision history.
- Dashboard → Learning reports: school/cohort and inclusive UTC date filters,
  account coverage, dashboard activity, resource opens, quiz attempts/passes,
  submissions, capstone artifacts, evidence reviews, award events, attendance,
  retained activity and observed independent task completion, with CSV export.
  Teachers see only their allocated cohort; school leads/admins see the
  selected school's roster. Denominators and event semantics are shown in the
  UI. Current roster, login availability, repeated events and evidence are
  separate facts. Historical logins cannot be reconstructed; telemetry begins
  with deployment. Retention means activity in both halves of the selected
  window, not programme retention or access-group attainment.
- Learning reports → Record lesson attendance / Core task observation: teachers
  record allocated learners' attendance on delivered session dates and observed
  task independence/barriers without diagnoses. Attendance uses the existing
  sessions/register tables; new roles do not receive direct school-wide writes.

Teacher home now offers inline Assign/Open lesson actions, a learning-level
filter and recent assignment review links. The approved role separation,
Blockly and capstone flows remain intact. Progress links use dashboard teal-700;
notification announcements have an accessible log role.

The full current KICD mapping and target-user validation remain outstanding.
The delivered criteria and checks are ChipuRobo content, not official KICD
assessment items. Formal baseline/midline/endline assessments stay in wider M&E.

## Remaining implementation and validation


1. Finalise the source mapping. Read the full current KICD design, reconcile
   every selected outcome and rubric, and maintain progression rules in a
   versioned framework; retain historical versions for evidence.
2. Extend account administration with password recovery for learners without
   email, shared-device onboarding and account lifecycle controls.
3. Extend the current individual lesson assignments with group work. Every group
   submission must identify individual contributions; group membership alone
   must not award a competency.
4. Keep curriculum maps useful to curriculum staff as teaching content evolves;
   retain separate competency, completion, confidence and independence evidence.
5. Reconcile the reporting cohort with programme enrolment/training dates and
   M&E definitions before claiming activation, VI/HI attainment or programme
   retention targets.
6. Validate all usable journeys with participating learners and teachers.

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

### Hosting and data preservation

The release uses the existing Supabase `chipurobo` project
(`csckuplkouwopgsucldb`). Vercel's existing Supabase environment variables are
unchanged. No replacement database is required. The three October 6 migrations
were applied there after taking schema and data backups; comparison of all 68
original backed-up table sections found no changed records. The added tables
store quiz versions/attempts, portfolio entries, progression policies/decisions,
activity and observed tasks.
