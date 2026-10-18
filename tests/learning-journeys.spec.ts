import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Buffer } from 'node:buffer';

const userId = '00000000-0000-0000-0000-000000000002';
const schoolId = '00000000-0000-0000-0000-000000000101';
const studentId = '00000000-0000-0000-0000-000000000201';
const lessonId = '00000000-0000-0000-0000-000000000301';
const assignmentId = '00000000-0000-0000-0000-000000000401';
const plan = { frameworkVersion: '0.1', pathwayId: 'creative-coding', level: 'beginner',
  competencyIds: ['algorithms', 'debugging'], steps: ['Write an ordered sequence.', 'Test it with a partner.'],
  evidenceBrief: 'Explain your sequence and one correction.' };

async function mockDashboard(page: Page, role: 'admin' | 'school_lead' | 'teacher' | 'learner' = 'school_lead', authenticated = true) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'teacher@example.test',
    app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' };
  const session = { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: 4102444800, role: 'authenticated' })}.test-signature`,
    refresh_token: 'test-refresh-token', expires_at: 4102444800, expires_in: 86400, token_type: 'bearer', user };
  await page.addInitScript(({ session, authenticated }) => {
    if (authenticated) localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    localStorage.setItem('chipurobo:onboarding-seen', '1');
  }, { session, authenticated });
  const lesson = { id: lessonId, title: 'Give clear instructions', description: 'Plan and test a sequence.',
    kind: 'lesson', level: 'both', points: 1, position: 1, is_active: true, learning_plan: structuredClone(plan), resource_url: null,
    media_type: null as 'video' | 'audio' | null, media_url: null as string | null, captions_url: null as string | null,
    media_transcript: null as string | null, media_instructions: null as string | null,
    minimum_age: 9 as number | null, maximum_age: 12 as number | null,
    minimum_grade: 4 as number | null, maximum_grade: 6 as number | null,
    learning_needs: ['hearing support'], review_status: 'approved', review_notes: null as string | null,
    approved_at: '2026-10-01T00:00:00Z', approved_by: userId };
  const assignment = { id: assignmentId, school_id: schoolId, lesson_id: lessonId, title: lesson.title,
    instructions: 'Work in pairs, then explain your own solution.', due_date: null as string | null, learning_plan: structuredClone(plan), assigned_by: userId, created_at: '2026-10-05T09:00:00Z' };
  const state = {
    lessons: [lesson], assignments: [assignment], recipients: [{ assignment_id: assignmentId, student_id: studentId }],
    evidence: [] as Record<string, unknown>[], submissions: [] as Record<string, unknown>[], accounts: [] as Record<string, unknown>[], writes: [] as { path: string; body: Record<string, unknown> }[], failReviews: false,
    quizzes: [{id:'quiz-one',slug:'beginner-check',title:'Beginner knowledge check',level:'beginner',version:1,pass_percent:80,lesson_id:lessonId,questions:[{id:'q1',prompt:'What describes ordered steps?',choices:['An algorithm','A random click']}]}],
    attempts: [] as Record<string,unknown>[],portfolio: [] as Record<string,unknown>[],decisions: [] as Record<string,unknown>[],
    readiness:{ready:false,missing_competencies:['algorithms'],quiz_attempt_id:null as string|null,capstone_review_id:null as string|null,previous_level_awarded:true},
    draft: null as null | { workspace: unknown; code: unknown; output: unknown }, failPrograms: false,
  };
  await page.route('http://127.0.0.1:54321/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.split('/').at(-1)!;
    const body = request.postDataJSON() as Record<string, unknown> | null;
    if (request.method() === 'HEAD') {
      await route.fulfill({ status: 200, headers: { 'content-range': '*/0' }, body: '' }); return;
    }
    if (path === 'list_learning_quizzes') { await route.fulfill({json:state.quizzes});return; }
    if (path === 'learning_progression_readiness') { await route.fulfill({json:state.readiness});return; }
    if (path === 'learning_pilot_report') { await route.fulfill({json:{from:body!.p_from,to:body!.p_to,timezone:'UTC',cohort:'Current active accessible roster',enrolled_learners:1,learners_with_accounts:1,active_learners:1,observed_tasks:0,independent_tasks:0}});return; }
    if (path === 'record_learning_activity') { await route.fulfill({json:null});return; }
    if (path === 'submit_learning_quiz') {state.attempts.unshift({id:'attempt-one',quiz_id:'quiz-one',student_id:studentId,question_snapshot:state.quizzes[0],score:100,passed:true,submitted_at:new Date().toISOString(),feedback:[{id:'q1',correct:true,explanation:'An algorithm describes ordered steps.'}]});await route.fulfill({json:'attempt-one'});return;}
    if (path === 'save_learning_portfolio_item') {state.portfolio.push({id:'portfolio-one',student_id:studentId,submission_id:body!.p_submission_id,title:body!.p_title,reflection:body!.p_reflection,created_at:new Date().toISOString()});await route.fulfill({json:'portfolio-one'});return;}
    if (path === 'remove_learning_portfolio_item') {state.portfolio=state.portfolio.filter(i=>i.id!==body!.p_item_id);await route.fulfill({json:null});return;}
    if (path === 'record_learning_progression') {state.decisions.unshift({id:'decision-one',student_id:body!.p_student_id,level:body!.p_level,outcome:body!.p_outcome,reason:body!.p_reason,decided_at:new Date().toISOString(),policy_id:'policy-one'});await route.fulfill({json:'decision-one'});return;}
    if (path === 'record_learning_task_observation' || path === 'record_learning_attendance') {state.writes.push({path,body:body!});await route.fulfill({json:null});return;}
    if (path === 'token') { state.writes.push({ path, body: body ?? {} }); await route.fulfill({ json: session }); return; }
    if (path === 'logout') { await route.fulfill({ status: 204, body: '' }); return; }
    if (request.method() === 'POST' || request.method() === 'PATCH') state.writes.push({ path, body: body ?? {} });
    if (path === 'learning_program_drafts') { await route.fulfill({ json: state.draft ? [state.draft] : [] }); return; }
    if (path === 'save_learning_program') {
      if (state.failPrograms) { await route.fulfill({ status: 400, json: { message: 'Program could not be saved. Try again.' } }); return; }
      state.draft = { workspace: body!.p_workspace, code: body!.p_code, output: body!.p_output };
      await route.fulfill({ json: new Date().toISOString() }); return;
    }
    if (path === 'start_blockly_lesson') {
      const selected = state.lessons.find((item) => item.id === body!.p_lesson_id)!;
      const started = { ...assignment, id: `started-${selected.id}`, lesson_id: selected.id, title: selected.title, learning_plan: selected.learning_plan };
      state.assignments.unshift(started); state.recipients.push({ assignment_id: started.id, student_id: studentId });
      await route.fulfill({ json: started.id }); return;
    }
    if (path === 'assign_learning_lesson') {
      assignment.instructions = String(body!.p_instructions);
      assignment.due_date = body!.p_due_date as string | null;
      state.recipients = (body!.p_student_ids as string[]).map((id) => ({ assignment_id: assignmentId, student_id: id }));
      await route.fulfill({ json: assignmentId }); return;
    }
    if (path === 'review_lesson_content') {
      const selected = state.lessons.find((item) => item.id === body!.p_lesson_id)!;
      selected.review_status = String(body!.p_status);
      selected.review_notes = body!.p_notes as string | null;
      selected.is_active = body!.p_status === 'approved';
      selected.approved_at = selected.is_active ? new Date().toISOString() : null;
      selected.approved_by = selected.is_active ? userId : null;
      await route.fulfill({ json: selected }); return;
    }
    if (path === 'submit_learning_work') {
      state.submissions.unshift({ id: 'submission-one', assignment_id: body!.p_assignment_id, student_id: studentId,
        blockly_workspace: body!.p_blockly_workspace, generated_code: body!.p_generated_code, run_output: body!.p_run_output,
        evidence_text: body!.p_evidence_text, evidence_url: body!.p_evidence_url, reflection: body!.p_reflection, submitted_at: new Date().toISOString() });
      await route.fulfill({ json: 'submission-one' }); return;
    }
    if (path === 'review_learning_submission') {
      const submission = state.submissions.find((item) => item.id === body!.p_submission_id)!;
      state.evidence.unshift({ id: 'review-one', assignment_id: assignmentId, student_id: studentId, evidence_text: submission.evidence_text,
        evidence_url: submission.evidence_url, reviews: body!.p_reviews, feedback: body!.p_feedback, submission_id: submission.id, recorded_at: new Date().toISOString() });
      await route.fulfill({ json: 'review-one' }); return;
    }
    if (path === 'admin_list_learning_accounts') { await route.fulfill({ json: state.accounts }); return; }
    if (path === 'admin_create_learner_login') {
      state.accounts.push({ id: 'new-account', role: 'learner', full_name: '0001', login: 'test-0001', student_id: body!.p_student_id, admission_number: '0001' });
      await route.fulfill({ json: { user_id: 'new-account', login: 'test-0001', admission_number: '0001', role: 'learner' } }); return;
    }
    if (path === 'admin_create_learning_account') {
      state.accounts.push({ id: 'new-account', role: body!.p_role, full_name: body!.p_role === 'learner' ? 'Test Learner' : body!.p_full_name,
        login: body!.p_login, student_id: body!.p_student_id });
      await route.fulfill({ json: { user_id: 'new-account', login: body!.p_login, role: body!.p_role } }); return;
    }
    if (path === 'record_competency_evidence') {
      if (state.failReviews) { await route.fulfill({ status: 400, json: { message: 'Review could not be saved. Try again.' } }); return; }
      state.evidence.unshift({ id: `evidence-${state.evidence.length + 1}`, assignment_id: assignmentId,
        student_id: body!.p_student_id, evidence_text: body!.p_evidence_text, evidence_url: body!.p_evidence_url,
        feedback: body!.p_feedback, reviews: body!.p_reviews, recorded_by: userId, recorded_at: new Date().toISOString() });
      await route.fulfill({ json: 'evidence-saved' }); return;
    }
    if (path === 'lessons' && request.method() === 'PATCH') Object.assign(lesson, body);
    if (path === 'lessons' && request.method() === 'POST') state.lessons.push({ ...lesson, ...body, id: 'new-lesson' });
    let rows: unknown[] = [];
    if (path === 'learning_quiz_attempts') rows=state.attempts;
    if (path === 'learning_portfolio_items') rows=state.portfolio;
    if (path === 'learning_progression_decisions') rows=state.decisions;
    if (path === 'learning_progression_policies') rows=[{id:'policy-one',version:1,name:'ChipuRobo pilot progression — draft',framework_version:'0.1',approved:false,review_notes:'Awaiting curriculum review.'}];
    if (path === 'profiles') rows = [{ id: userId, role, full_name: 'Test Teacher', school_id: role === 'admin' ? null : schoolId }];
    if (path === 'get_my_learning_school') { await route.fulfill({ json: { id: schoolId, name: 'Test School', is_maker_space: false } }); return; }
    if (path === 'get_my_learning_students') { await route.fulfill({ json: [{ id: studentId, school_id: schoolId, full_name: 'Test Learner', is_active: true, in_club: true }] }); return; }
    if (path === 'schools') rows = [{ id: schoolId, name: 'Test School', code: 'test', is_maker_space: false }];
    if (path === 'school_login_options') rows = [{ id: schoolId, name: 'Test School', code: 'test' }];
    if (path === 'club_members') rows = [{ id: studentId, school_id: schoolId, full_name: 'Test Learner', learner_code: 'L-001', admission_number: null, is_active: true, in_club: true }];
    if (path === 'lessons') rows = state.lessons.filter((row) => {
      const metadata = row.learning_plan as { delivery?: string; activityKind?: string };
      return (!url.searchParams.has('kind') || url.searchParams.get('kind') === `eq.${row.kind}`)
        && (!url.searchParams.has('is_active') || url.searchParams.get('is_active') === `eq.${row.is_active}`)
        && (!url.searchParams.has('review_status') || url.searchParams.get('review_status') === `eq.${row.review_status}`)
        && (!url.searchParams.has('learning_plan->>delivery') || metadata.delivery === 'blockly')
        && (!url.searchParams.has('learning_plan->>activityKind') || metadata.activityKind === 'capstone');
    });
    if (path === 'learning_assignments') rows = state.assignments.filter((row) => !url.searchParams.has('id') || url.searchParams.get('id') === `eq.${row.id}`);
    if (path === 'learning_assignment_recipients') rows = state.recipients;
    if (path === 'competency_evidence') rows = state.evidence;
    if (path === 'learning_submissions') rows = state.submissions;
    if (path === 'user') { await route.fulfill({ json: user }); return; }
    await route.fulfill({ json: request.headers().accept?.includes('vnd.pgrst.object') ? rows[0] ?? null : rows });
  });
  return state;
}

test.beforeEach(async ({ page }) => {
  await page.route(/googletagmanager|google-analytics|analytics\.google/, (route) => route.abort());
});

test('the public learning library is removed from the website', async ({ page }) => {
  await page.goto('/learning?view=teacher&level=all');
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Learning', exact: true })).toHaveCount(0);
});

for (const path of ['/dashboard/school/lessons', `/dashboard/assignments/${assignmentId}`, '/dashboard/school/progress']) {
  test(`signed-out visitors cannot access learning actions: ${path}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('chipurobo:onboarding-seen', '1'));
    await page.goto(path);
    await expect(page.getByRole('heading', { name: 'Sign in to ChipuRobo' })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/login$/);
  });
}

