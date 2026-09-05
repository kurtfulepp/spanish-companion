-- Transactional security and functional checks; no test data is retained.
begin;
do $$
declare owner_id uuid;
begin
  select id into owner_id from public.profiles limit 1;
  if owner_id is null then raise exception 'Existing profile required'; end if;
  perform set_config('test.practice_owner',owner_id::text,true);
  perform set_config('test.practice_list',gen_random_uuid()::text,true);
  perform set_config('request.jwt.claim.sub',owner_id::text,true);
  if has_function_privilege('anon','public.record_custom_vocabulary_review(uuid,integer,text)','EXECUTE') then raise exception 'Anonymous RPC access'; end if;
  if has_table_privilege('authenticated','public.custom_vocabulary_progress','INSERT') or has_table_privilege('authenticated','public.custom_vocabulary_progress','UPDATE') then raise exception 'Direct progress writes allowed'; end if;
  if has_column_privilege('authenticated','public.custom_vocabulary_lists','confident_count','UPDATE') then raise exception 'Client can forge counts'; end if;
end;
$$;
set local role authenticated;
do $$
declare owner_id uuid := current_setting('test.practice_owner')::uuid;
  list_id uuid := current_setting('test.practice_list')::uuid;
  result jsonb;
begin
  insert into public.custom_vocabulary_lists(user_id,id,name,words,source)
    values(owner_id,list_id,'Practice test','[{"english":"mug","spanish":"la taza"},{"english":"spoon","spanish":"la cuchara"}]','photo');
  result := public.record_custom_vocabulary_review(list_id,0,'confident');
  if result <> '{"practiced_count":1,"confident_count":1,"completed":false}'::jsonb then raise exception 'First review incorrect'; end if;
  result := public.record_custom_vocabulary_review(list_id,0,'confident');
  if (result->>'practiced_count')::int <> 1 then raise exception 'Retry duplicated word'; end if;
  result := public.record_custom_vocabulary_review(list_id,1,'learning');
  if (result->>'completed')::boolean then raise exception 'Completed too early'; end if;
  result := public.record_custom_vocabulary_review(list_id,1,'confident');
  if not (result->>'completed')::boolean then raise exception 'All confident did not complete list'; end if;
  update public.custom_vocabulary_lists set completed=false where id=list_id;
  if (select count(*) from public.custom_vocabulary_progress where custom_vocabulary_progress.list_id=current_setting('test.practice_list')::uuid) <> 2 then raise exception 'Restore lost progress'; end if;
  update public.custom_vocabulary_lists set completed=true where id=list_id;
  result := public.record_custom_vocabulary_review(list_id,0,'learning');
  if (result->>'completed')::boolean then raise exception 'Needs-practice did not reopen list'; end if;
  begin
    perform public.record_custom_vocabulary_review(list_id,2,'confident'); raise exception 'Out of range accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.record_custom_vocabulary_review(list_id,0,'bogus'); raise exception 'Invalid status accepted';
  exception when invalid_parameter_value then null; end;
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  if exists(select 1 from public.custom_vocabulary_progress where custom_vocabulary_progress.list_id=current_setting('test.practice_list')::uuid) then raise exception 'Other user reads progress'; end if;
  begin
    perform public.record_custom_vocabulary_review(list_id,0,'confident'); raise exception 'Other user changed progress';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',owner_id::text,true);
  update public.custom_vocabulary_lists set deleted_at=now() where id=list_id;
  begin
    perform public.record_custom_vocabulary_review(list_id,0,'confident'); raise exception 'Deleted list reviewed';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;
do $$ begin
  if exists(select 1 from public.custom_vocabulary_progress where list_id=current_setting('test.practice_list')::uuid) then raise exception 'Deletion did not remove progress'; end if;
end; $$;
select 'PASS: save, retry, automatic completion, manual restore, reopening, invalid inputs, cross-user isolation, deletion cleanup, and privilege boundaries' as result;
rollback;
