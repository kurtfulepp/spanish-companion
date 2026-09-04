alter table public.profiles
  add column if not exists voice_preference text not null default 'male';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_voice_preference'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_voice_preference
      check (voice_preference in ('male', 'female'));
  end if;
end
$$;
