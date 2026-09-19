-- Isolated PostgreSQL fixture; all scratch identities and intervals roll back.
begin;
do $$
declare owner_id uuid := gen_random_uuid(); other_id uuid := gen_random_uuid();
begin
  perform set_config('test.time_owner',owner_id::text,true);
  perform set_config('test.time_other',other_id::text,true);
  insert into auth.users(id) values(owner_id),(other_id);
  insert into public.profiles(id,proficiency_level) values(owner_id,'B2'),(other_id,'A1')
    on conflict(id) do update set proficiency_level=excluded.proficiency_level;
  perform set_config('request.jwt.claim.sub',owner_id::text,true);
  if has_table_privilege('anon','public.practice_time_intervals','SELECT') then raise exception 'Anon access'; end if;
  if has_table_privilege('authenticated','public.practice_time_intervals','INSERT,UPDATE,DELETE') then raise exception 'Direct writes allowed'; end if;
end $$;
set local role authenticated;
do $$
declare base numeric := floor(extract(epoch from now())*1000)-120000;
  intervals jsonb;
begin
  intervals := jsonb_build_array(jsonb_build_object('start',base,'end',base+20000));
  perform public.record_practice_time('grammar','A1',intervals);
  perform public.record_practice_time('grammar','A1',intervals);
  perform public.record_practice_time('vocabulary','B2',jsonb_build_array(jsonb_build_object('start',base+10000,'end',base+30000)));
  if public.practice_seconds_last_30_days() <> 30 then raise exception 'Retry or overlap duplicated time'; end if;
  if (select count(*) from public.practice_time_intervals) <> 1 then raise exception 'Overlaps not merged'; end if;
  begin
    perform public.record_practice_time('grammar','C1',intervals);
    raise exception 'Higher level accepted';
  exception when raise_exception then if sqlerrm <> 'Practice level unavailable' then raise; end if; end;
  begin
    perform public.record_practice_time('vocabulary','A1',intervals);
    raise exception 'Wrong vocabulary level accepted';
  exception when raise_exception then if sqlerrm <> 'Practice level unavailable' then raise; end if; end;
  begin
    perform public.record_practice_time('grammar','A1',jsonb_build_array(jsonb_build_object('start',base,'end',base+31000)));
    raise exception 'Unbounded duration accepted';
  exception when raise_exception then if sqlerrm <> 'Expired or invalid interval' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',current_setting('test.time_other'),true);
  if public.practice_seconds_last_30_days() <> 0 or exists(select 1 from public.practice_time_intervals) then raise exception 'Cross-account read'; end if;
  perform set_config('request.jwt.claim.sub',current_setting('test.time_owner'),true);
end $$;
reset role;
insert into public.practice_time_intervals values
  (current_setting('test.time_owner')::uuid, now()-interval '720 hours 20 seconds',now()-interval '720 hours'+interval '10 seconds'),
  (current_setting('test.time_owner')::uuid, now()-interval '721 hours',now()-interval '721 hours'+interval '20 seconds');
set local role authenticated;
do $$ begin
  if public.practice_seconds_last_30_days() <> 40 then raise exception 'Rolling cutoff did not clip correctly'; end if;
end $$;
reset role;
select 'PASS: duplicate retries, overlap merge, account isolation, level eligibility, bounded intervals and exact rolling cutoff' as result;
rollback;
