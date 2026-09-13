-- Assessment receipts are signed by the application. Clients can never produce
-- trusted grades: every server read verifies the exact signed payload and owner.
-- Old self-ratings are retained in their original tables and never promoted.
create table public.vocabulary_assessment_attempts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload text not null check (octet_length(payload) <= 24000),
  signature text not null check (signature ~ '^[a-f0-9]{64}$'),
  disputed boolean not null default false,
  created_at timestamptz not null default now()
);
create index vocabulary_assessment_owner on public.vocabulary_assessment_attempts(user_id, id);
alter table public.vocabulary_assessment_attempts enable row level security;
revoke all on public.vocabulary_assessment_attempts from public, anon, authenticated;
grant select, insert on public.vocabulary_assessment_attempts to authenticated;
grant update(disputed) on public.vocabulary_assessment_attempts to authenticated;
create policy "Read own assessment receipts" on public.vocabulary_assessment_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Store own assessment receipts" on public.vocabulary_assessment_attempts for insert to authenticated with check ((select auth.uid()) = user_id and not disputed);
create policy "Flag own assessment for review" on public.vocabulary_assessment_attempts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and disputed);
