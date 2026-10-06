-- Quiz solutions are never directly readable. Only validated RPCs grade attempts.
create table public.learning_quizzes (
 id uuid primary key default gen_random_uuid(), slug text not null, version integer not null,
 title text not null, level text not null check(level in ('beginner','intermediate','expert')),
 lesson_id uuid references public.lessons(id), pass_percent integer not null check(pass_percent between 1 and 100),
 questions jsonb not null, solutions jsonb not null, is_active boolean not null default true,
 created_at timestamptz not null default now(), unique(slug,version)
);
create table public.learning_quiz_attempts (
 id uuid primary key default gen_random_uuid(), quiz_id uuid not null references public.learning_quizzes,
 student_id uuid not null references public.club_members, answers jsonb not null,
 question_snapshot jsonb not null, feedback jsonb not null, score integer not null, passed boolean not null,
 submitted_at timestamptz not null default now()
);
create table public.learning_portfolio_items (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.club_members,
 submission_id uuid not null references public.learning_submissions, title text not null check(length(title) between 1 and 200),
 reflection text not null default '' check(length(reflection)<=5000), created_at timestamptz not null default now(),
 unique(student_id,submission_id)
);
alter table public.learning_quizzes enable row level security;
alter table public.learning_quiz_attempts enable row level security;
alter table public.learning_portfolio_items enable row level security;
revoke all on public.learning_quizzes,public.learning_quiz_attempts,public.learning_portfolio_items from anon,authenticated;
grant select on public.learning_quiz_attempts,public.learning_portfolio_items to authenticated;
create policy attempts_read on public.learning_quiz_attempts for select to authenticated using(public.is_my_learning_student(student_id) or public.can_teach_learning_student(student_id));
create policy portfolio_read on public.learning_portfolio_items for select to authenticated using(public.is_my_learning_student(student_id) or public.can_teach_learning_student(student_id));

create function public.list_learning_quizzes() returns jsonb language sql stable security definer set search_path=public as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'slug',slug,'version',version,'title',title,'level',level,'lesson_id',lesson_id,'pass_percent',pass_percent,'questions',questions) order by level,title),'[]'::jsonb)
 from public.learning_quizzes where is_active and exists(select 1 from public.profiles where id=auth.uid());
$$;
create function public.publish_learning_quiz(p_slug text,p_title text,p_level text,p_lesson_id uuid,p_pass_percent integer,p_questions jsonb,p_solutions jsonb)
 returns uuid language plpgsql security definer set search_path=public as $$
