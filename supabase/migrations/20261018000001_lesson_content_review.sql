-- Content suitability and publication review for curriculum lessons.
-- Existing active curriculum is treated as historically approved. New content
-- must pass through the review workflow before it can be published.

alter table public.lessons
  add column if not exists minimum_age smallint,
  add column if not exists maximum_age smallint,
  add column if not exists minimum_grade smallint,
  add column if not exists maximum_grade smallint,
  add column if not exists learning_needs text[] not null default '{}'::text[],
  add column if not exists review_status text not null default 'draft',
  add column if not exists review_notes text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

update public.lessons
set review_status = 'approved',
    approved_at = coalesce(created_at, now())
where is_active and review_status = 'draft';

alter table public.lessons drop constraint if exists lessons_age_range_valid;
alter table public.lessons add constraint lessons_age_range_valid check (
  (minimum_age is null or minimum_age between 4 and 25)
  and (maximum_age is null or maximum_age between 4 and 25)
  and (minimum_age is null or maximum_age is null or minimum_age <= maximum_age)
);

alter table public.lessons drop constraint if exists lessons_grade_range_valid;
alter table public.lessons add constraint lessons_grade_range_valid check (
  (minimum_grade is null or minimum_grade between 1 and 12)
  and (maximum_grade is null or maximum_grade between 1 and 12)
  and (minimum_grade is null or maximum_grade is null or minimum_grade <= maximum_grade)
);

alter table public.lessons drop constraint if exists lessons_learning_needs_valid;
alter table public.lessons add constraint lessons_learning_needs_valid check (
  learning_needs <@ array[
    'hearing support', 'visual support', 'reading support',
    'motor support', 'language support', 'step-by-step support'
  ]::text[]
);

alter table public.lessons drop constraint if exists lessons_review_status_valid;
alter table public.lessons add constraint lessons_review_status_valid check (
  review_status in ('draft', 'under_review', 'approved', 'needs_revision', 'withdrawn')
);

alter table public.lessons drop constraint if exists lessons_publication_requires_approval;
alter table public.lessons add constraint lessons_publication_requires_approval check (
  not is_active or (review_status = 'approved' and approved_at is not null)
);

comment on column public.lessons.learning_needs is
  'Supported learning needs used by teachers to curate suitable lessons.';
comment on column public.lessons.review_status is
  'Editorial state. Only approved content may be active/published.';

-- Changing learner-facing content invalidates the previous approval. Review
-- metadata itself is excluded so reviewers can change status and notes.
create or replace function public.lesson_content_change_requires_review()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.review_status = 'approved' and old.is_active and (
    new.title is distinct from old.title
    or new.description is distinct from old.description
    or new.kind is distinct from old.kind
    or new.resource_url is distinct from old.resource_url
    or new.media_type is distinct from old.media_type
    or new.media_url is distinct from old.media_url
    or new.captions_url is distinct from old.captions_url
    or new.media_transcript is distinct from old.media_transcript
    or new.media_instructions is distinct from old.media_instructions
    or new.level is distinct from old.level
    or new.points is distinct from old.points
    or new.required_for_certificate is distinct from old.required_for_certificate
    or new.learning_plan is distinct from old.learning_plan
    or new.minimum_age is distinct from old.minimum_age
    or new.maximum_age is distinct from old.maximum_age
    or new.minimum_grade is distinct from old.minimum_grade
    or new.maximum_grade is distinct from old.maximum_grade
    or new.learning_needs is distinct from old.learning_needs
  ) then
    new.review_status := 'needs_revision';
    new.is_active := false;
    new.approved_at := null;
    new.approved_by := null;
  end if;
  return new;
end;
$$;

drop trigger if exists lesson_content_change_requires_review_trg on public.lessons;
create trigger lesson_content_change_requires_review_trg
  before update on public.lessons
  for each row execute function public.lesson_content_change_requires_review();

-- Keep the approval transition atomic and auditable. The same call also
-- controls publication so an item cannot be made active independently.
create or replace function public.review_lesson_content(
  p_lesson_id uuid,
  p_status text,
  p_notes text default null
) returns public.lessons
language plpgsql
security definer
set search_path = public
as $$
declare v_lesson public.lessons%rowtype;
begin
  if not public.me_is_admin() then
    raise exception 'Only an administrator can review curriculum content.' using errcode = '42501';
  end if;
  if p_status not in ('draft', 'under_review', 'approved', 'needs_revision', 'withdrawn') then
    raise exception 'Choose a valid content review status.' using errcode = '22023';
  end if;
  if length(coalesce(p_notes, '')) > 5000 then
    raise exception 'Review notes must be 5,000 characters or fewer.' using errcode = '22023';
  end if;

  update public.lessons
  set review_status = p_status,
      review_notes = nullif(btrim(coalesce(p_notes, '')), ''),
      is_active = (p_status = 'approved'),
      approved_at = case when p_status = 'approved' then now() else null end,
      approved_by = case when p_status = 'approved' then auth.uid() else null end
  where id = p_lesson_id
  returning * into v_lesson;

  if not found then raise exception 'Lesson not found.' using errcode = 'P0002'; end if;
  return v_lesson;
end;
$$;

revoke all on function public.review_lesson_content(uuid, text, text) from public, anon;
grant execute on function public.review_lesson_content(uuid, text, text) to authenticated;

drop policy if exists "Read lessons" on public.lessons;
create policy "Read lessons" on public.lessons for select to authenticated
  using ((is_active and review_status = 'approved') or public.me_is_admin());

create index if not exists lessons_review_status_idx on public.lessons(review_status);
create index if not exists lessons_age_grade_idx on public.lessons(minimum_age, maximum_age, minimum_grade, maximum_grade);

notify pgrst, 'reload schema';
