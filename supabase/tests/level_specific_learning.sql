begin;

do $$
begin
  if exists (
    select 1 from public.vocabulary_items
    where cefr_level not in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')
  ) then raise exception 'Invalid vocabulary level'; end if;

  if exists (
    select wanted.level
    from (values ('A1'), ('A2'), ('B1'), ('B2'), ('C1'), ('C2')) as wanted(level)
    where not exists (
      select 1 from public.vocabulary_items
      join public.vocabulary_sections on vocabulary_sections.id = vocabulary_items.section_id
      where vocabulary_sections.theme_id = 'dining-out'
        and vocabulary_items.cefr_level = wanted.level
    )
  ) then raise exception 'Dining Out is missing a supported level'; end if;

  if exists (
    select wanted.level
    from (values ('A1'), ('A2'), ('B1'), ('B2'), ('C1'), ('C2')) as wanted(level)
    where not exists (
      select 1 from public.lessons
      where lessons.level = wanted.level and lessons.is_published
    )
  ) then raise exception 'A supported level is missing a published lesson'; end if;
end;
$$;

rollback;
