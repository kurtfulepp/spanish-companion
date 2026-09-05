-- Accepted text only. Photo bytes, URLs, filenames and analysis payloads have no columns.
create function public.valid_custom_vocabulary_words(value jsonb)
returns boolean language plpgsql immutable security invoker set search_path = '' as $$
declare word jsonb;
begin
  if jsonb_typeof(value) <> 'array' then return false; end if;
  for word in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(word) <> 'object' then return false; end if;
    if not (word ? 'english' and word ? 'spanish') or word - 'english' - 'spanish' <> '{}'::jsonb then return false; end if;
    if jsonb_typeof(word->'english') <> 'string' or jsonb_typeof(word->'spanish') <> 'string' then return false; end if;
    if char_length(btrim(word->>'english')) not between 1 and 1000 or char_length(btrim(word->>'spanish')) not between 1 and 1000 then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.valid_custom_vocabulary_words(jsonb) from public, anon;
grant execute on function public.valid_custom_vocabulary_words(jsonb) to authenticated;

create table public.custom_vocabulary_lists (
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  words jsonb not null check (public.valid_custom_vocabulary_words(words)),
  source text not null default 'photo' check (source in ('photo', 'demo')),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id),
  check (deleted_at is not null or jsonb_array_length(words) > 0)
);
create index custom_vocabulary_lists_active on public.custom_vocabulary_lists(user_id, created_at desc, id) where deleted_at is null;
alter table public.custom_vocabulary_lists enable row level security;
revoke all on public.custom_vocabulary_lists from anon, authenticated;
grant select on public.custom_vocabulary_lists to authenticated;
grant insert (user_id, id, name, words, source, completed, created_at) on public.custom_vocabulary_lists to authenticated;
grant update (completed, deleted_at) on public.custom_vocabulary_lists to authenticated;
create policy "Read own custom lists" on public.custom_vocabulary_lists for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own custom lists" on public.custom_vocabulary_lists for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Change own custom lists" on public.custom_vocabulary_lists for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.update_custom_vocabulary_list()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.deleted_at is not null then raise exception 'List has been deleted'; end if;
  new.updated_at := now();
  if new.deleted_at is not null then
    -- Keep only a tombstone so an old browser import cannot resurrect deleted words.
    new.deleted_at := now(); new.name := 'Deleted list'; new.words := '[]'::jsonb; new.completed := false;
  end if;
  return new;
end;
$$;
revoke all on function public.update_custom_vocabulary_list() from public, anon;
create trigger custom_vocabulary_list_updated before update on public.custom_vocabulary_lists for each row execute function public.update_custom_vocabulary_list();