declare q jsonb; s jsonb; v_id uuid; v_version integer;
begin
 if not public.me_is_admin() then raise exception 'Admin access required.' using errcode='42501'; end if;
 if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]{2,79}$' or length(btrim(coalesce(p_title,''))) not between 1 and 200
 or p_level is null or p_level not in ('beginner','intermediate','expert') or p_pass_percent is null or p_pass_percent not between 1 and 100
 or jsonb_typeof(p_questions) is distinct from 'array' or jsonb_typeof(p_solutions) is distinct from 'object' then raise exception 'Check the quiz title, level, questions and pass mark.'; end if;
 if jsonb_array_length(p_questions) not between 1 and 30 then raise exception 'Use 1–30 questions.'; end if;
 if p_lesson_id is not null and not exists(select 1 from public.lessons where id=p_lesson_id and is_active) then raise exception 'Choose an active lesson.'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_questions))<>jsonb_array_length(p_questions) then raise exception 'Question IDs must be distinct.'; end if;
 for q in select value from jsonb_array_elements(p_questions) loop
  s:=p_solutions->(q->>'id');
  if length(coalesce(q->>'id','')) not between 1 and 80 or length(btrim(coalesce(q->>'prompt',''))) not between 1 and 2000
   or jsonb_typeof(q->'choices') is distinct from 'array' then raise exception 'Each question needs a prompt and choices.'; end if;
  if jsonb_array_length(q->'choices') not between 2 and 6 or exists(select 1 from jsonb_array_elements(q->'choices') c where jsonb_typeof(c)<>'string' or length(btrim(c#>>'{}')) not between 1 and 1000)
   or s is null or jsonb_typeof(s->'correct') is distinct from 'number' or (s->>'correct') !~ '^[0-5]$'
   or (s->>'correct')::integer>=jsonb_array_length(q->'choices') or length(btrim(coalesce(s->>'explanation',''))) not between 1 and 2000 then raise exception 'Check choices, correct answer and explanation.'; end if;
 end loop;
 perform pg_advisory_xact_lock(hashtext(p_slug));
 select coalesce(max(version),0)+1 into v_version from public.learning_quizzes where slug=p_slug;
 update public.learning_quizzes set is_active=false where slug=p_slug;
 insert into public.learning_quizzes(slug,version,title,level,lesson_id,pass_percent,questions,solutions)
 values(p_slug,v_version,btrim(p_title),p_level,p_lesson_id,p_pass_percent,p_questions,p_solutions) returning id into v_id;
 return v_id;
end; $$;
create function public.submit_learning_quiz(p_quiz_id uuid,p_answers jsonb) returns uuid language plpgsql security definer set search_path=public as $$
declare v_student uuid; v_quiz public.learning_quizzes; q jsonb; correct integer:=0; score integer; result jsonb:='[]'; v_id uuid; choice integer;
begin
 select student_id into v_student from public.learner_accounts where profile_id=auth.uid() and public.is_my_learning_student(student_id);
 if not found then raise exception 'Learner access required.' using errcode='42501'; end if;
 select * into v_quiz from public.learning_quizzes where id=p_quiz_id and is_active;
 if not found then raise exception 'This quiz version is no longer available. Reload the quiz.'; end if;
 if jsonb_typeof(p_answers) is distinct from 'object' then raise exception 'Answer every question.'; end if;
 if (select count(*) from jsonb_object_keys(p_answers))<>jsonb_array_length(v_quiz.questions) then raise exception 'Answer every question.'; end if;
 for q in select value from jsonb_array_elements(v_quiz.questions) loop
  if not p_answers ? (q->>'id') or jsonb_typeof(p_answers->(q->>'id')) is distinct from 'number' or (p_answers->>(q->>'id')) !~ '^[0-5]$' then raise exception 'Choose an answer for every question.'; end if;
  choice:=(p_answers->>(q->>'id'))::integer;
  if choice>=jsonb_array_length(q->'choices') then raise exception 'Choose a listed answer.'; end if;
  if choice=(v_quiz.solutions->(q->>'id')->>'correct')::integer then correct:=correct+1; end if;
  result:=result||jsonb_build_array(jsonb_build_object('id',q->>'id','correct',choice=(v_quiz.solutions->(q->>'id')->>'correct')::integer,'explanation',v_quiz.solutions->(q->>'id')->>'explanation'));
 end loop;
 score:=100*correct/jsonb_array_length(v_quiz.questions);
 insert into public.learning_quiz_attempts(quiz_id,student_id,answers,question_snapshot,feedback,score,passed)
 values(p_quiz_id,v_student,p_answers,jsonb_build_object('title',v_quiz.title,'level',v_quiz.level,'version',v_quiz.version,'pass_percent',v_quiz.pass_percent,'lesson_id',v_quiz.lesson_id,'questions',v_quiz.questions),result,score,score>=v_quiz.pass_percent) returning id into v_id;
 return v_id;
end; $$;
create function public.save_learning_portfolio_item(p_submission_id uuid,p_title text,p_reflection text) returns uuid language plpgsql security definer set search_path=public as $$
declare v_student uuid; v_id uuid;
begin
 select student_id into v_student from public.learning_submissions where id=p_submission_id and public.is_my_learning_student(student_id);
 if not found then raise exception 'Choose your own submitted work.' using errcode='42501'; end if;
 if length(btrim(coalesce(p_title,''))) not between 1 and 200 or length(coalesce(p_reflection,''))>5000 then raise exception 'Enter a title and keep reflection under 5000 characters.'; end if;
 insert into public.learning_portfolio_items(student_id,submission_id,title,reflection) values(v_student,p_submission_id,btrim(p_title),coalesce(p_reflection,''))
 on conflict(student_id,submission_id) do update set title=excluded.title,reflection=excluded.reflection returning id into v_id;
 return v_id;
end; $$;
create function public.remove_learning_portfolio_item(p_item_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 delete from public.learning_portfolio_items where id=p_item_id and public.is_my_learning_student(student_id);
 if not found then raise exception 'Portfolio item not found.' using errcode='42501'; end if;
end; $$;
revoke all on function public.list_learning_quizzes(),public.publish_learning_quiz(text,text,text,uuid,integer,jsonb,jsonb),public.submit_learning_quiz(uuid,jsonb),public.save_learning_portfolio_item(uuid,text,text),public.remove_learning_portfolio_item(uuid) from public,anon;
grant execute on function public.list_learning_quizzes(),public.publish_learning_quiz(text,text,text,uuid,integer,jsonb,jsonb),public.submit_learning_quiz(uuid,jsonb),public.save_learning_portfolio_item(uuid,text,text),public.remove_learning_portfolio_item(uuid) to authenticated;
create index on public.learning_quiz_attempts(student_id,submitted_at desc);
create index on public.learning_portfolio_items(student_id);
