alter table public.profiles
  add column if not exists learning_timezone text not null default 'America/New_York',
  add column if not exists follow_device_timezone boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_learning_timezone_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_learning_timezone_length
      check (char_length(learning_timezone) between 1 and 100);
  end if;
end
$$;
