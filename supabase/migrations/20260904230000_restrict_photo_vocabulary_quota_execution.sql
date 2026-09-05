-- Supabase may grant EXECUTE to anon through its default privileges.
-- Keep quota consumption available only to authenticated callers.
revoke all on function public.consume_photo_vocabulary_quota() from public, anon;
grant execute on function public.consume_photo_vocabulary_quota() to authenticated;
