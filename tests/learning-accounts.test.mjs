import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const id = (n) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const plan = { frameworkVersion: '0.1', pathwayId: 'creative-coding', level: 'beginner', competencyIds: ['algorithms'], steps: ['Write steps.', 'Test them.'], evidenceBrief: 'Explain your sequence.' };
let teacher; let learner; let peer; let otherTeacher; let assignment; let submission;
async function asUser(user, role = 'authenticated') {
  await db.exec('reset role'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [user ?? '']); await db.exec(`set role ${role}`);
}
async function create(role, login, student = null, learners = []) {
  return (await db.query('select public.admin_create_learning_account($1,$2,$3,$4,$5,$6,$7) as account',
    [id(101), role, login, 'TestPassword123', 'Teacher Test', student && id(student), learners.map(id)])).rows[0].account.user_id;
}
const assign = (students = [201, 202]) => db.query('select public.assign_learning_lesson($1,$2,$3,$4,$5) as id', [id(301), id(101), students.map(id), 'Try and explain.', null]);
const submit = () => db.query('select public.submit_learning_work($1,$2,$3,$4) as id', [assignment, 'My sequence and a correction.', 'https://example.test/work', 'I fixed the order.']);

before(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public,auth to anon,authenticated;
    create type public.user_role as enum('admin','school_lead');
    create table public.schools(id uuid primary key,name text,type text);
    create table auth.users(id uuid primary key,email text unique);
    create table public.profiles(id uuid primary key,role public.user_role default 'school_lead',school_id uuid references public.schools,full_name text);
    create table public.club_members(id uuid primary key,school_id uuid references public.schools,full_name text,grade text,learner_code text,is_active boolean default true,in_club boolean default true);
    create table public.lessons(id uuid primary key,title text,is_active boolean);
    create table public.orders(id uuid primary key,school_id uuid);
    create function public.me_is_admin() returns boolean language sql stable security definer as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
    create function public.me_school_id() returns uuid language sql stable security definer as $$ select school_id from public.profiles where id=auth.uid() $$;
    create function public.mint_login(p_email text,p_password text,p_name text) returns uuid language plpgsql security definer as $$
      declare v_id uuid:=gen_random_uuid(); begin
        if length(p_password)<8 or p_email not like '%@%.%' then raise exception 'Invalid credentials'; end if;
        insert into auth.users values(v_id,lower(p_email)); insert into public.profiles(id,full_name) values(v_id,p_name); return v_id;
      end; $$;
    revoke all on function public.mint_login(text,text,text) from public,anon,authenticated;
    insert into public.schools values('${id(101)}','School One','mainstream'),('${id(102)}','School Two','mainstream');
    insert into public.profiles values('${id(1)}','admin',null,'Admin'),('${id(2)}','school_lead','${id(101)}','Lead');
    insert into public.club_members(id,school_id,full_name) values('${id(201)}','${id(101)}','Learner One'),('${id(202)}','${id(101)}','Learner Two'),('${id(203)}','${id(101)}','Learner Three'),('${id(204)}','${id(102)}','Other School Learner');
    insert into public.lessons values('${id(301)}','Test learning task',true);
    insert into public.orders values('${id(401)}','${id(101)}');
    alter table public.club_members enable row level security;
    create policy club_members_all on public.club_members to authenticated using(public.me_is_admin() or school_id=public.me_school_id()) with check(public.me_is_admin() or school_id=public.me_school_id());
    alter table public.orders enable row level security;
    create policy orders_all on public.orders to authenticated using(public.me_is_admin() or school_id=public.me_school_id()) with check(public.me_is_admin() or school_id=public.me_school_id());
    grant select,insert,update,delete on public.club_members,public.orders to authenticated;
  `);
  for (const name of ['20261005000000_dashboard_learning_actions.sql','20261005000001_learning_account_roles.sql','20261005000002_learning_accounts_and_submissions.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  }
  await db.query('update public.lessons set learning_plan=$1', [JSON.stringify(plan)]);
});
after(async () => { await db.close(); });

test('only admins provision identities, bind learner accounts and allocate teaching groups', async () => {
  await asUser(null,'anon'); await assert.rejects(create('teacher','anonymous@example.test'), /permission denied/);
  await asUser(id(2)); await assert.rejects(create('teacher','lead@example.test'), /Admin access/);
  await asUser(id(1));
  teacher = await create('teacher','teacher@example.test',null,[201,202]);
  learner = await create('learner','learner.one',201); peer = await create('learner','learner.two',202);
  otherTeacher = await create('teacher','other.teacher@example.test',null,[203]);
  await assert.rejects(create('learner','another.username',201), /unique constraint/);
  await assert.rejects(create('teacher','cross.school@example.test',null,[204]), /teacher's school/);
  const accounts=(await db.query('select public.admin_list_learning_accounts($1) as accounts',[id(101)])).rows[0].accounts;
  assert.equal(accounts.length,4); assert.ok(accounts.some((account)=>account.login==='learner.one'));
});

test('new roles cannot inherit legacy school-wide roster and order permissions', async () => {
  for (const user of [teacher,learner]) {
    await asUser(user);
    assert.equal((await db.query('select public.me_school_id() as school')).rows[0].school,null);
    assert.deepEqual((await db.query('select * from public.orders')).rows,[]);
    assert.deepEqual((await db.query('select * from public.club_members')).rows,[]);
    await assert.rejects(db.query('insert into public.orders values($1,$2)',[id(402),id(101)]),/row-level security/);
  }
  await asUser(id(2)); assert.equal((await db.query('select * from public.orders')).rows.length,1);
});

test('teachers work only with allocated learners and their own assignments', async () => {
  await asUser(teacher);
  const students=(await db.query('select public.get_my_learning_students($1) as students',[id(101)])).rows[0].students;
  assert.deepEqual(students.map((student)=>student.id).sort(),[id(201),id(202)]);
  await assert.rejects(assign([203]),/allocated/);
  assignment=(await assign()).rows[0].id;
  await assert.rejects(db.query('select public.admin_set_teacher_students($1,$2)',[teacher,[id(203)]]),/Admin access/);
  await asUser(otherTeacher);
  assert.deepEqual((await db.query('select * from public.learning_assignments')).rows,[]);
  await assert.rejects(db.query('select public.record_competency_evidence($1,$2,$3,$4,$5,$6)',[assignment,id(201),'Forbidden evidence',null,'Feedback','{"algorithms":"demonstrated"}']),/cannot review/);
});

test('learner submissions are bound to authenticated identity and classmates remain private', async () => {
  await asUser(learner);
  assert.equal((await db.query('select * from public.learning_assignments')).rows.length,1);
  assert.deepEqual((await db.query('select * from public.learning_assignment_recipients')).rows.map((row)=>row.student_id),[id(201)]);
  submission=(await submit()).rows[0].id;
  assert.equal((await db.query('select * from public.learning_submissions')).rows[0].student_id,id(201));
  await assert.rejects(assign(),/cannot assign/);
  await assert.rejects(db.query('select public.review_learning_submission($1,$2,$3)',[submission,'Self-review','{"algorithms":"extending"}']),/cannot review/);
  await asUser(peer);
  assert.deepEqual((await db.query('select * from public.learning_submissions')).rows,[]);
  const peerSubmission=(await submit()).rows[0].id; assert.notEqual(peerSubmission,submission);
  await assert.rejects(db.query('delete from public.learning_submissions'),/permission denied/);
});

test('teacher reviews retain submitted evidence and feedback is private to its learner', async () => {
  await asUser(teacher);
  await db.query('select public.review_learning_submission($1,$2,$3)',[submission,'Your sequence works. Try another input.','{"algorithms":"demonstrated"}']);
  await asUser(learner);
  const review=(await db.query('select * from public.competency_evidence')).rows[0];
  assert.equal(review.submission_id,submission); assert.equal(review.evidence_text,'My sequence and a correction.');
  await asUser(peer); assert.deepEqual((await db.query('select * from public.competency_evidence')).rows,[]);
});

test('inactive learners lose assignment access and revoked teachers lose individual work access', async () => {
  await asUser(id(1)); await db.query('select public.admin_set_teacher_students($1,$2)',[teacher,[]]);
  await asUser(teacher); assert.deepEqual((await db.query('select * from public.learning_submissions')).rows,[]);
  assert.deepEqual((await db.query('select * from public.competency_evidence')).rows,[]);
  await asUser(id(1)); await db.query('update public.club_members set is_active=false where id=$1',[id(201)]);
  await asUser(learner); assert.deepEqual((await db.query('select * from public.learning_assignments')).rows,[]);
  await assert.rejects(submit(),/own assigned work/);
});
