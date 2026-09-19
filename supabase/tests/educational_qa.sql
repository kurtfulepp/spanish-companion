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
  if not exists(select 1 from public.vocabulary_items where source = 'curated' and cefr_level = 'B2'
    and spanish = '¿Qué alternativa podrían ofrecernos que saliera más rápido?'
    and example_es = 'Si este plato tarda mucho, ¿qué alternativa podrían ofrecernos que saliera más rápido?')
  then raise exception 'Open-condition example correction missing'; end if;
  if not exists(select 1 from public.vocabulary_items where source = 'curated' and cefr_level = 'B2'
    and spanish = 'No quisiera devolverlo, pero está demasiado frío.'
    and usage_note like 'Quisiera is an imperfect subjunctive form%')
  then raise exception 'Quisiera explanation correction missing'; end if;
  if not exists(select 1 from public.lesson_activities where prompt like 'Keep both ideas: planning can help,%'
    and correct_answer = 'con todo, conviene dejar margen para la improvisación.')
  then raise exception 'C1 task context correction missing'; end if;
  if not exists(select 1 from public.lesson_activities where prompt = 'Reformulate without changing the meaning: Aunque el matiz parezca insignificante, influye en cómo se interpreta el mensaje.'
    and correct_answer = 'Por nimio que parezca, el matiz condiciona la interpretación.')
  then raise exception 'C2 task context correction missing'; end if;
  if exists(select 1 from public.lesson_activities where not options @> jsonb_build_array(correct_answer))
  then raise exception 'Answer missing from options'; end if;
end $$;
rollback;
