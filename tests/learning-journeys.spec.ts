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

async function mockDashboard(page: Page, role: 'admin' | 'school_lead' = 'school_lead') {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const user = { id: userId, aud: 'authenticated', role: 'authenticated', email: 'teacher@example.test',
    app_metadata: {}, user_metadata: {}, created_at: '2026-10-01T00:00:00Z' };
  const session = { access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: 4102444800, role: 'authenticated' })}.test-signature`,
    refresh_token: 'test-refresh-token', expires_at: 4102444800, expires_in: 86400, token_type: 'bearer', user };
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-127-auth-token', JSON.stringify(session));
    localStorage.setItem('chipurobo:onboarding-seen', '1');
  }, { session });
  const lesson = { id: lessonId, title: 'Give clear instructions', description: 'Plan and test a sequence.',
    kind: 'lesson', level: 'both', points: 1, position: 1, is_active: true, learning_plan: structuredClone(plan), resource_url: null };
  const assignment = { id: assignmentId, school_id: schoolId, lesson_id: lessonId, title: lesson.title,
    instructions: 'Work in pairs, then explain your own solution.', due_date: null as string | null, learning_plan: structuredClone(plan), assigned_by: userId, created_at: '2026-10-05T09:00:00Z' };
  const state = {
    lessons: [lesson], assignments: [assignment], recipients: [{ assignment_id: assignmentId, student_id: studentId }],
    evidence: [] as Record<string, unknown>[], writes: [] as { path: string; body: Record<string, unknown> }[], failReviews: false,
  };
  await page.route('http://127.0.0.1:54321/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.split('/').at(-1)!;
    const body = request.postDataJSON() as Record<string, unknown> | null;
    if (request.method() === 'HEAD') {
      await route.fulfill({ status: 200, headers: { 'content-range': '*/0' }, body: '' }); return;
    }
    if (request.method() === 'POST' || request.method() === 'PATCH') state.writes.push({ path, body: body ?? {} });
    if (path === 'assign_learning_lesson') {
      assignment.instructions = String(body!.p_instructions);
      assignment.due_date = body!.p_due_date as string | null;
      state.recipients = (body!.p_student_ids as string[]).map((id) => ({ assignment_id: assignmentId, student_id: id }));
      await route.fulfill({ json: assignmentId }); return;
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
    if (path === 'profiles') rows = [{ id: userId, role, full_name: 'Test Teacher', school_id: role === 'admin' ? null : schoolId }];
    if (path === 'schools') rows = [{ id: schoolId, name: 'Test School', is_maker_space: false }];
    if (path === 'club_members') rows = [{ id: studentId, school_id: schoolId, full_name: 'Test Learner', learner_code: 'L-001', is_active: true, in_club: true }];
    if (path === 'lessons') rows = state.lessons;
    if (path === 'learning_assignments') rows = state.assignments.filter((row) => !url.searchParams.has('id') || url.searchParams.get('id') === `eq.${row.id}`);
    if (path === 'learning_assignment_recipients') rows = state.recipients;
    if (path === 'competency_evidence') rows = state.evidence;
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
  await page.getByRole('button', { name: 'Add lesson', exact: true }).click();
  await expect(page.getByRole('form', { name: 'New lesson' })).toHaveCount(0);
  const write = state.writes.find((item) => item.path === 'lessons')!;
  expect(write.body.learning_plan).toMatchObject({ level: 'intermediate', frameworkVersion: '0.1', competencyIds: ['algorithms', 'debugging', 'communication'] });
  expect(state.lessons).toHaveLength(2);
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
  const state = await mockDashboard(page);
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
