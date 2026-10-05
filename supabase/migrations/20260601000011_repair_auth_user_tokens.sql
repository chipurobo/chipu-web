-- ============================================================================
-- Backfill the four NOT-NULL token columns on any auth.users rows that
-- earlier versions of create_school_with_lead left NULL.
--
-- Symptom of NULL tokens: login fails with "Database error querying schema"
-- because GoTrue can't parse the user row.
--
-- This is idempotent and safe to re-run.
-- ============================================================================

update auth.users
   set confirmation_token      = coalesce(confirmation_token,      ''),
       email_change            = coalesce(email_change,            ''),
       email_change_token_new  = coalesce(email_change_token_new,  ''),
       recovery_token          = coalesce(recovery_token,          '')
 where confirmation_token     is null
    or email_change           is null
    or email_change_token_new is null
    or recovery_token         is null;
