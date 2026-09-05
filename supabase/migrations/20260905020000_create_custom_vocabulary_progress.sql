-- Ordered words are immutable after list creation, so their array index is a stable item key.
alter table public.custom_vocabulary_lists
  add column practiced_count integer not null default 0 check (practiced_count >= 0),
  add column confident_count integer not null default 0 check (confident_count >= 0);

create table public.custom_vocabulary_progress (
  user_id uuid not null,
  list_id uuid not null,
  word_index integer not null check (word_index >= 0),
  status text not null check (status in ('learning', 'confident')),
  reviewed_at timestamptz not null default now(),
  primary key (user_id, list_id, word_index),
  foreign key (user_id, list_id) references public.custom_vocabulary_lists(user_id,id) on delete cascade
);
alter table public.custom_vocabulary_progress enable row level security;
revoke all on public.custom_vocabulary_progress from public, anon, authenticated;
grant select on public.custom_vocabulary_progress to authenticated;
create policy "Read own custom word progress" on public.custom_vocabulary_progress for select to authenticated
  using ((select auth.uid()) = user_id and exists (select 1 from public.custom_vocabulary_lists l where l.user_id = custom_vocabulary_progress.user_id and l.id = list_id and l.deleted_at is null));

create function public.record_custom_vocabulary_review(p_list_id uuid, p_word_index integer, p_status text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  word_count integer;
  practiced integer;
  confident integer;
begin
  if owner_id is null then raise exception 'Sign in required' using errcode = '42501'; end if;
  if p_status is null or p_status not in ('learning', 'confident') then raise exception 'Invalid review status' using errcode = '22023'; end if;
  select jsonb_array_length(words) into word_count from public.custom_vocabulary_lists
    where user_id = owner_id and id = p_list_id and deleted_at is null for update;
  if word_count is null then raise exception 'List unavailable' using errcode = '42501'; end if;
  if p_word_index is null or p_word_index < 0 or p_word_index >= word_count then raise exception 'Invalid word' using errcode = '22023'; end if;
  insert into public.custom_vocabulary_progress(user_id,list_id,word_index,status)
    values(owner_id,p_list_id,p_word_index,p_status)
    on conflict(user_id,list_id,word_index) do update set status=excluded.status, reviewed_at=now();
  select count(*), count(*) filter(where status='confident') into practiced, confident
    from public.custom_vocabulary_progress where user_id=owner_id and list_id=p_list_id;
  update public.custom_vocabulary_lists set practiced_count=practiced, confident_count=confident, completed=(confident=word_count)
    where user_id=owner_id and id=p_list_id;
  return jsonb_build_object('practiced_count',practiced,'confident_count',confident,'completed',confident=word_count);
end;
$$;
revoke all on function public.record_custom_vocabulary_review(uuid,integer,text) from public, anon;
grant execute on function public.record_custom_vocabulary_review(uuid,integer,text) to authenticated;

create function public.clear_deleted_custom_vocabulary_progress()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.deleted_at is null and new.deleted_at is not null then
    delete from public.custom_vocabulary_progress where user_id=new.user_id and list_id=new.id;
  end if;
  return null;
end;
$$;
revoke all on function public.clear_deleted_custom_vocabulary_progress() from public, anon, authenticated;
create trigger custom_vocabulary_progress_deleted after update of deleted_at on public.custom_vocabulary_lists
  for each row execute function public.clear_deleted_custom_vocabulary_progress();
