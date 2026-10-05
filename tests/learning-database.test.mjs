import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real PostgreSQL execution of this migration against minimal existing tables.
// This isolates the new schema/RPC/RLS checks without a hosted database.
const db = new PGlite();
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const plan = { frameworkVersion: '0.1', pathwayId: 'creative-coding', level: 'beginner',
  competencyIds: ['algorithms', 'debugging'], steps: ['Write a sequence.', 'Test it.'], evidenceBrief: 'Show the sequence and explain a correction.' };
let assignmentId;
async function asUser(userId, role = 'authenticated') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? '']);
  await db.exec(`set role ${role}`);
}
const assign = (school = 101, students = [201]) => db.query(
  'select public.assign_learning_lesson($1,$2,$3,$4,$5) as id',
  [id(301), id(school), students.map(id), 'Build and explain.', '2026-10-12']);
const review = (overrides = {}) => {
  const args = { student: id(201), text: 'Explained and tested an ordered sequence.',
    url: null, feedback: 'Try a second input.', reviews: { algorithms: 'demonstrated' }, ...overrides };
  return db.query('select public.record_competency_evidence($1,$2,$3,$4,$5,$6) as id',
    [assignmentId, args.student, args.text, args.url, args.feedback, JSON.stringify(args.reviews)]);
};

before(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    create type public.user_role as enum ('admin','school_lead');
    create table public.schools(id uuid primary key);
    create table public.profiles(id uuid primary key, role public.user_role, school_id uuid references public.schools);
    create table public.club_members(id uuid primary key, school_id uuid references public.schools, is_active boolean);
    create table public.lessons(id uuid primary key, title text, is_active boolean);
    insert into public.schools values ('${id(101)}'), ('${id(102)}');
    insert into public.profiles values ('${id(1)}', 'admin', null), ('${id(2)}', 'school_lead', '${id(101)}'), ('${id(3)}', 'school_lead', '${id(102)}');
    insert into public.club_members values ('${id(201)}', '${id(101)}', true), ('${id(202)}', '${id(102)}', true), ('${id(203)}', '${id(101)}', false);
    insert into public.lessons values ('${id(301)}', 'Give clear instructions', true);
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/20261005000000_dashboard_learning_actions.sql', import.meta.url), 'utf8'));
  await db.query('update public.lessons set learning_plan = $1 where id = $2', [JSON.stringify(plan), id(301)]);
});
after(async () => { await db.close(); });

test('learning plan constraints reject unknown stages, missing outcomes and malformed JSON', async () => {
  await asUser(null, 'postgres');
  for (const invalid of [null, {}, { ...plan, level: 'grade10' }, { ...plan, competencyIds: ['invented'] },
    { ...plan, competencyIds: ['algorithms', 'algorithms'] }, { ...plan, steps: [] },
    { ...plan, steps: [null] }, { ...plan, evidenceBrief: '' }]) {
    const { rows } = await db.query('select public.valid_lesson_learning_plan($1) as valid', [JSON.stringify(invalid)]);
    assert.equal(rows[0].valid, false);
  }
});

test('anonymous callers cannot create assignments or read evidence', async () => {
  await asUser(null, 'anon');
  await assert.rejects(assign(), /permission denied/);
  await assert.rejects(db.query('select * from public.competency_evidence'), /permission denied/);
});

test('school leads assign only distinct active students from their own school, atomically', async () => {
  await asUser(id(2));
  await assert.rejects(assign(102, [202]), /cannot assign/);
  for (const recipients of [[], [202], [203], [201, 202], [201, 201], [999]]) {
    await assert.rejects(assign(101, recipients), /active student|Select between/);
  }
  assert.equal((await db.query('select count(*)::int as n from public.learning_assignments')).rows[0].n, 0);
  assignmentId = (await assign()).rows[0].id;
  const recipients = await db.query('select * from public.learning_assignment_recipients');
  assert.equal(recipients.rows.length, 1);
  assert.equal(recipients.rows[0].student_id, id(201));
  await assert.rejects(db.query('insert into public.learning_assignments default values'), /permission denied/);
});

test('a review requires individual assignment, evidence, feedback and a valid selected competency', async () => {
  await asUser(id(2));
  for (const invalid of [{ student: id(202) }, { text: '' }, { feedback: '' }, { url: 'javascript:alert(1)' },
    { reviews: {} }, { reviews: { robotics: 'demonstrated' } }, { reviews: { algorithms: 'expert' } }]) {
    await assert.rejects(review(invalid));
  }
  assert.equal((await db.query('select count(*)::int as n from public.competency_evidence')).rows[0].n, 0);
  await review();
  await review({ reviews: { algorithms: 'developing' }, feedback: 'Revisit ordering.' });
  assert.equal((await db.query('select count(*)::int as n from public.competency_evidence')).rows[0].n, 2);
  await assert.rejects(db.query('delete from public.competency_evidence'), /permission denied/);
});

test('assignments preserve the plan in use and other schools cannot read or review their work', async () => {
  await asUser(null, 'postgres');
  await db.query('update public.lessons set title = $1, learning_plan = $2 where id = $3',
    ['A changed lesson', JSON.stringify({ ...plan, level: 'expert' }), id(301)]);
  await asUser(id(2));
  const { rows } = await db.query('select * from public.learning_assignments');
  assert.equal(rows[0].learning_plan.level, 'beginner');
  assert.equal(rows[0].title, 'Give clear instructions');
  await asUser(id(3));
  for (const table of ['learning_assignments', 'learning_assignment_recipients', 'competency_evidence']) {
    assert.deepEqual((await db.query(`select * from public.${table}`)).rows, []);
  }
  await assert.rejects(review(), /cannot review/);
  await asUser(id(1));
  assert.equal((await db.query('select * from public.competency_evidence')).rows.length, 2);
  await assign(102, [202]);
});

test('existing account and school deletion can remove actors without breaking evidence history', async () => {
  await asUser(null, 'postgres');
  await db.query('delete from public.profiles where id = $1', [id(2)]);
  assert.equal((await db.query('select assigned_by from public.learning_assignments where id = $1', [assignmentId])).rows[0].assigned_by, null);
  assert.equal((await db.query('select recorded_by from public.competency_evidence where assignment_id = $1', [assignmentId])).rows[0].recorded_by, null);
  await db.query('delete from public.club_members where school_id = $1', [id(101)]);
  await db.query('delete from public.schools where id = $1', [id(101)]);
  assert.equal((await db.query('select * from public.competency_evidence')).rows.length, 0);
});