test('admin creates an actionable lesson plan from a template', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  await page.goto('/dashboard/admin/lessons');
  await page.getByRole('button', { name: 'New lesson', exact: true }).click();
  await page.getByLabel('Start from an activity template').selectOption('first-sequence');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Give clear instructions');
  await page.getByLabel('Learning level', { exact: true }).selectOption('intermediate');
  await page.getByRole('button', { name: 'Save draft lesson', exact: true }).click();
  await expect(page.getByRole('form', { name: 'New lesson' })).toHaveCount(0);
  const write = state.writes.find((item) => item.path === 'lessons')!;
  expect(write.body.learning_plan).toMatchObject({ level: 'intermediate', frameworkVersion: '0.1', competencyIds: ['algorithms', 'debugging', 'communication'] });
  expect(write.body).toMatchObject({ review_status: 'draft', is_active: false });
  expect(state.lessons).toHaveLength(2);
});

test('admin tags, reviews and publishes a lesson before teachers can use it', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  state.lessons[0].review_status = 'draft'; state.lessons[0].is_active = false;
  state.lessons[0].approved_at = null; state.lessons[0].approved_by = null;
  await page.goto('/dashboard/admin/lessons');
  await page.getByRole('button', { name: 'Review content', exact: true }).click();
  const form = page.getByRole('form', { name: 'Content review for Give clear instructions' });
  await form.getByLabel('Minimum age').fill('10');
  await form.getByLabel('Maximum age').fill('13');
  await form.getByLabel('Minimum grade').fill('5');
  await form.getByLabel('Maximum grade').fill('7');
  await form.getByLabel('Visual support').check();
  await form.getByLabel('Review status').selectOption('approved');
  await form.getByLabel('Review notes').fill('Checked for age, accessibility and learning outcomes.');
  await form.getByRole('button', { name: 'Save review', exact: true }).click();
  await expect(form).toHaveCount(0);
  expect(state.lessons[0]).toMatchObject({ minimum_age: 10, maximum_age: 13, minimum_grade: 5, maximum_grade: 7,
    review_status: 'approved', is_active: true, review_notes: 'Checked for age, accessibility and learning outcomes.' });
  expect(state.lessons[0].learning_needs).toEqual(['hearing support', 'visual support']);
});

