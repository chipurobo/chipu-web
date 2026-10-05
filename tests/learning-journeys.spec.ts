import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  // No analytics or third-party traffic is necessary to test a learning task.
  await page.route(/googletagmanager|google-analytics|analytics\.google/, (route) => route.abort());
});

test('learner explores a level and activity, then returns with their filters intact', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/learning');
  await expect(page.getByRole('heading', { name: 'Learn, build and explain' })).toBeVisible();
  await page.getByLabel('Explore a learning level').selectOption('beginner');
  await expect(page.getByRole('status').filter({ hasText: '4 activities' })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open activity: Make an interactive story', exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole('link', { name: 'Open activity: Give clear instructions', exact: true })
    .click();
  const heading = page.getByRole('heading', { name: 'Give clear instructions', exact: true });
  await expect(heading).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Try the activity', exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Show what you learned', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Prepare and support the lesson', exact: true }),
  ).toHaveCount(0);
  await page.getByRole('link', { name: 'Learning pathways', exact: true }).click();
  await expect(page.getByLabel('Explore a learning level')).toHaveValue('beginner');
  await expect(page.getByRole('heading', { name: 'Learn, build and explain' })).toBeFocused();
  expect(errors).toEqual([]);
  if (testInfo.project.name === 'desktop')
    await page.screenshot({ path: '.context/learning-pathways.png' });
});

test('teacher preparation and resource boundaries remain visible through navigation', async ({
  page,
}) => {
  await page.goto('/learning?view=teacher&level=intermediate');
  await expect(page.getByRole('radio', { name: 'I’m teaching' })).toBeChecked();
  await page
    .getByRole('link', { name: 'Prepare activity: Make an interactive story', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Prepare and support the lesson', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('This resource belongs to Raspberry Pi Foundation', { exact: false }),
  ).toBeVisible();
  const resource = page.getByRole('link', { name: /Explore external coding projects/ });
  await expect(resource).toHaveAttribute('href', 'https://projects.raspberrypi.org/en');
  await expect(resource).toHaveAttribute('target', '_blank');
  await expect(
    page.getByText('This learning library does not yet save submissions', { exact: false }),
  ).toBeVisible();
  await page.getByRole('radio', { name: 'I’m learning' }).click();
  await expect(page.getByRole('radio', { name: 'I’m learning' })).toBeChecked();
  await expect(
    page.getByRole('heading', { name: 'Prepare and support the lesson', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('radio', { name: 'I’m learning' })).toBeChecked();
});

test('filters and guidance work using the keyboard', async ({ page }) => {
  await page.goto('/learning');
  const learner = page.getByRole('radio', { name: 'I’m learning' });
  await learner.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'I’m teaching' })).toBeChecked();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Explore a learning level')).toBeFocused();
  await page.keyboard.press('e');
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Explore a learning level')).toHaveValue('expert');
  const guidance = page.getByText('Accessible ways to learn and show your work', { exact: true });
  await guidance.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByText('Accessibility tools and communication support', { exact: false }),
  ).toBeVisible();
});

test('unknown links and malformed query values are handled without exposing a different task', async ({
  page,
}) => {
  await page.goto('/learning/activities/not-an-activity?view=admin&level=invalid');
  await expect(page.getByRole('heading', { name: 'Activity not found' })).toBeVisible();
  await page.getByRole('link', { name: 'Return to learning pathways' }).click();
  await expect(page.getByRole('radio', { name: 'I’m learning' })).toBeChecked();
  await expect(page.getByLabel('Explore a learning level')).toHaveValue('all');
});

for (const path of [
  '/learning',
  '/learning/activities/first-sequence',
  '/learning/activities/interactive-story?view=teacher',
]) {
  test(`learning task has no automated WCAG AA violations or horizontal overflow: ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await page.getByText('Accessible ways to learn and show your work', { exact: true }).click();
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      await page.locator('main').evaluate((main) =>
        [...main.querySelectorAll<HTMLElement>('*')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return box.width > 0 && (box.left < -1 || box.right > window.innerWidth + 1);
          })
          .map((element) => element.tagName),
      ),
    ).toEqual([]);
  });
}

test('closed mobile navigation does not put hidden links in the keyboard path', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile navigation only');
  await page.goto('/learning');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden();
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Learning', exact: true }).click();
  await expect(menu).toBeHidden();
});
