begin;
select plan(7);

select is(
  (select count(*)::integer from public.vocabulary_learning_sets
   where theme_id = 'dining-out' and cefr_level = 'B2' and content_version = 1),
  5,
  'Dining Out B2 has five versioned learning sets'
);

select is(
  (select count(*)::integer from public.vocabulary_items i
   join public.vocabulary_sections s on s.id = i.section_id
   where s.theme_id = 'dining-out' and i.cefr_level = 'B2' and i.learning_set_id is not null),
  120,
  'Dining Out B2 has 120 curriculum expressions'
);

select is(
  (select count(*)::integer from public.vocabulary_items i
   join public.vocabulary_sections s on s.id = i.section_id
   where s.theme_id = 'dining-out' and i.cefr_level = 'B2' and i.curriculum_role = 'core'),
  96,
  '96 expressions are B2 core content'
);

select is(
  (select count(*)::integer from public.vocabulary_items i
   join public.vocabulary_sections s on s.id = i.section_id
   where s.theme_id = 'dining-out' and i.cefr_level = 'B2' and i.curriculum_role = 'review'),
  24,
  '24 expressions are cumulative foundations'
);

select is(
  (select count(*)::integer from (
    select learning_set_id
    from public.vocabulary_items
    where learning_set_id like 'dining-out-b2-v1-s%'
    group by learning_set_id
    having count(*) = 24
  ) complete_sets),
  5,
  'every set contains 24 expressions'
);

select is(
  (select count(*)::integer from (
    select i.learning_set_id, s.id
    from public.vocabulary_items i
    join public.vocabulary_sections s on s.id = i.section_id
    where i.learning_set_id like 'dining-out-b2-v1-s%'
    group by i.learning_set_id, s.id
    having count(*) = 4
  ) moment_groups),
  30,
  'every set contains four expressions from each of six moments'
);

select is(
  (select count(*)::integer from public.vocabulary_items
   where learning_set_id like 'dining-out-b2-v1-s%' and source <> 'curated'),
  0,
  'optional AI expansions are excluded from curriculum completion'
);

select * from finish();
rollback;