test('content review opens in view and announces the selected lesson', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  for (let index = 2; index <= 18; index += 1) {
    state.lessons.push({ ...structuredClone(state.lessons[0]), id: `lesson-${index}`, title: `Lesson ${index}`, position: index });
  }
  await page.goto('/dashboard/admin/lessons');
  const lessonRow = page.getByRole('row').filter({ hasText: 'Lesson 18' });
  await lessonRow.getByRole('button', { name: 'Review content', exact: true }).click();
  const form = page.getByRole('form', { name: 'Content review for Lesson 18' });
  await expect(form).toBeInViewport();
  await expect(form.getByRole('heading', { name: 'Lesson 18', exact: true })).toBeFocused();
});

test('admin sees a clear migration warning instead of a broken review editor', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  const legacyLesson = state.lessons[0] as unknown as Record<string, unknown>;
  delete legacyLesson.review_status;
  delete legacyLesson.minimum_age;
  delete legacyLesson.learning_needs;
  await page.goto('/dashboard/admin/lessons');
  await page.getByRole('button', { name: 'Review content', exact: true }).click();
  const form = page.getByRole('form', { name: 'Content review for Give clear instructions' });
  await expect(form.getByRole('alert')).toContainText('latest database migration');
  await expect(form.getByRole('button', { name: 'Save review', exact: true })).toBeDisabled();
});

test('teacher curates approved lessons by grade, age, competency and learning need', async ({ page }) => {
  const state = await mockDashboard(page, 'teacher');
  state.lessons.push({ ...structuredClone(state.lessons[0]), id: 'lesson-two', title: 'Advanced robotics',
    minimum_age: 14, maximum_age: 18, minimum_grade: 8, maximum_grade: 12,
    learning_needs: ['visual support'], learning_plan: { ...structuredClone(plan), level: 'expert' } });
  state.lessons.push({ ...structuredClone(state.lessons[0]), id: 'lesson-draft', title: 'Unapproved lesson',
    review_status: 'draft', is_active: false });
  await page.goto('/dashboard/school/lessons');
  await expect(page.getByText('Only reviewed and approved lessons are shown.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unapproved lesson' })).toHaveCount(0);
  await page.getByLabel('Learner age').selectOption('10');
  await page.getByLabel('Grade').selectOption('5');
  await page.getByLabel('Learning need').selectOption('hearing support');
  await expect(page.getByRole('heading', { name: 'Give clear instructions', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Advanced robotics', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Lesson suitability').getByText('Ages 9–12')).toBeVisible();
  await page.getByRole('radio', { name: /Expert/ }).check({ force: true });
  await expect(page.getByRole('heading', { name: 'Give clear instructions', exact: true })).toHaveCount(0);
});

test('admin updates an existing lesson with saved learning outcomes', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  await page.goto('/dashboard/admin/lessons');
  await page.getByRole('button', { name: 'Edit learning plan', exact: true }).click();
  await page.getByLabel('Learning level', { exact: true }).selectOption('expert');
  await page.getByRole('button', { name: 'Save learning plan', exact: true }).click();
  await expect(page.getByRole('form', { name: 'Learning plan for Give clear instructions' })).toHaveCount(0);
  expect(state.lessons[0].learning_plan.level).toBe('expert');
  expect(state.assignments[0].learning_plan.level).toBe('beginner');
});

