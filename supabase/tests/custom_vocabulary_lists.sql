-- Run against an initialized project. Entire test rolls back; no user data is retained.
begin;
do $$
declare owner_id uuid;
begin
  select id into owner_id from public.profiles limit 1;
  if owner_id is null then raise exception 'An existing profile is required'; end if;
  perform set_config('test.list_owner', owner_id::text, true);
  perform set_config('test.list_id', gen_random_uuid()::text, true);
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  if has_table_privilege('anon', 'public.custom_vocabulary_lists', 'SELECT') then raise exception 'Anonymous read allowed'; end if;
  if has_table_privilege('authenticated', 'public.custom_vocabulary_lists', 'DELETE') then raise exception 'Tombstones can be bypassed'; end if;
end;
$$;
set local role authenticated;
do $$
declare owner_id uuid := current_setting('test.list_owner')::uuid;
  list_id uuid := current_setting('test.list_id')::uuid;
  affected integer;
begin
  insert into public.custom_vocabulary_lists(user_id,id,name,words,source,completed,created_at)
    values(owner_id,list_id,'Account storage test','[{"english":"mug","spanish":"la taza"}]','photo',false,now());
  if (select count(*) from public.custom_vocabulary_lists where id=list_id) <> 1 then raise exception 'Owner cannot read saved list'; end if;
  update public.custom_vocabulary_lists set completed=true where id=list_id;
  insert into public.custom_vocabulary_lists(user_id,id,name,words,source,completed,created_at)
    values(owner_id,list_id,'Stale retry','[{"english":"mug","spanish":"la taza"}]','photo',false,now()) on conflict(user_id,id) do nothing;
  if not (select completed from public.custom_vocabulary_lists where id=list_id) then raise exception 'Retry overwrote completion'; end if;
  update public.custom_vocabulary_lists set completed=false where id=list_id;
  if (select completed from public.custom_vocabulary_lists where id=list_id) then raise exception 'Restore failed'; end if;
  begin
    insert into public.custom_vocabulary_lists(user_id,id,name,words) values(owner_id,gen_random_uuid(),'Invalid photo field','[{"english":"mug","spanish":"la taza","photo":"not-allowed"}]');
    raise exception 'Photo field accepted';
  exception when check_violation then null;
  end;
  perform set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
  if exists(select 1 from public.custom_vocabulary_lists where id=list_id) then raise exception 'Other user can read list'; end if;
  update public.custom_vocabulary_lists set completed=true where id=list_id;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Other user can change list'; end if;
  begin
    insert into public.custom_vocabulary_lists(user_id,id,name,words) values(owner_id,gen_random_uuid(),'Forged ownership','[{"english":"mug","spanish":"la taza"}]');
    raise exception 'Other user can create for owner';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claim.sub', owner_id::text, true);
  update public.custom_vocabulary_lists set deleted_at=now() where id=list_id;
  if exists(select 1 from public.custom_vocabulary_lists where id=list_id and (words <> '[]'::jsonb or name <> 'Deleted list' or deleted_at is null)) then raise exception 'Deletion retained list text'; end if;
  insert into public.custom_vocabulary_lists(user_id,id,name,words) values(owner_id,list_id,'Old browser copy','[{"english":"mug","spanish":"la taza"}]') on conflict(user_id,id) do nothing;
  if exists(select 1 from public.custom_vocabulary_lists where id=list_id and deleted_at is null) then raise exception 'Import resurrected deletion'; end if;
end;
$$;
reset role;
select 'PASS: owner save/read/complete/restore, retry safety, text validation, cross-user isolation, anonymous denial, and deletion tombstone' as result;
rollback;
