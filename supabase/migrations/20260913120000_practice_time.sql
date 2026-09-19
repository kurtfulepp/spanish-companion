-- Activity duration is separate from assessed learning evidence.
create table public.practice_time_intervals (
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null check (ended_at > started_at),
  primary key (user_id, started_at)
);
create index practice_time_recent on public.practice_time_intervals(user_id, ended_at);
alter table public.practice_time_intervals enable row level security;
revoke all on public.practice_time_intervals from public, anon, authenticated;
grant select on public.practice_time_intervals to authenticated;
create policy "Read own practice time" on public.practice_time_intervals
  for select to authenticated using ((select auth.uid()) = user_id);

create function public.record_practice_time(p_area text, p_level text, p_intervals jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
  profile_level text;
  levels text[] := array['A1','A2','B1','B2','C1','C2'];
  item jsonb;
  start_time timestamptz;
  end_time timestamptz;
  merged_start timestamptz;
  merged_end timestamptz;
  server_now timestamptz := clock_timestamp();
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  select proficiency_level into profile_level from public.profiles where id = owner_id;
  if p_area is null or p_area not in ('vocabulary','grammar','conversation')
    or p_level is null or not (p_level = any(levels))
    or profile_level is null or not (profile_level = any(levels))
    or (p_area <> 'grammar' and p_level <> profile_level)
    or array_position(levels,p_level) > array_position(levels,profile_level)
  then raise exception 'Practice level unavailable'; end if;
  if p_intervals is null or jsonb_typeof(p_intervals) <> 'array'
    or jsonb_array_length(p_intervals) not between 1 and 20
  then raise exception 'Invalid intervals'; end if;
  -- Serialize merges for this learner, including simultaneous tabs/devices.
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 719));
  for item in select value from jsonb_array_elements(p_intervals) loop
    if jsonb_typeof(item->'start') is distinct from 'number' or jsonb_typeof(item->'end') is distinct from 'number'
    then raise exception 'Invalid interval'; end if;
    start_time := to_timestamp((item->>'start')::double precision / 1000);
    end_time := to_timestamp((item->>'end')::double precision / 1000);
    if start_time < server_now - interval '5 minutes' or end_time > server_now + interval '5 seconds'
      or end_time <= start_time or end_time - start_time > interval '30 seconds'
    then raise exception 'Expired or invalid interval'; end if;
    -- Small clock skew is tolerated, but future seconds never count.
    end_time := least(end_time, server_now);
    if end_time <= start_time then continue; end if;
    select least(start_time, coalesce(min(started_at),start_time)), greatest(end_time,coalesce(max(ended_at),end_time))
      into merged_start, merged_end from public.practice_time_intervals
      where user_id = owner_id and started_at <= end_time and ended_at >= start_time;
    delete from public.practice_time_intervals
      where user_id = owner_id and started_at <= end_time and ended_at >= start_time;
    insert into public.practice_time_intervals values (owner_id, merged_start, merged_end);
  end loop;
end;
$$;
revoke all on function public.record_practice_time(text,text,jsonb) from public, anon;
grant execute on function public.record_practice_time(text,text,jsonb) to authenticated;

create function public.practice_seconds_last_30_days()
returns double precision language sql stable security invoker set search_path = '' as $$
  select coalesce(sum(extract(epoch from (least(ended_at,now()) - greatest(started_at,now() - interval '720 hours')))),0)::double precision
  from public.practice_time_intervals
  where user_id = (select auth.uid()) and ended_at > now() - interval '720 hours' and started_at < now();
$$;
revoke all on function public.practice_seconds_last_30_days() from public, anon;
grant execute on function public.practice_seconds_last_30_days() to authenticated;
