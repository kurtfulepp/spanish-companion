create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  proficiency_level text,
  level_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_display_name_length
    check (display_name is null or char_length(display_name) between 1 and 80),
  constraint profiles_proficiency_level
    check (proficiency_level is null or proficiency_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  constraint profiles_level_source
    check (level_source is null or level_source in ('chosen', 'assessed')),
  constraint profiles_level_source_requires_level
    check (level_source is null or proficiency_level is not null)
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.set_profile_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profile_updated_at();

create function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
