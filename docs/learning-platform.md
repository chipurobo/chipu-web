# ChipuRobo learning platform implementation

The product specification calls for a platform used directly by teachers and
learners. The first implementation provides a shared learning library with
separate learner instructions and teacher preparation guidance. Its competency
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

## Implemented journeys

- `/learning`: a public library shared by teachers and learners. A learner
  chooses a learning level, opens an activity, reads its outcomes, follows the
  task and sees what evidence to retain with their teacher.
- The teacher view uses the same activities and outcomes, adding preparation,
  inclusive delivery notes and evidence review prompts.
- `/dashboard/pathways?view=teacher`: the same library inside the existing
  authenticated dashboard, linked from the sidebar and home screen.
- View and level selections are URL parameters and survive activity
  navigation, refresh and return to the library. A view selector changes
  public guidance; it never changes the authenticated role or permissions.
- Raspberry Pi Foundation resources open externally with explicit provider
  attribution. Opening them does not create a ChipuRobo completion record.

The library has three pathways, ten practical activity briefs and six skill
areas with descriptions at each of the three levels. Stable activity and
competency IDs plus framework version `0.1` are the references future
assignments, evidence and progression records should use.

## Next implementation stages

1. Finalise the source mapping. Read the full current KICD design, reconcile
   every selected outcome and rubric, and agree progression rules. Approve a
   new immutable framework version; retain historical versions for evidence.
2. Add learner and teacher identity. Keep `school_lead` for school operations,
   add distinct teacher and learner roles, and link learner profiles to roster
   records. Define teacher-to-class membership and shared-device onboarding.
3. Add assignments referencing framework version, activity and expected level.
   Each assignment needs a school, assigning teacher, learner/group recipients,
   due date and status. A group submission must identify individual
   contributions; group membership alone must not award a competency.
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
isolation at the database boundary. Public pathway content must never contain
learner identities, records or evidence.

## Accessibility acceptance and validation

Native radios, selects, links, lists and disclosures support keyboard use.
Navigating between library and activity places focus on the new task heading;
changing a filter retains control focus and announces the resulting count.
The closed mobile menu is hidden from both visual and keyboard navigation.
Alternative evidence formats and the distinction between access support and
learning-task prompting are included in every activity.

Run `npm run test:learning` for catalogue integrity and coverage checks. Run
`npx playwright install chromium`, then `npm run test:learning-ui` for desktop
and mobile journey, keyboard, focus, malformed-link, responsive and automated
WCAG AA checks. The test server uses dummy Supabase settings and never talks to
the developer's hosted database. CI runs these checks for main, dev and PRs.

Automated checks do not establish the pilot's independent-task-completion
target. Validate these tasks with participating VI and HI learners and
teachers before rollout:

| Task | Evidence to record |
| --- | --- |
| Find a Beginner activity and explain its outcome | Completion, time, prompting, assistive setup and any navigation barrier |
| Follow the activity instructions and identify what evidence to keep | Comprehension, independent completion and content barriers |
| Teacher prepares an activity and identifies evidence to review | Completion, time, preparation barriers and support needed |
| Return to the library and find the next activity | Focus/navigation barriers and retained view/filter state |

Use participant codes and record access accommodations without diagnoses.
For each barrier, record the task, severity, observed behaviour, fix, owner and
retest result. Track each learner's independent completion separately from
competency attainment. Do not report the 80% target as achieved until the
participating cohort has been tested and the denominator documented.

The account, assignment, quiz and portfolio stages must add their own journeys
to this validation process, including keyboard and target-user testing.
