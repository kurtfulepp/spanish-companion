-- Counters only: no image, filename, image URL, prompt, or vocabulary is stored.
create table public.photo_vocabulary_quota (
  user_id uuid primary key references auth.users (id) on delete cascade,
  day_started_at timestamptz not null default now(),
  day_count integer not null default 0 check (day_count >= 0),
  burst_started_at timestamptz not null default now(),
  burst_count integer not null default 0 check (burst_count >= 0)
);

alter table public.photo_vocabulary_quota enable row level security;
revoke all on public.photo_vocabulary_quota from anon, authenticated;

create function public.consume_photo_vocabulary_quota()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_now timestamptz := now();
  v_quota public.photo_vocabulary_quota%rowtype;
begin
  if v_user_id is null then return false; end if;

  insert into public.photo_vocabulary_quota (user_id)
  values (v_user_id) on conflict (user_id) do nothing;

  select * into v_quota from public.photo_vocabulary_quota
  where user_id = v_user_id for update;

  if v_quota.day_started_at <= v_now - interval '24 hours' then
    v_quota.day_started_at := v_now;
    v_quota.day_count := 0;
  end if;
  if v_quota.burst_started_at <= v_now - interval '5 minutes' then
    v_quota.burst_started_at := v_now;
    v_quota.burst_count := 0;
  end if;

  if v_quota.day_count >= 20 or v_quota.burst_count >= 3 then
    return false;
  end if;

  update public.photo_vocabulary_quota
  set day_started_at = v_quota.day_started_at,
      day_count = v_quota.day_count + 1,
      burst_started_at = v_quota.burst_started_at,
      burst_count = v_quota.burst_count + 1
  where user_id = v_user_id;
  return true;
end;
$$;

revoke all on function public.consume_photo_vocabulary_quota() from public;
grant execute on function public.consume_photo_vocabulary_quota() to authenticated;
