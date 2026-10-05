-- =============================================================
-- Pin pg_graphql relation field names to what the dashboard expects.
--
-- pg_graphql's default many-to-one field name is the *referenced table
-- name* (projects → "schools"), but every join in src/lib/gql/queries.ts
-- was written against singular/semantic names ("school", "student",
-- "product", "template", "event", "placed_by_school", …). Without these
-- directives every join query fails with "Unknown field … on type …"
-- (surfaced 2026-07-10 on /dashboard/admin/projects).
--
-- Each comment sets:
--   foreign_name — the field on the referencing table (the join the
--                  frontend selects)
--   local_name   — the reverse field base on the referenced table
--                  (used verbatim — no suffix is appended), pinned so future
--                  renames can't silently break nested reverse joins
--                  like orders → product_unitsCollection.
-- =============================================================

-- students (club_members) --------------------------------------
comment on constraint lesson_completions_student_id_fkey on public.lesson_completions is
  e'@graphql({"foreign_name": "student", "local_name": "lesson_completionsCollection"})';
comment on constraint project_team_members_student_id_fkey on public.project_team_members is
  e'@graphql({"foreign_name": "student", "local_name": "project_team_membersCollection"})';
comment on constraint certificate_issuances_student_id_fkey on public.certificate_issuances is
  e'@graphql({"foreign_name": "student", "local_name": "certificate_issuancesCollection"})';
comment on constraint product_units_current_member_id_fkey on public.product_units is
  e'@graphql({"foreign_name": "current_member", "local_name": "held_unitsCollection"})';

-- products ------------------------------------------------------
comment on constraint product_units_product_id_fkey on public.product_units is
  e'@graphql({"foreign_name": "product", "local_name": "product_unitsCollection"})';
comment on constraint orders_product_id_fkey on public.orders is
  e'@graphql({"foreign_name": "product", "local_name": "ordersCollection"})';

-- schools -------------------------------------------------------
comment on constraint projects_school_id_fkey on public.projects is
  e'@graphql({"foreign_name": "school", "local_name": "projectsCollection"})';
comment on constraint certificate_issuances_school_id_fkey on public.certificate_issuances is
  e'@graphql({"foreign_name": "school", "local_name": "certificate_issuancesCollection"})';
comment on constraint event_schools_school_id_fkey on public.event_schools is
  e'@graphql({"foreign_name": "school", "local_name": "event_schoolsCollection"})';
comment on constraint orders_placed_by_school_id_fkey on public.orders is
  e'@graphql({"foreign_name": "placed_by_school", "local_name": "placed_ordersCollection"})';
comment on constraint orders_fulfilled_by_school_id_fkey on public.orders is
  e'@graphql({"foreign_name": "fulfilled_by_school", "local_name": "fulfilled_ordersCollection"})';

-- other ---------------------------------------------------------
comment on constraint certificate_issuances_template_id_fkey on public.certificate_issuances is
  e'@graphql({"foreign_name": "template", "local_name": "certificate_issuancesCollection"})';
comment on constraint projects_programme_id_fkey on public.projects is
  e'@graphql({"foreign_name": "programme", "local_name": "projectsCollection"})';
comment on constraint event_schools_event_id_fkey on public.event_schools is
  e'@graphql({"foreign_name": "event", "local_name": "event_schoolsCollection"})';
comment on constraint product_units_order_id_fkey on public.product_units is
  e'@graphql({"foreign_name": "order", "local_name": "product_unitsCollection"})';
