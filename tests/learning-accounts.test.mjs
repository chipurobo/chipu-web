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
    create table public.lessons(id uuid primary key,title text,is_active boolean,position integer,description text,kind text,points integer,level text,required_for_certificate boolean);
    grant select on public.lessons to authenticated;
    create table public.sessions(id uuid primary key default gen_random_uuid(),school_id uuid,activity_type text,session_date date,lesson_id uuid,delivered text,focus text,recorded_by uuid);
    create table public.session_attendance(id uuid primary key default gen_random_uuid(),session_id uuid,learner_id uuid,present boolean);
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
    insert into public.lessons(id,title,is_active) values('${id(301)}','Test learning task',true);
    insert into public.orders values('${id(401)}','${id(101)}');
    alter table public.club_members enable row level security;
    create policy club_members_all on public.club_members to authenticated using(public.me_is_admin() or school_id=public.me_school_id()) with check(public.me_is_admin() or school_id=public.me_school_id());
    alter table public.orders enable row level security;
    create policy orders_all on public.orders to authenticated using(public.me_is_admin() or school_id=public.me_school_id()) with check(public.me_is_admin() or school_id=public.me_school_id());
    grant select,insert,update,delete on public.club_members,public.orders to authenticated;
  `);
  for (const name of ['20261005000000_dashboard_learning_actions.sql','20261005000001_learning_account_roles.sql','20261005000002_learning_accounts_and_submissions.sql','20261005000003_blockly_learning_programs.sql','20261005000004_blockly_lesson_course.sql','20261005000005_blockly_capstone_projects.sql','20261005000006_require_blockly_submissions.sql','20261006000000_quizzes_and_portfolios.sql','20261006000001_progression_and_reporting.sql','20261006000002_knowledge_check_content.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  }
  await db.query('update public.lessons set learning_plan=$1 where id=$2', [JSON.stringify(plan),id(301)]);
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

test('Blockly drafts are private and submitted program snapshots survive later edits', async () => {
  const workspace = { blocks: { languageVersion: 0, blocks: [{ type: 'text_print', inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Hello' } } } } }] } };
  const save = (value = workspace) => db.query('select public.save_learning_program($1,$2,$3,$4)', [assignment, JSON.stringify(value), 'window.alert("Hello");', 'Hello']);
  await asUser(learner); await save();
  assert.deepEqual((await db.query('select workspace from public.learning_program_drafts')).rows[0].workspace,workspace);
  await assert.rejects(save({ blocks: { blocks: [] } }),/Add blocks/);
  await assert.rejects(db.query('update public.learning_program_drafts set code=$1',['tampered']),/permission denied/);
  const snapshot = (await db.query('select public.submit_learning_work($1,$2,$3,$4,$5,$6,$7) as id',
    [assignment,'My Blockly lesson',null,'I tested it.',JSON.stringify(workspace),'window.alert("Hello");','Hello'])).rows[0].id;
  const changed = structuredClone(workspace); changed.blocks.blocks[0].inputs.TEXT.block.fields.TEXT='Updated';
  await save(changed);
  assert.deepEqual((await db.query('select blockly_workspace from public.learning_submissions where id=$1',[snapshot])).rows[0].blockly_workspace,workspace);
  await asUser(peer); assert.deepEqual((await db.query('select * from public.learning_program_drafts')).rows,[]);
  await asUser(otherTeacher); await assert.rejects(save(),/own assigned program/);
  await asUser(teacher); assert.deepEqual((await db.query('select * from public.learning_program_drafts')).rows,[]);
  const submitted=(await db.query('select * from public.learning_submissions where id=$1',[snapshot])).rows[0];
  assert.deepEqual(submitted.blockly_workspace,workspace); assert.equal(submitted.run_output,'Hello');
  await assert.rejects(save(),/own assigned program/);
  await db.query('select public.review_learning_submission($1,$2,$3)',[snapshot,'Good Blockly sequence.','{"algorithms":"demonstrated"}']);
});

test('twenty Blockly lessons can be started privately and reviewed by allocated teachers', async () => {
  await asUser(learner);
  const catalog=(await db.query("select * from public.lessons where kind='lesson' and learning_plan->>'delivery'='blockly' order by position")).rows;
  assert.equal(catalog.length,20);
  const source=JSON.parse(await readFile(new URL('../supabase/learning/blockly-lessons.json',import.meta.url),'utf8'));
  assert.deepEqual(catalog.map((lesson)=>lesson.learning_plan.blocklyLessonId),source.map((lesson)=>lesson.slug));
  for (const [index, lesson] of catalog.entries()) {
    assert.deepEqual(lesson.learning_plan.steps,source[index].steps);
    assert.equal(lesson.learning_plan.expectedResult,source[index].expectedResult);
  }
  assert.deepEqual(catalog.reduce((counts,lesson)=>({ ...counts,[lesson.learning_plan.level]:(counts[lesson.learning_plan.level]??0)+1 }),{}),{ beginner:8, intermediate:7, expert:5 });
  const start=(lessonId)=>db.query('select public.start_blockly_lesson($1) as id',[lessonId]);
  const started=[];
  for (const lesson of catalog) { const first=(await start(lesson.id)).rows[0].id; assert.equal((await start(lesson.id)).rows[0].id,first); started.push(first); }
  assert.equal((await db.query('select * from public.learning_assignments where self_started')).rows.length,20);
  await assert.rejects(start(id(301)),/not available/);
  await asUser(null,'anon'); await assert.rejects(start(catalog[0].id),/permission denied/);
  await asUser(teacher); await assert.rejects(start(catalog[0].id),/active learner/);
  assert.equal((await db.query('select * from public.learning_assignments where self_started')).rows.length,20);
  await asUser(otherTeacher); assert.deepEqual((await db.query('select * from public.learning_assignments where self_started')).rows,[]);
  await asUser(peer); assert.deepEqual((await db.query('select * from public.learning_assignments where self_started')).rows,[]);
  const peerId=(await start(catalog[0].id)).rows[0].id; assert.notEqual(peerId,started[0]);
  await asUser(learner); assert.deepEqual((await db.query('select * from public.learning_assignments where id=$1',[peerId])).rows,[]);
});

test('capstone projects have criteria and persist Blockly work for teacher review', async () => {
  await asUser(learner);
  const capstones=(await db.query("select * from public.lessons where learning_plan->>'activityKind'='capstone' order by position")).rows;
  assert.equal(capstones.length,3);
  assert.ok(capstones.every((project)=>project.kind==='project' && project.learning_plan.requirements.length>=5));
  const project=(await db.query('select public.start_blockly_lesson($1) as id',[capstones[0].id])).rows[0].id;
  await assert.rejects(db.query('select public.submit_learning_work($1,$2,$3,$4)',[project,'Text only',null,'No program']),/requires a Blockly program/);
  const workspace={ blocks: { languageVersion: 0, blocks: [{ type: 'text_print', inputs: { TEXT: { block: { type: 'text', fields: { TEXT: 'Project output' } } } } }] } };
  const work=(await db.query('select public.submit_learning_work($1,$2,$3,$4,$5,$6,$7) as id',
    [project,'My project explanation and test results.',null,'I revised a step.',JSON.stringify(workspace),'window.alert("Project output");','Project output'])).rows[0].id;
  await asUser(peer); assert.deepEqual((await db.query('select * from public.learning_submissions where id=$1',[work])).rows,[]);
  await asUser(teacher);
  assert.deepEqual((await db.query('select blockly_workspace from public.learning_submissions where id=$1',[work])).rows[0].blockly_workspace,workspace);
  await db.query('select public.review_learning_submission($1,$2,$3)',[work,'Add the remaining steps to meet the project brief.','{"algorithms":"developing"}']);
  await asUser(learner);
  const feedback=(await db.query('select * from public.competency_evidence where submission_id=$1',[work])).rows[0];
  assert.equal(feedback.feedback,'Add the remaining steps to meet the project brief.');
});

test('inactive learners lose assignment access and revoked teachers lose individual work access', async () => {
  await asUser(id(1)); await db.query('select public.admin_set_teacher_students($1,$2)',[teacher,[]]);
  await asUser(teacher); assert.deepEqual((await db.query('select * from public.learning_submissions')).rows,[]);
  assert.deepEqual((await db.query('select * from public.competency_evidence')).rows,[]);
  await asUser(id(1)); await db.query('update public.club_members set is_active=false where id=$1',[id(201)]);
  await asUser(learner); assert.deepEqual((await db.query('select * from public.learning_assignments')).rows,[]);
  await assert.rejects(submit(),/own assigned work/);
});


test('quiz grading is private, complete, immutable and bound to the signed-in learner', async () => {
  await asUser(id(1));await db.query('update public.club_members set is_active=true where id=$1',[id(201)]);await db.query('select public.admin_set_teacher_students($1,$2)',[teacher,[id(201),id(202)]]);
  await asUser(learner);
  await assert.rejects(db.query('select solutions from public.learning_quizzes'),/permission denied/);
  const quizzes=(await db.query('select public.list_learning_quizzes() as list')).rows[0].list;
  assert.equal(quizzes.length,3); assert.equal(quizzes[0].solutions,undefined);
  const quiz=quizzes.find(q=>q.level==='beginner');
  await assert.rejects(db.query('select public.submit_learning_quiz($1,$2)',[quiz.id,{}]),/every question/);
  await assert.rejects(db.query('select public.submit_learning_quiz($1,$2)',[quiz.id,{q1:null,q2:1,q3:0,q4:1,q5:0}]),/every question/);
  const attempt=(await db.query('select public.submit_learning_quiz($1,$2) as id',[quiz.id,{q1:0,q2:1,q3:0,q4:1,q5:0}])).rows[0].id;
  const result=(await db.query('select * from public.learning_quiz_attempts where id=$1',[attempt])).rows[0];
  assert.equal(result.score,100);assert.equal(result.passed,true);assert.equal(result.student_id,id(201));
  await assert.rejects(db.query('update public.learning_quiz_attempts set score=100 where id=$1',[attempt]),/permission denied/);
  await asUser(peer);assert.equal((await db.query('select * from public.learning_quiz_attempts where id=$1',[attempt])).rows.length,0);
  await asUser(teacher);assert.equal((await db.query('select * from public.learning_quiz_attempts where id=$1',[attempt])).rows.length,1);
  await assert.rejects(db.query('select public.submit_learning_quiz($1,$2)',[quiz.id,{}]),/Learner access/);
  await assert.rejects(db.query('select public.publish_learning_quiz($1,$2,$3,$4,$5,$6,$7)',['test-quiz','Title','beginner',null,80,[],{}]),/Admin access/);
  await asUser(id(1));
  await db.query('select public.publish_learning_quiz($1,$2,$3,$4,$5,$6,$7)',[quiz.slug,quiz.title,quiz.level,quiz.lesson_id,quiz.pass_percent,quiz.questions,{q1:{correct:0,explanation:'Steps'},q2:{correct:1,explanation:'Values'},q3:{correct:0,explanation:'Repeat'},q4:{correct:1,explanation:'Retest'},q5:{correct:0,explanation:'Explain'}}]);
  await asUser(learner);await assert.rejects(db.query('select public.submit_learning_quiz($1,$2)',[quiz.id,{q1:0,q2:1,q3:0,q4:1,q5:0}]),/no longer available/);
  assert.equal((await db.query('select question_snapshot from public.learning_quiz_attempts where id=$1',[attempt])).rows[0].question_snapshot.version,1);
});

test('portfolios link only owned immutable submissions and preserve work when an item is removed', async () => {
 await asUser(learner);
 const own=(await db.query('select id from public.learning_submissions where student_id=$1 order by submitted_at desc limit 1',[id(201)])).rows[0].id;
 const item=(await db.query('select public.save_learning_portfolio_item($1,$2,$3) as id',[own,'My code project','I tested the boundary.'])).rows[0].id;
 await asUser(peer);assert.equal((await db.query('select * from public.learning_portfolio_items where id=$1',[item])).rows.length,0);
 await assert.rejects(db.query('select public.save_learning_portfolio_item($1,$2,$3)',[own,'Other work','']),/own submitted/);
 await assert.rejects(db.query('select public.remove_learning_portfolio_item($1)',[item]),/not found/);
 await asUser(otherTeacher);assert.equal((await db.query('select * from public.learning_portfolio_items where id=$1',[item])).rows.length,0);
 await asUser(teacher);assert.equal((await db.query('select * from public.learning_portfolio_items where id=$1',[item])).rows.length,1);
 await asUser(learner);await db.query('select public.remove_learning_portfolio_item($1)',[item]);assert.equal((await db.query('select id from public.learning_submissions where id=$1',[own])).rows.length,1);
});

test('progression decisions enforce review, evidence, prior levels and role boundaries', async () => {
 await asUser(learner); await assert.rejects(db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','awarded','Ready']),/Teacher access/);
 await assert.rejects(db.query('select public.learning_progression_readiness($1,$2)',[id(202),'beginner']),/access denied/);
 await asUser(teacher);let r=(await db.query('select public.learning_progression_readiness($1,$2) as r',[id(201),'beginner'])).rows[0].r;
 assert.equal(r.policy_approved,false);assert.equal(r.ready,false);
 await assert.rejects(db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','awarded','Ready']),/approved policy/);
 await db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','deferred','Practise the missing outcomes and submit the capstone.']);
 await assert.rejects(db.query('select public.approve_learning_progression_policy($1)',['Approved after review of source mapping and pilot criteria.']),/Admin access/);
 await asUser(id(1));await db.query('select public.approve_learning_progression_policy($1)',['Approved after review of source mapping and pilot criteria.']);
 await asUser(teacher);r=(await db.query('select public.learning_progression_readiness($1,$2) as r',[id(201),'beginner'])).rows[0].r;
 assert.equal(r.policy_approved,true);assert.equal(r.ready,false);
 await assert.rejects(db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','awarded','Still missing evidence']),/approved policy/);
 await asUser(otherTeacher);await assert.rejects(db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','deferred','No access']),/Teacher access/);
});

test('a level award retains its evidence and cannot reuse a superseded developing capstone review', async () => {
 await asUser(teacher);
 const work=(await db.query("select s.id from public.learning_submissions s join public.learning_assignments a on a.id=s.assignment_id where s.student_id=$1 and a.learning_plan->>'activityKind'='capstone' and a.learning_plan->>'level'='beginner' order by s.submitted_at desc limit 1",[id(201)])).rows[0].id;
 const bands={algorithms:'demonstrated',programming:'demonstrated',debugging:'demonstrated',design:'demonstrated',communication:'demonstrated'};
 await db.query('select public.review_learning_submission($1,$2,$3)',[work,'Observed all project criteria, tested the program and discussed the explanation.',bands]);
 const r=(await db.query('select public.learning_progression_readiness($1,$2) as r',[id(201),'beginner'])).rows[0].r;assert.equal(r.ready,true);
 const decision=(await db.query('select public.record_learning_progression($1,$2,$3,$4) as id',[id(201),'beginner','awarded','Reviewed the quiz, practical evidence and capstone. Practise intermediate tasks next.'])).rows[0].id;
 const saved=(await db.query('select * from public.learning_progression_decisions where id=$1',[decision])).rows[0];assert.equal(saved.evidence_snapshot.quiz_attempt_id,r.quiz_attempt_id);assert.equal(saved.evidence_snapshot.capstone_review_id,r.capstone_review_id);
 await db.query('select public.review_learning_submission($1,$2,$3)',[work,'A later observation needs more testing.',{...bands,debugging:'developing'}]);
 assert.equal((await db.query('select public.learning_progression_readiness($1,$2) as r',[id(201),'beginner'])).rows[0].r.ready,false);
 await assert.rejects(db.query('select public.record_learning_progression($1,$2,$3,$4)',[id(201),'beginner','awarded','Use old best score']),/approved policy/);
 assert.equal((await db.query('select * from public.learning_progression_decisions where id=$1',[decision])).rows[0].outcome,'awarded');
 await asUser(learner);assert.equal((await db.query('select * from public.learning_progression_decisions where id=$1',[decision])).rows.length,1);
 await asUser(peer);assert.equal((await db.query('select * from public.learning_progression_decisions where id=$1',[decision])).rows.length,0);
});

test('pilot reporting and attendance expose only an authorised cohort and explicit date window', async () => {
 await asUser(learner);await db.query('select public.record_learning_activity($1,$2)',['login',null]);
 await assert.rejects(db.query('select public.learning_pilot_report($1,$2,$3)',[id(101),'2026-10-01','2026-10-31']),/reporting access/);
 await asUser(teacher);await db.query('select public.record_learning_task_observation($1,$2,$3,$4)',[id(201),'Submit Blockly work',true,'']);
 await db.query('select public.record_learning_attendance($1,$2,$3,$4)',[id(101),new Date().toISOString().slice(0,10),null,{[id(201)]:true,[id(202)]:false}]);
 await assert.rejects(db.query('select public.record_learning_attendance($1,$2,$3,$4)',[id(101),new Date().toISOString().slice(0,10),null,{[id(203)]:true}]),/allocated learners/);
 const date=new Date().toISOString().slice(0,10);
 const r=(await db.query('select public.learning_pilot_report($1,$2,$3) as r',[id(101),date,date])).rows[0].r;
 assert.equal(r.enrolled_learners,2);assert.equal(r.learners_with_accounts,2);assert.equal(r.active_learners,1);assert.equal(r.attendance_present,1);assert.equal(r.attendance_recorded,2);assert.equal(r.observed_tasks,1);assert.equal(r.independent_tasks,1);
 await assert.rejects(db.query('select public.learning_pilot_report($1,$2,$3)',[id(102),date,date]),/reporting access/);
 await assert.rejects(db.query('select public.learning_pilot_report($1,$2,$3)',[id(101),'2026-10-31','2026-10-01']),/date range/);
 await asUser(otherTeacher);const other=(await db.query('select public.learning_pilot_report($1,$2,$3) as r',[id(101),date,date])).rows[0].r;assert.equal(other.enrolled_learners,1);assert.equal(other.active_learners,0);
 await asUser(null,'anon');await assert.rejects(db.query('select public.list_learning_quizzes()'),/permission denied/);
});
