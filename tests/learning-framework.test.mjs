import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Use the project's compiler so the same checks run on Node 20 in CI and
// newer local runtimes without a second TypeScript test runner.
const source = await readFile(new URL('../src/lib/learningFramework.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
});
const {
  competencies,
  findLearningActivity,
  getActivityCompetencies,
  learningActivities,
  learningFramework,
  learningLevels,
  learningPathways,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('every activity has a stable unique ID, pathway, learning level and usable evidence brief', () => {
  assert.equal(new Set(learningActivities.map((item) => item.id)).size, learningActivities.length);
  for (const activity of learningActivities) {
    assert.ok(
      learningPathways.some((item) => item.id === activity.pathwayId),
      activity.id,
    );
    assert.ok(
      learningLevels.some((item) => item.id === activity.level),
      activity.id,
    );
    assert.ok(activity.competencyIds.length > 0, activity.id);
    assert.equal(new Set(activity.competencyIds).size, activity.competencyIds.length);
    assert.equal(getActivityCompetencies(activity).length, activity.competencyIds.length);
    assert.ok(
      activity.steps.length >= 3 && activity.steps.every((step) => step.trim()),
      activity.id,
    );
    assert.ok(
      activity.materials.length &&
        activity.teacherNotes.length &&
        activity.artifact &&
        activity.reviewPrompt,
      activity.id,
    );
  }
});

test('each pathway can be explored at every progression level without an empty filter result', () => {
  for (const pathway of learningPathways)
    for (const level of learningLevels) {
      assert.ok(
        learningActivities.some((item) => item.pathwayId === pathway.id && item.level === level.id),
        `${pathway.id}/${level.id}`,
      );
    }
});

test('every competency is practised at each level and carries a curriculum reference', () => {
  assert.equal(new Set(competencies.map((item) => item.id)).size, competencies.length);
  for (const competency of competencies) {
    assert.ok(competency.curriculumReferences.length > 0);
    for (const level of learningLevels) {
      assert.ok(competency.outcomes[level.id]);
      assert.ok(
        learningActivities.some(
          (item) => item.level === level.id && item.competencyIds.includes(competency.id),
        ),
        `${competency.id}/${level.id}`,
      );
    }
  }
});

test('unknown activity links return no content rather than another learner task', () => {
  assert.equal(findLearningActivity('missing'), undefined);
  assert.equal(findLearningActivity(undefined), undefined);
  assert.equal(findLearningActivity('first-sequence')?.id, 'first-sequence');
});

test('external resource boundaries and unapproved source scope stay explicit', () => {
  assert.equal(learningFramework.status, 'draft');
  assert.equal(learningFramework.referenceGrade, 10);
  assert.match(learningFramework.source.verification, /ChipuRobo adaptations/);
  for (const activity of learningActivities)
    if (activity.resource) {
      assert.equal(activity.resource.provider, 'Raspberry Pi Foundation');
      assert.equal(new URL(activity.resource.url).hostname, 'projects.raspberrypi.org');
      assert.equal(new URL(activity.resource.url).protocol, 'https:');
    }
});
