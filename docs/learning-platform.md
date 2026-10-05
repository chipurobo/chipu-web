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
Replace or reconcile them after reading the current rubric. No scores or
competency decisions are stored by this implementation.

## Implemented dashboard actions

- Admin → Lessons → New lesson: use an activity template or write a lesson;
  select a pathway, Beginner/Intermediate/Expert learning level, competency
  outcomes, activity steps and expected evidence. Delivery tracks remain separate.
- Admin → Lessons → Set learning outcomes / Edit learning plan: save the same
  plan on an existing lesson. Changing a plan does not rewrite prior assignments.
- School → Lessons → Assign lesson: select active roster students, add class
  instructions and an optional due date, then save a real assignment.
- Open lesson → Review assignment: see the assigned task and record each
  student's evidence, competency review and feedback. Reviews are append-only;
  previous observations remain in Review history. Teachers currently record
  evidence on behalf of students, who do not yet have login accounts.
- School → Learner progress: see the latest observed rating for each competency
  at each level, with links to its evidence. A newer developing observation
  replaces an older demonstrated observation in the display, without deleting
  history. Unobserved outcomes stay unassessed. No overall level is awarded.

There is no public `/learning` page or standalone `/dashboard/pathways` library.
The ten activity briefs are templates used in the lesson-creation action. There
is no persona switch that grants learner permissions.

Apply `supabase/migrations/20261005000000_dashboard_learning_actions.sql` to the
intended database before using saved learning plans, assignments or reviews.
On 2026-10-05 this migration was applied to local Supabase and the linked
hosted development project, after the user confirmed that the hosted project
is development. The preview on port 55000 uses local Supabase. Reads and writes
report backend errors; they never fall back to fabricated/local records.

The assignment RPC validates school access, active distinct recipients and a
saved plan, then creates assignment and recipients in one transaction. Evidence
review requires an assigned individual, described evidence, feedback and valid
competencies from the assignment snapshot. Anonymous access and direct writes
to assignment/evidence tables are denied. Current authenticated staff roles
are still `admin` and `school_lead`; learner/teacher identity is the next stage.

## Next implementation stages

1. Finalise the source mapping. Read the full current KICD design, reconcile
   every selected outcome and rubric, and agree progression rules. Approve a
   new immutable framework version; retain historical versions for evidence.
2. Add learner and teacher identity. Keep `school_lead` for school operations,
   add distinct teacher and learner roles, and link learner profiles to roster
   records. Define teacher-to-class membership and shared-device onboarding.
3. Extend the current individual lesson assignments with teacher-to-class
   membership, learner access, submission statuses and group work. Every group
   submission must identify individual contributions; group membership alone
   must not award a competency.
4. Add accessible quizzes with versioned questions, attempts and results,
   followed by learner evidence submissions and teacher review. Keep formal
   programme baseline/midline/endline instruments in the wider M&E system.
5. Add competency decisions backed by reviewed evidence, then learner progress
   and portfolios. Completion, confidence, independence and competency are
   separate facts. A level filter or leaderboard score cannot award a level.
6. Add pilot reporting with defined cohorts, denominators and time windows.
   Capture activation, resource use, learning activity, reviewed artifacts,
   progression and retention as first-party product events.

Before connecting these models, establish database policies for each role:
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
use isolated dummy Supabase settings and mock staff sessions/API responses.
Automated tests do not connect to the hosted database. CI runs these for
main, dev and PRs. The migration was additionally applied against the full
local Supabase schema, and a rolled-back integration transaction verified
assignment creation, evidence saving and cross-school read/write denial.
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

The account, assignment, quiz and portfolio stages must add their own journeys
to this validation process, including keyboard and target-user testing.
