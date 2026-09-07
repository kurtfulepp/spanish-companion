-- Run after the migration, or prepend the migration inside this transaction.
-- Scratch identities, profile changes, and submissions are all rolled back.
begin;
do $$
declare test_owner uuid := gen_random_uuid(); test_other uuid := gen_random_uuid();
begin
  perform set_config('test.grammar_owner', test_owner::text, true);
  perform set_config('test.grammar_other', test_other::text, true);
  perform set_config('test.grammar_attempt', gen_random_uuid()::text, true);
  insert into auth.users(id) values (test_owner), (test_other);
  update public.profiles set proficiency_level = 'A1' where id in (test_owner, test_other);
  if has_table_privilege('anon', 'public.grammar_rule_attempts', 'SELECT') then raise exception 'Anonymous read access'; end if;
  if has_table_privilege('authenticated', 'public.grammar_rule_attempts', 'UPDATE') then raise exception 'Mutable evidence'; end if;
  if has_column_privilege('authenticated', 'public.grammar_rule_attempts', 'created_at', 'INSERT') then raise exception 'Client-controlled evidence time'; end if;
  perform set_config('request.jwt.claim.sub', test_owner::text, true);
end; $$;
set local role authenticated;
do $$
declare owner_id uuid := current_setting('test.grammar_owner')::uuid;
  attempt_id uuid := current_setting('test.grammar_attempt')::uuid;
begin
  insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
    values(attempt_id,owner_id,'A1-04.agreement',1,'A1','{"form-singular":"pequeña"}','La casa es pequeña.','[true,false,true]');
  if (select count(*) from public.grammar_rule_attempts where id=attempt_id) <> 1 then raise exception 'Own evidence unreadable'; end if;
  begin
    insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
      values(attempt_id,owner_id,'A1-04.agreement',1,'A1','{}','Second answer','[]');
    raise exception 'Duplicate retry created another attempt';
  exception when unique_violation then null; end;
  begin
    insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
      values(gen_random_uuid(),owner_id,'B2-04.past-counterfactual',1,'B2','{}','Higher level','[]');
    raise exception 'Future level accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
      values(gen_random_uuid(),owner_id,'A1-04.agreement',1,'A1','{}','   ','[]');
    raise exception 'Empty writing accepted';
  exception when check_violation then null; end;
  perform set_config('request.jwt.claim.sub',current_setting('test.grammar_other'),true);
  if exists(select 1 from public.grammar_rule_attempts where id=attempt_id) then raise exception 'Cross-account read'; end if;
  begin
    insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
      values(gen_random_uuid(),owner_id,'A1-04.agreement',1,'A1','{}','Other account','[]');
    raise exception 'Cross-account write';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',owner_id::text,true);
end; $$;
reset role;
update public.profiles set proficiency_level = 'B2' where id = current_setting('test.grammar_owner')::uuid;
set local role authenticated;
do $$ begin
  insert into public.grammar_rule_attempts(id,user_id,rule_id,content_version,level,answers,writing,self_review)
    values(gen_random_uuid(),current_setting('test.grammar_owner')::uuid,'A1-04.agreement',1,'A1','{}','Earlier-level review','[]');
  if (select count(*) from public.grammar_rule_attempts where id=current_setting('test.grammar_attempt')::uuid) <> 1 then raise exception 'Level change lost evidence'; end if;
end; $$;
reset role;
select 'PASS: owner reads/writes, immutable attempts, retry identity, level access, validation, cross-account isolation, protected timestamps, and retained prerequisite review' as result;
rollback;
