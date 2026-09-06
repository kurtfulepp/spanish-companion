begin;

do $$
begin
  if (select count(*) from public.vocabulary_themes where is_published) <> 7 then
    raise exception 'Expected seven published vocabulary topics';
  end if;
  if exists (
    select id from public.vocabulary_themes
    where is_published and (select count(*) from public.vocabulary_sections where theme_id = vocabulary_themes.id) <> 6
  ) then raise exception 'Every topic must contain six moments'; end if;
  if not (select relrowsecurity from pg_class where oid = 'public.topic_generation_quota'::regclass) then
    raise exception 'Topic generation quota RLS is disabled';
  end if;
  if has_function_privilege('anon', 'public.consume_topic_generation_quota()', 'EXECUTE') then
    raise exception 'Anonymous users can consume topic-generation quota';
  end if;
  if not has_function_privilege('authenticated', 'public.consume_topic_generation_quota()', 'EXECUTE') then
    raise exception 'Authenticated users cannot consume topic-generation quota';
  end if;
  if has_function_privilege('anon', 'public.save_topic_expansion(text,jsonb,text,text)', 'EXECUTE') then
    raise exception 'Anonymous users can save generated vocabulary';
  end if;
end;
$$;

rollback;

