-- =============================================================
-- 20260601000025_add_outreach_to_stage_kind.sql
--
-- Adds 'outreach' as a valid kind on programme_stages so that the
-- Inclusive Robotics programme can start with an Outreach activity
-- before bootcamps. Must run in its own migration because PostgreSQL
-- forbids using a new enum value in the same transaction that adds it.
-- =============================================================

alter type public.stage_kind add value if not exists 'outreach';
