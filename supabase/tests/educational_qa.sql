begin;
do $$
begin
  if has_function_privilege('authenticated', 'public.complete_level_assessment(integer[],text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.complete_level_assessment(integer[],text)', 'EXECUTE')
  then raise exception 'Unvalidated CEFR placement remains callable'; end if;
  if (select count(*) from public.vocabulary_items where cefr_level = 'C1' and source = 'curated' and usage_note like 'C1 refinement:%') <> 6
  then raise exception 'Missing C1 register and stance corrections'; end if;
  if not exists(select 1 from public.lesson_activities where id = 'b2000000-0000-4000-8000-000000000013' and prompt like 'Complete with the simple future:%' and correct_answer = any(array(select jsonb_array_elements_text(options))))
  then raise exception 'Future lesson still lacks an unambiguous task'; end if;
  if exists(select 1 from public.lesson_activities where not options @> jsonb_build_array(correct_answer))
  then raise exception 'Answer missing from options'; end if;
end $$;
rollback;
