-- Commit the enum values before the next migration uses them.
alter type public.user_role add value if not exists 'teacher';
alter type public.user_role add value if not exists 'learner';
