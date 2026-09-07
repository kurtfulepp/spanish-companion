-- Immutable, account-owned practice evidence. Scores are derived from versioned
-- content in the application; writing and self-review are not teacher grades.
create table public.grammar_rule_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id text not null check (rule_id ~ '^[ABC][12]-[0-9]{2}\.[a-z-]+$'),
  content_version integer not null check (content_version > 0),
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  answers jsonb not null check (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 10000),
  writing text not null check (char_length(btrim(writing)) between 1 and 4000),
  self_review jsonb not null check (jsonb_typeof(self_review) = 'array' and jsonb_array_length(self_review) <= 20),
  created_at timestamptz not null default now()
);
create index grammar_rule_attempts_user_time_idx on public.grammar_rule_attempts(user_id, created_at desc);
alter table public.grammar_rule_attempts enable row level security;
revoke all on public.grammar_rule_attempts from public, anon, authenticated;
grant select on public.grammar_rule_attempts to authenticated;
grant insert (id, user_id, rule_id, content_version, level, answers, writing, self_review)
  on public.grammar_rule_attempts to authenticated;
create policy "Read own grammar evidence" on public.grammar_rule_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Record own grammar practice" on public.grammar_rule_attempts
  for insert to authenticated with check (
    (select auth.uid()) = user_id
    and left(rule_id, 2) = level
    and exists (
      select 1 from public.profiles p where p.id = (select auth.uid())
      and array_position(array['A1','A2','B1','B2','C1','C2'], level)
        <= array_position(array['A1','A2','B1','B2','C1','C2'], p.proficiency_level)
    )
  );