test('teacher assigns a lesson to selected students and reopens the saved task', async ({ page }, testInfo) => {
  const state = await mockDashboard(page, 'teacher');
  await page.goto('/dashboard/school/lessons');
  await page.getByRole('button', { name: 'Assign lesson', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Assign to selected students' })).toBeDisabled();
  await page.getByLabel('Test Learner', { exact: true }).check();
  await page.getByLabel('Instructions for this class').fill('Build your sequence and explain your own work.');
  await page.getByLabel('Due date (optional)').fill('2026-10-12');
  await page.getByRole('button', { name: 'Assign to selected students' }).click();
  await expect(page).toHaveURL(`/dashboard/assignments/${assignmentId}`);
  await expect(page.getByRole('heading', { name: 'Give clear instructions', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText('Build your sequence and explain your own work.', { exact: true })).toBeVisible();
  expect(state.writes.find((write) => write.path === 'assign_learning_lesson')!.body).toMatchObject({
    p_student_ids: [studentId], p_due_date: '2026-10-12', p_school_id: schoolId,
  });
  await page.reload();
  await expect(page.getByText('Build your sequence and explain your own work.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About', exact: true })).toHaveCount(0);
  if (testInfo.project.name === 'desktop') await page.screenshot({ path: '.context/dashboard-learning.png' });
});

async function fillReview(page: Page) {
  await page.getByRole('button', { name: 'Record evidence and review' }).click();
  await page.getByLabel("Describe the learner's evidence").fill('Explained a sequence and corrected its order.');
  await page.getByLabel('Plan a solution', { exact: true }).selectOption('demonstrated');
  await page.getByLabel('Feedback and next step').fill('Try a longer sequence next.');
}

test('teacher saves individual evidence and can review its history after refresh', async ({ page }) => {
  const state = await mockDashboard(page);
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await fillReview(page);
  await page.getByLabel('Evidence link (optional)').fill('javascript:alert(1)');
  await expect(page.getByRole('button', { name: 'Save evidence review' })).toBeDisabled();
  await page.getByLabel('Evidence link (optional)').fill('https://example.test/my-sequence');
  await page.getByRole('button', { name: 'Save evidence review' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Evidence review saved.' })).toBeVisible();
  await page.reload();
  await page.getByText('Review history', { exact: true }).click();
  await expect(page.getByText('Explained a sequence and corrected its order.', { exact: true })).toBeVisible();
  expect(state.evidence[0].reviews).toEqual({ algorithms: 'demonstrated' });
  expect(state.evidence[0].student_id).toBe(studentId);
});

test('a failed evidence save preserves the form and never claims success', async ({ page }) => {
  const state = await mockDashboard(page); state.failReviews = true;
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await fillReview(page);
  await page.getByRole('button', { name: 'Save evidence review' }).click();
  await expect(page.getByRole('alert')).toHaveText('Review could not be saved. Try again.');
  await expect(page.getByLabel("Describe the learner's evidence")).toHaveValue('Explained a sequence and corrected its order.');
  await expect(page.getByText('Evidence review saved.', { exact: true })).toHaveCount(0);
  expect(state.evidence).toHaveLength(0);
});

test('progress displays the latest observation at its own level with a link to evidence', async ({ page }) => {
  const state = await mockDashboard(page);
  state.evidence = [{ id: 'new-review', assignment_id: assignmentId, student_id: studentId, reviews: { algorithms: 'developing' }, recorded_at: '2026-10-05T12:00:00Z' },
    { id: 'old-review', assignment_id: assignmentId, student_id: studentId, reviews: { algorithms: 'demonstrated' }, recorded_at: '2026-10-04T12:00:00Z' }];
  await page.goto('/dashboard/school/progress');
  const learner = page.getByRole('article', { name: 'Progress for Test Learner' });
  await expect(learner.getByRole('region', { name: 'Beginner', exact: true }).getByRole('link', { name: 'Developing' })).toHaveAttribute('href', `/dashboard/assignments/${assignmentId}`);
  await expect(learner.getByRole('link', { name: 'Demonstrated' })).toHaveCount(0);
  await expect(learner.getByRole('region', { name: 'Intermediate', exact: true }).getByText('Not yet observed')).toHaveCount(6);
});

test('unknown assignment does not reveal another task', async ({ page }) => {
  await mockDashboard(page);
  await page.goto('/dashboard/assignments/missing');
  await expect(page.getByRole('heading', { name: 'Assignment not found' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Give clear instructions', exact: true, level: 1 })).toHaveCount(0);
});

test('assignment and review controls support keyboard input', async ({ page }) => {
  await mockDashboard(page);
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  const button = page.getByRole('button', { name: 'Record evidence and review' });
  await button.focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Tab');
  await expect(page.getByLabel("Describe the learner's evidence")).toBeFocused();
  await page.keyboard.type('Ordered and explained the steps.');
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  await expect(page.getByLabel('Plan a solution', { exact: true })).toBeFocused();
  await page.keyboard.press('d'); await page.keyboard.press('Enter');
  await expect(page.getByLabel('Plan a solution', { exact: true })).toHaveValue('developing');
});

for (const journey of ['plan', 'assignment', 'review', 'progress']) {
  test(`dashboard ${journey} has no automated WCAG AA violations or horizontal overflow`, async ({ page }) => {
    await mockDashboard(page, journey === 'plan' ? 'admin' : 'school_lead');
    if (journey === 'plan') {
      await page.goto('/dashboard/admin/lessons');
      await page.getByRole('button', { name: 'Edit learning plan', exact: true }).click();
    } else if (journey === 'assignment') {
      await page.goto('/dashboard/school/lessons');
      await page.getByRole('button', { name: 'Assign lesson', exact: true }).click();
    } else if (journey === 'review') {
      await page.goto(`/dashboard/assignments/${assignmentId}`); await fillReview(page);
    } else {
      await page.goto('/dashboard/school/progress');
      await expect(page.getByRole('article', { name: 'Progress for Test Learner' })).toBeVisible();
    }
    // Existing curriculum tables intentionally scroll inside their own container.
    // Audit the new journey controls plus dashboard navigation, not those tables.
    const axe = new AxeBuilder({ page }).include('.learning-zone').include('#dashboard-sidebar');
    const results = await axe.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('mobile dashboard navigation hides closed links and restores focus on Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile drawer only');
  await mockDashboard(page);
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  const sidebar = page.locator('#dashboard-sidebar');
  await expect(sidebar).toBeHidden();
  const trigger = page.getByRole('button', { name: 'Open navigation menu' });
  await trigger.click(); await expect(sidebar).toBeVisible();
  await page.keyboard.press('Escape'); await expect(sidebar).toBeHidden(); await expect(trigger).toBeFocused();
  await trigger.click();
  await sidebar.getByRole('link', { name: 'Learner progress', exact: true }).click();
  await expect(page).toHaveURL('/dashboard/school/progress'); await expect(sidebar).toBeHidden();
});

for (const kind of ['Teacher', 'Learner'] as const) {
  test(`${kind} can sign in and land on their own dashboard after account hydration`, async ({ page }) => {
    const state = await mockDashboard(page, kind === 'Teacher' ? 'teacher' : 'learner', false);
    await page.goto('/dashboard/login');
    await page.getByRole('radio', { name: kind, exact: true }).check();
    if (kind === 'Teacher') { await page.getByLabel('Email or username', { exact: true }).fill('teacher@example.test'); await page.getByLabel('Password', { exact: true }).fill('TestPassword123'); }
    else { await page.getByRole('combobox', { name: 'School', exact: true }).selectOption('test'); await page.getByRole('textbox', { name: 'Admission number', exact: true }).fill('7'); await expect(page.getByLabel('Password', { exact: true })).toHaveCount(0); }
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: kind === 'Teacher' ? 'Welcome back, Test.' : 'Hi, Test!', exact: true, level: 1 })).toBeVisible();
    expect(state.writes.find((write) => write.path === 'token')!.body).toMatchObject(kind === 'Teacher' ? { email: 'teacher@example.test' } : { email: 'test-0007@learners.chipurobo.local', password: 'chipu-learner-test-0007-2026' });
    await expect(page.getByRole('link', { name: 'Stock & units', exact: true })).toHaveCount(0);
  });
}

test('selecting learner sign-in cannot turn teacher credentials into a learner account', async ({ page }) => {
  await mockDashboard(page, 'teacher', false);
  await page.goto('/dashboard/login');
  await page.getByRole('radio', { name: 'Learner', exact: true }).check();
  await page.getByRole('combobox', { name: 'School', exact: true }).selectOption('test');
  await page.getByRole('textbox', { name: 'Admission number', exact: true }).fill('0001');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('This account uses a different sign-in option. Choose Learner, Teacher or Admin above and try again.');
  await expect(page).toHaveURL('/dashboard/login');
});

test('login role cards work with the keyboard and teacher passwords can be checked without losing them', async ({ page }) => {
  await mockDashboard(page, 'teacher', false);
  await page.goto('/dashboard/login');
  const learner = page.getByRole('radio', { name: 'Learner', exact: true });
  await expect(learner).toBeChecked();
  await learner.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Teacher', exact: true })).toBeChecked();
  await expect(page.getByRole('combobox', { name: 'School', exact: true })).toHaveCount(0);
  const password = page.getByLabel('Password', { exact: true });
  await password.fill('A teacher password');
  await page.getByRole('button', { name: 'Show password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'text');
  await expect(password).toHaveValue('A teacher password');
  await page.getByRole('button', { name: 'Hide password', exact: true }).click();
  await expect(password).toHaveAttribute('type', 'password');
  await page.getByRole('radio', { name: 'Admin', exact: true }).check();
  await expect(password).toHaveAttribute('type', 'password');
  await expect(page.getByText('Welcome back, admin.', { exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page }).include('.login-page').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('teacher usernames sign in through the existing short-login rule', async ({ page }) => {
  const state = await mockDashboard(page, 'teacher', false);
  await page.goto('/dashboard/login');
  await page.getByRole('radio', { name: 'Teacher', exact: true }).check();
  await page.getByLabel('Email or username', { exact: true }).fill('  ihub.teacher  ');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL('/dashboard');
  expect(state.writes.find((write) => write.path === 'token')!.body).toMatchObject({ email: 'ihub.teacher@chipurobo.local', password: 'TestPassword123' });
});

test('login explains failed credentials and moves keyboard focus to the error', async ({ page }) => {
  await mockDashboard(page, 'learner', false);
  await page.route('**/auth/v1/token?**', (route) => route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } }));
  await page.goto('/dashboard/login');
  await page.getByRole('combobox', { name: 'School', exact: true }).selectOption('test');
  await page.getByRole('textbox', { name: 'Admission number', exact: true }).fill('1');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  const error = page.getByRole('alert');
  await expect(error).toHaveText('We couldn’t find that learner. Check your school and admission number, or ask your teacher.');
  await expect(error).toBeFocused();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
});

test('school loading failure can be retried without reloading the login page', async ({ page }) => {
  await mockDashboard(page, 'learner', false);
  let recovered = false;
  await page.route('**/rest/v1/school_login_options?**', (route) => route.fulfill(recovered
    ? { json: [{ id: schoolId, name: 'Test School', code: 'test' }] }
    : { status: 400, json: { message: 'School list unavailable' } }));
  await page.goto('/dashboard/login');
  const retry = page.getByRole('button', { name: 'Try again', exact: true });
  await expect(retry).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled();
  recovered = true;
  await retry.click();
  await page.getByRole('combobox', { name: 'School', exact: true }).selectOption('test');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
});

test('login prevents role changes and duplicate submissions while signing in', async ({ page }) => {
  await mockDashboard(page, 'teacher', false);
  let finishRequest!: () => void;
  const pendingRequest = new Promise<void>((resolve) => { finishRequest = resolve; });
  let requests = 0;
  await page.route('**/auth/v1/token?**', async (route) => {
    requests++;
    await pendingRequest;
    await route.fulfill({ status: 400, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } });
  });
  await page.goto('/dashboard/login');
  await page.getByRole('radio', { name: 'Teacher', exact: true }).check();
  await page.getByLabel('Email or username', { exact: true }).fill('teacher.test');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Signing in…', exact: true })).toBeDisabled();
  for (const role of ['Learner', 'Teacher', 'Admin']) await expect(page.getByRole('radio', { name: role, exact: true })).toBeDisabled();
  await expect(page.getByLabel('Password', { exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toHaveText('Signing you in. Please wait.');
  finishRequest();
  await expect(page.getByRole('alert')).toContainText('Those details didn’t match.');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
  expect(requests).toBe(1);
});

test('login roles and fields stay within a narrow phone screen', async ({ page }) => {
  await mockDashboard(page, 'teacher', false);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto('/dashboard/login');
  for (const role of ['Learner', 'Teacher', 'Admin']) {
    await page.getByRole('radio', { name: role, exact: true }).check();
    const controls = await page.locator('.login-role, .login-input, .login-submit').evaluateAll((elements) => elements.map((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, right: rect.right, height: rect.height };
    }));
    expect(controls.every(({ left, right, height }) => left >= 0 && right <= 320 && height >= 44)).toBe(true);
  }
});

test('a learner submits their own work and reopens the saved submission', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  await page.goto('/dashboard');
  await page.getByRole('link', { name: /^Start / }).click();
  await page.getByLabel('What did you make?').fill('My tested sequence.');
  await page.getByLabel('What did you learn? (optional)').fill('Testing found a misplaced step.');
  await page.getByRole('button', { name: /^Send / }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sent!' })).toBeVisible();
  expect(state.writes.find((write) => write.path === 'submit_learning_work')!.body).toMatchObject({
    p_assignment_id: assignmentId, p_evidence_text: 'My tested sequence.', p_evidence_url: null, p_reflection: 'Testing found a misplaced step.',
  });
  expect(state.submissions[0].blockly_workspace).toBeTruthy();
  await page.reload();
  await expect(page.getByRole('region', { name: 'My submissions', exact: true }).getByText('My tested sequence.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Review student work', exact: true })).toHaveCount(0);
});

test('learners can flag a concern from a lesson using child-friendly choices', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByRole('link', { name: 'Report a concern about this lesson', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/dashboard/report-concern\\?lessonId=${lessonId}$`));
  await expect(page.getByRole('heading', { name: 'Tell us if something feels wrong' })).toBeVisible();
  await expect(page.getByText(`Reporting from lesson: Give clear instructions`)).toBeVisible();
  const descriptionLabel = page.locator('label[for="description"]');
  const descriptionField = page.getByLabel('Tell us what happened');
  const [labelBox, fieldBox] = await Promise.all([descriptionLabel.boundingBox(), descriptionField.boundingBox()]);
  expect(labelBox).not.toBeNull(); expect(fieldBox).not.toBeNull();
  expect(labelBox!.y + labelBox!.height).toBeLessThanOrEqual(fieldBox!.y);
  expect(Math.abs(labelBox!.x - fieldBox!.x)).toBeLessThanOrEqual(2);
  await page.getByLabel(/^Bullying/).check();
  await page.getByLabel('Tell us what happened').fill('Someone kept sending me hurtful messages during the lesson.');
  await page.getByRole('button', { name: 'Send my report', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Your report has been sent' })).toBeVisible();
  expect(state.writes.find((write) => write.path === 'incidents')!.body).toMatchObject({
    school_id: schoolId, reported_by: userId, learner_code: null, severity: 'medium',
  });
  expect(String(state.writes.find((write) => write.path === 'incidents')!.body.description)).toContain('Concern type: bullying');
  expect(String(state.writes.find((write) => write.path === 'incidents')!.body.description)).toContain(`Lesson: Give clear instructions (${lessonId})`);
});

test('teacher dashboard and lesson pages keep the safeguarding flag visible', async ({ page }, testInfo) => {
  await mockDashboard(page, 'teacher');
  await page.goto('/dashboard');
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await expect(page.getByRole('link', { name: 'Report a concern', exact: true })).toBeVisible();
  await page.goto(`/dashboard/school/lessons/${lessonId}`);
  await expect(page.getByRole('link', { name: 'Report a concern about this lesson', exact: true })).toBeVisible();
});

test('lesson video exposes captions, written instructions and a visible transcript', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  Object.assign(state.lessons[0].learning_plan, { delivery: 'blockly' });
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  const media = page.getByRole('region', { name: 'Accessible lesson media', exact: true });
  await expect(media.getByText('CC Captions', { exact: true })).toBeVisible();
  await expect(media.getByText('Written transcript', { exact: true })).toBeVisible();
  await expect(media.getByText(/1\. Read your mission/)).toBeVisible();
  await expect(media.getByText(/First, read your mission/)).toBeVisible();
  await expect(media.locator('video')).toHaveAttribute('poster', '/lesson-media/lesson-orientation-poster.svg');
  await expect(media.locator('video track[kind="captions"]')).toHaveAttribute('src', 'http://127.0.0.1:4187/lesson-media/lesson-orientation.vtt');
  await expect.poll(() => media.locator('video').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(1);
  await expect.poll(() => media.locator('video').evaluate((video: HTMLVideoElement) => video.textTracks[0]?.mode)).toBe('showing');
  expect((await new AxeBuilder({ page }).include('.learning-zone').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
});

test('a teacher reviews submitted work and saves feedback linked to that submission', async ({ page }) => {
  const state = await mockDashboard(page, 'teacher');
  state.submissions.push({ id: 'submission-one', assignment_id: assignmentId, student_id: studentId,
    evidence_text: 'Learner sequence and test results.', reflection: 'I changed one step.', submitted_at: '2026-10-05T09:00:00Z' });
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByRole('button', { name: 'Review submitted work', exact: true }).click();
  await page.getByLabel('Plan a solution', { exact: true }).selectOption('demonstrated');
  await page.getByLabel('Feedback and next step').fill('Try a different input next.');
  await page.getByRole('button', { name: 'Save submission review', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Evidence review saved.' })).toBeVisible();
  expect(state.evidence[0].submission_id).toBe('submission-one');
  expect(state.evidence[0].evidence_text).toBe('Learner sequence and test results.');
});

test('a learner runs Blockly, saves blocks and resumes their program after reload', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByRole('button', { name: 'Run program', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Hello, ChipuRobo!' })).toBeVisible();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Your blocks are saved.' })).toBeVisible();
  expect(state.draft!.code).toContain('Hello, ChipuRobo!');
  await page.reload();
  await expect(page.getByRole('status').filter({ hasText: 'Hello, ChipuRobo!' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit text: Hello, ChipuRobo!', exact: true }).dblclick();
  await page.locator('.blocklyHtmlInput').fill('My changed program');
  await page.locator('.blocklyHtmlInput').press('Enter');
  await page.getByRole('button', { name: 'Run program', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'My changed program' })).toBeVisible();
  await page.getByLabel('What did you make?').fill('I changed the output and tested it.');
  await page.getByRole('button', { name: /^Send / }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sent!' })).toBeVisible();
  expect(state.submissions[0].generated_code).toContain('My changed program');
  expect(state.submissions[0].run_output).toBe('My changed program');
});

test('a failed Blockly save keeps the workspace and does not claim success', async ({ page }) => {
  const state = await mockDashboard(page, 'learner'); state.failPrograms = true;
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Program could not be saved. Try again.');
  await expect(page.getByRole('status').filter({ hasText: 'Your blocks are saved.' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Run program', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Hello, ChipuRobo!' })).toBeVisible();
});

test('Blockly stops an infinite loop and keeps the dashboard responsive', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  state.draft = { workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'controls_whileUntil', fields: { MODE: 'WHILE' },
    inputs: { BOOL: { block: { type: 'logic_boolean', fields: { BOOL: 'TRUE' } } } } }] } }, code: 'while(true){}', output: '' };
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByRole('button', { name: 'Run program', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText(/Program stopped|paused it/);
  await expect(page.getByRole('button', { name: 'Run program', exact: true })).toBeEnabled();
  await page.getByLabel('What did you make?').fill('I need to fix my loop.');
});

test('teachers open the submitted Blockly blocks and output for review', async ({ page }) => {
  const state = await mockDashboard(page, 'teacher');
  state.submissions.push({ id: 'submission-blocks', assignment_id: assignmentId, student_id: studentId,
    evidence_text: 'My Blockly sequence.', submitted_at: '2026-10-05T09:00:00Z',
    blockly_workspace: { blocks: { languageVersion: 0, blocks: [{ type: 'text_print', inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Saved output' } } } } }] } },
    generated_code: 'window.alert("Saved output");', run_output: 'Saved output' });
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await page.getByText('View submitted Blockly program', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Submitted Blockly program', exact: true }).locator('.blocklyText').filter({ hasText: 'Saved output' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: 'Saved output' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run program', exact: true })).toHaveCount(0);
});

test('learners edit Blockly using the keyboard and can leave the workspace', async ({ page }) => {
  await mockDashboard(page, 'learner');
  await page.goto(`/dashboard/assignments/${assignmentId}`);
  await expect(page.getByRole('button', { name: 'Run program', exact: true })).toBeEnabled();
  await page.getByRole('region', { name: 'Blocks workspace.', exact: true }).focus();
  await page.keyboard.press('t');
  await expect(page.getByRole('treeitem', { name: 'Output and text', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape');
  const run = page.getByRole('button', { name: 'Run program', exact: true });
  for (let index = 0; index < 8 && !await run.evaluate((element) => element === document.activeElement); index++) await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Run program', exact: true })).toBeFocused();
});

test('a learner chooses one of twenty lessons and starts its Blockly workspace', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  for (let index = 0; index < 20; index++) state.lessons.push({ ...state.lessons[0], id: `course-${index}`, title: `Blockly exercise ${index + 1}`,
    learning_plan: { ...plan, delivery: 'blockly', level: index < 8 ? 'beginner' : index < 15 ? 'intermediate' : 'expert' } });
  await page.goto('/dashboard');
  const catalog = page.getByRole('region', { name: 'Blockly lessons', exact: true });
  await expect(catalog.getByRole('article')).toHaveCount(20);
  await page.getByRole('radio', { name: 'Expert', exact: true }).check();
  await expect(catalog.getByRole('article')).toHaveCount(5);
  await catalog.getByRole('article', { name: 'Blockly lesson: Blockly exercise 16', exact: true }).getByRole('button', { name: /^Start / }).click();
  await expect(page.getByRole('heading', { name: 'Blockly exercise 16', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run program', exact: true })).toBeEnabled();
  expect(state.writes.find((write) => write.path === 'start_blockly_lesson')!.body).toEqual({ p_lesson_id: 'course-15' });
});

test('a learner starts a capstone project and submits its Blockly program for review', async ({ page }) => {
  const state = await mockDashboard(page, 'learner');
  const capstone = { ...state.lessons[0], id: 'capstone-one', title: 'Capstone: routine guide', kind: 'project',
    learning_plan: { ...plan, delivery: 'blockly', activityKind: 'capstone', requirements: ['Print four clear steps.'] } };
  state.lessons.push(capstone);
  await page.goto('/dashboard/my-projects');
  await expect(page.getByRole('heading', { name: 'Big projects', exact: true, level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).include('.learning-zone').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('button', { name: /^Start / }).click();
  await expect(page.getByRole('heading', { name: 'Mission', exact: true })).toBeVisible();
  await expect(page.getByText('Print four clear steps.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Run program', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Hello, ChipuRobo!' })).toBeVisible();
  await page.getByLabel('What did you make?').fill('My project program and test record.');
  await page.getByRole('button', { name: /^Send / }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sent!' })).toBeVisible();
  expect(state.submissions[0].assignment_id).toBe('started-capstone-one');
  expect(state.submissions[0].blockly_workspace).toBeTruthy();
  await page.getByRole('link', { name: 'Back to Projects', exact: true }).click();
  await expect(page.getByRole('link', { name: /^Continue / })).toBeVisible();
});

test('admin creates a learner login linked to the selected roster student', async ({ page }) => {
  const state = await mockDashboard(page, 'admin');
  await page.goto('/dashboard/admin/learning-accounts');
  await page.getByLabel('School', { exact: true }).selectOption(schoolId);
  await page.getByLabel('Account type').selectOption('learner');
  await page.getByLabel('Learner on the roster').selectOption(studentId);
  await expect(page.getByLabel('Initial password')).toHaveCount(0);
  await page.getByRole('button', { name: 'Create login', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Learner login created: test-0001.' })).toBeVisible();
  expect(state.writes.find((write) => write.path === 'admin_create_learner_login')!.body).toMatchObject({ p_student_id: studentId });
});

for (const role of ['teacher', 'learner'] as const) {
  test(`${role} cannot navigate into school operations`, async ({ page }) => {
    await mockDashboard(page, role);
    await page.goto('/dashboard/school/orders');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'My orders', exact: true })).toHaveCount(0);
  });
}

for (const journey of ['login', 'learner-home', 'learner-submission', 'learning-account']) {
  test(`${journey} controls have no automated WCAG AA violations`, async ({ page }) => {
    if (journey === 'login') {
      await mockDashboard(page, 'learner', false);
      await page.goto('/dashboard/login');
      await page.getByRole('radio', { name: 'Learner', exact: true }).check();
    } else {
      await mockDashboard(page, journey === 'learning-account' ? 'admin' : 'learner');
      await page.goto(journey === 'learning-account' ? '/dashboard/admin/learning-accounts' : journey === 'learner-submission' ? `/dashboard/assignments/${assignmentId}` : '/dashboard');
      if (journey === 'learning-account') {
        await page.getByLabel('School', { exact: true }).selectOption(schoolId);
        await page.getByLabel('Account type').selectOption('learner');
      } else if (journey === 'learner-submission') {
        await expect(page.getByRole('form', { name: 'My submission', exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Run program', exact: true })).toBeEnabled();
      } else await expect(page.getByRole('link', { name: /^Start / })).toBeVisible();
    }
    const results = await new AxeBuilder({ page }).include(journey === 'login' ? '.login-page' : '.learning-zone').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}


test('teacher progress retains the competency matrix, evidence links and level review',async({page})=>{
 const state=await mockDashboard(page,'teacher');
 state.evidence=[{id:'review',assignment_id:assignmentId,student_id:studentId,reviews:{algorithms:'demonstrated'},recorded_at:'2026-10-05T12:00:00Z'}];
 await page.goto('/dashboard/school/progress');
 await expect(page.getByRole('link',{name:'Demonstrated',exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Beginner',exact:true})).toBeVisible();
 await expect(page.getByRole('combobox',{name:'Review learning level',exact:true})).toBeVisible();
 await expect(page.getByRole('form',{name:'Record progression decision',exact:true})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
});

test('learner progress shows submitted activities and teacher feedback without the teacher review workflow',async({page})=>{
 const state=await mockDashboard(page,'learner');const requests:string[]=[];
 page.on('request',request=>requests.push(new URL(request.url()).pathname));
 state.submissions=[{id:'submission-one',assignment_id:assignmentId,student_id:studentId,submitted_at:'2026-10-05T10:00:00Z'}];
 state.evidence=[{id:'review',assignment_id:assignmentId,student_id:studentId,reviews:{algorithms:'demonstrated'},feedback:'Try a different sequence and explain what changed.',recorded_at:'2026-10-05T12:00:00Z'}];
 await page.goto('/dashboard/my-progress');
 const activity=page.getByRole('article',{name:'Activity progress: Give clear instructions',exact:true});
 await expect(activity.getByText('Teacher replied',{exact:true})).toBeAttached();
 await expect(activity.getByText('Try a different sequence and explain what changed.',{exact:true})).toBeVisible();
 await expect(activity.getByRole('link',{name:/^Feedback /})).toHaveAttribute('href',`/dashboard/assignments/${assignmentId}`);
 await expect(page.getByRole('heading',{name:'Level progression',exact:true})).toHaveCount(0);
 await expect(page.getByRole('combobox',{name:'Review learning level',exact:true})).toHaveCount(0);
 await expect(page.getByRole('region',{name:'Beginner',exact:true})).toHaveCount(0);
 await expect(page.getByRole('form',{name:'Record progression decision',exact:true})).toHaveCount(0);
 expect(requests.some(path=>/learning_progression_readiness|learning_progression_decisions/.test(path))).toBe(false);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await activity.getByRole('link',{name:/^Feedback /}).click();
 await expect(page).toHaveURL(new RegExp(`/dashboard/assignments/${assignmentId}$`));
 await page.goto('/dashboard/school/progress');
 await expect(page).toHaveURL('/dashboard');
 await expect(page.getByRole('heading',{name:'Hi, Test!',exact:true})).toBeVisible();
});

test('a learner resubmission awaits feedback while preserving earlier teacher feedback',async({page})=>{
 const state=await mockDashboard(page,'learner');
 state.submissions=[{id:'submission-two',assignment_id:assignmentId,student_id:studentId,submitted_at:'2026-10-06T10:00:00Z'}];
 state.evidence=[{id:'review',assignment_id:assignmentId,student_id:studentId,feedback:'Please test a second case.',recorded_at:'2026-10-05T12:00:00Z',reviews:{debugging:'developing'}}];
 await page.goto('/dashboard/my-progress');
 const activity=page.getByRole('article',{name:'Activity progress: Give clear instructions',exact:true});
 await expect(activity.getByText('Sent to teacher',{exact:true})).toBeAttached();
 await expect(activity.getByText('Please test a second case.',{exact:true})).toBeVisible();
 await expect(activity.getByText('Teacher replied',{exact:true})).toHaveCount(0);
});

test('teacher home provides real inline assignment and lesson actions',async({page})=>{
 const state=await mockDashboard(page,'teacher');await page.goto('/dashboard');
 const section=page.getByRole('region',{name:'Quick lesson actions'});
 await expect(section.getByRole('link',{name:'Open lesson',exact:true})).toHaveAttribute('href',`/dashboard/school/lessons/${lessonId}`);
 await section.getByRole('button',{name:'Assign lesson',exact:true}).click();
 const form=page.getByRole('form',{name:'Assign Give clear instructions'});
 await form.getByLabel('Test Learner',{exact:true}).check();await form.getByRole('button',{name:'Assign to selected students'}).click();
 await expect(page).toHaveURL(new RegExp(`/dashboard/assignments/${assignmentId}$`));expect(state.writes.some(w=>w.path==='assign_learning_lesson')).toBeTruthy();
});

test('learner completes an accessible knowledge check and sees versioned feedback',async({page})=>{
 const state=await mockDashboard(page,'learner');await page.goto('/dashboard/quizzes');
 await page.getByRole('button',{name:/^Play /}).click();
 const form=page.getByRole('form',{name:'Answer Beginner knowledge check'});
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await form.getByRole('radio',{name:'An algorithm',exact:true}).check();await form.getByRole('button',{name:/^Check /}).click();
 await expect(page.getByRole('region',{name:'Quiz results'}).getByText(/100%/).first()).toBeVisible();expect(state.attempts).toHaveLength(1);
 await page.getByText('Answers',{exact:true}).click();await expect(page.getByText('An algorithm describes ordered steps.')).toBeVisible();
});

test('learner curates and exports an accessible private portfolio without deleting submissions',async({page})=>{
 const state=await mockDashboard(page,'learner');state.submissions=[{id:'submission-one',assignment_id:assignmentId,student_id:studentId,evidence_text:'My sequence and retest.',reflection:'I revised the order.',submitted_at:'2026-10-05T12:00:00Z'}];
 await page.goto('/dashboard/portfolio');await page.getByRole('combobox',{name:'Work',exact:true}).selectOption('submission-one');
 await page.getByRole('textbox',{name:'Title',exact:true}).fill('My tested sequence');await page.getByRole('textbox',{name:'Why?',exact:true}).fill('I explained the correction.');
 await page.getByRole('button',{name:/^Add /}).click();await expect(page.getByRole('heading',{name:'My tested sequence'})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:/^Download /}).click();expect((await download).suggestedFilename()).toBe('chipurobo-portfolio.json');
 await page.getByRole('button',{name:/^Remove /}).click();await expect(page.getByRole('heading',{name:'My tested sequence'})).toHaveCount(0);expect(state.submissions).toHaveLength(1);
});

test('teacher records an explicit evidence-backed progression decision',async({page})=>{
 const state=await mockDashboard(page,'teacher');Object.assign(state.readiness,{ready:true,missing_competencies:[],quiz_attempt_id:'attempt-one',capstone_review_id:'review-one'});
 await page.goto('/dashboard/school/progress');await page.getByRole('combobox',{name:'Progression decision',exact:true}).selectOption('awarded');await page.getByLabel('Decision reason and next steps').fill('Reviewed the quiz, practical work and capstone. Practise intermediate loops next.');await page.getByRole('button',{name:'Save progression decision'}).click();
 await expect(page.getByText('Beginner: awarded',{exact:true})).toBeVisible();expect(state.decisions[0]).toMatchObject({student_id:studentId,level:'beginner',outcome:'awarded'});
});

test('reporting provides scoped counts, attendance, task observations and a CSV export',async({page})=>{
 const state=await mockDashboard(page,'teacher');await page.goto('/dashboard/learning-reports');
 await expect(page.getByText(/Dates are inclusive in UTC/)).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export report CSV'}).click();expect((await download).suggestedFilename()).toBe('chipurobo-learning-report.csv');
 const attendance=page.getByRole('form',{name:'Learning attendance'});await attendance.getByRole('combobox',{name:'Test Learner',exact:true}).selectOption('true');await attendance.getByRole('button',{name:'Save learning attendance'}).click();await expect(page.getByText('Learning attendance saved.')).toBeVisible();
 const observation=page.getByRole('form',{name:'Core task observation'});await observation.getByRole('combobox',{name:'Observed learner',exact:true}).selectOption(studentId);await observation.getByRole('button',{name:'Save task observation'}).click();await expect(page.getByText('Task observation saved.')).toBeVisible();expect(state.writes.some(w=>w.path==='record_learning_task_observation')).toBeTruthy();
});
