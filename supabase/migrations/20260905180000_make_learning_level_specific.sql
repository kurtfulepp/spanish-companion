-- One exact CEFR level drives curated vocabulary and lessons.
-- Existing progress rows remain linked to their original content.

alter table public.vocabulary_items
  add column if not exists cefr_level text;

-- The original Dining Out set was ordered from simpler to more complex inside
-- each moment. Preserve every row and classify it before making the field required.
update public.vocabulary_items
set cefr_level = case sort_order
  when 1 then 'A1'
  when 2 then 'A2'
  when 3 then 'B1'
  when 4 then 'B2'
  when 5 then 'C1'
end
where cefr_level is null;

alter table public.vocabulary_items
  alter column cefr_level set not null;

alter table public.vocabulary_items
  drop constraint if exists vocabulary_items_cefr_level;

alter table public.vocabulary_items
  add constraint vocabulary_items_cefr_level
  check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

create index if not exists vocabulary_items_section_level_idx
  on public.vocabulary_items (section_id, cefr_level, sort_order);

-- Add one proficient expression to each Dining Out moment so every supported
-- level has a complete path through the theme.
insert into public.vocabulary_items
  (id, section_id, spanish, english, example_es, example_en, usage_note, sort_order, cefr_level)
values
  ('c2000000-0000-4000-8000-000000000011', 'd1000000-0000-4000-8000-000000000001',
   'A ser posible, agradeceríamos una mesa resguardada del bullicio.',
   'If possible, we would appreciate a table sheltered from the noise.',
   'A ser posible, agradeceríamos una mesa resguardada del bullicio, aunque tengamos que esperar.',
   'If possible, we would appreciate a table sheltered from the noise, even if we have to wait.',
   '“A ser posible” and “agradeceríamos” make a precise, tactful request.', 6, 'C2'),
  ('c2000000-0000-4000-8000-000000000012', 'd1000000-0000-4000-8000-000000000002',
   '¿Qué matices aporta la guarnición al plato?',
   'What nuances does the side dish bring to the dish?',
   '¿Qué matices aporta la guarnición al plato y cómo contrasta con la salsa?',
   'What nuances does the side dish bring to the dish, and how does it contrast with the sauce?',
   'Use “aportar matices” to discuss subtle contributions to flavor or meaning.', 6, 'C2'),
  ('c2000000-0000-4000-8000-000000000013', 'd1000000-0000-4000-8000-000000000003',
   'Nos dejamos aconsejar, siempre que se mantenga cierto equilibrio.',
   'We are happy to take your advice, provided a certain balance is maintained.',
   'Nos dejamos aconsejar, siempre que se mantenga cierto equilibrio entre lo tradicional y lo innovador.',
   'We are happy to take your advice, provided a certain balance is maintained between the traditional and the innovative.',
   '“Dejarse aconsejar” and “siempre que” convey openness with a condition.', 6, 'C2'),
  ('c2000000-0000-4000-8000-000000000014', 'd1000000-0000-4000-8000-000000000004',
   '¿Habría alguna alternativa que no desvirtúe el plato?',
   'Would there be an alternative that does not compromise the character of the dish?',
   '¿Habría alguna alternativa sin lácteos que no desvirtúe el plato?',
   'Would there be a dairy-free alternative that does not compromise the character of the dish?',
   '“Desvirtuar” means to alter something so much that it loses its essential character.', 6, 'C2'),
  ('c2000000-0000-4000-8000-000000000015', 'd1000000-0000-4000-8000-000000000005',
   'Entendemos el contratiempo, pero agradeceríamos una solución proporcionada.',
   'We understand the setback, but we would appreciate a proportionate solution.',
   'Entendemos el contratiempo, pero agradeceríamos una solución proporcionada a la demora.',
   'We understand the setback, but we would appreciate a solution proportionate to the delay.',
   'This keeps a complaint measured while clearly requesting a remedy.', 6, 'C2'),
  ('c2000000-0000-4000-8000-000000000016', 'd1000000-0000-4000-8000-000000000006',
   '¿Sería tan amable de desglosarnos los conceptos de la cuenta?',
   'Would you be so kind as to itemize the charges on the bill?',
   'Antes de pagar, ¿sería tan amable de desglosarnos los conceptos de la cuenta?',
   'Before we pay, would you be so kind as to itemize the charges on the bill?',
   '“Desglosar los conceptos” is a precise formal request for an itemized explanation.', 6, 'C2')
on conflict (id) do nothing;

-- The authenticated database role can only read curated items at its profile level.
drop policy if exists "Authenticated users can read published vocabulary items" on public.vocabulary_items;
create policy "Authenticated users can read vocabulary at their level"
  on public.vocabulary_items for select to authenticated
  using (
    cefr_level = (
      select profiles.proficiency_level from public.profiles
      where profiles.id = (select auth.uid())
    )
    and exists (
      select 1
      from public.vocabulary_sections
      join public.vocabulary_themes on vocabulary_themes.id = vocabulary_sections.theme_id
      where vocabulary_sections.id = vocabulary_items.section_id
        and vocabulary_themes.is_published
    )
  );

-- Remember the level used to generate a custom photo list. Existing custom lists
-- remain accessible and retain null when they predate level-aware generation.
alter table public.custom_vocabulary_lists
  add column if not exists cefr_level text;

alter table public.custom_vocabulary_lists
  drop constraint if exists custom_vocabulary_lists_cefr_level;

alter table public.custom_vocabulary_lists
  add constraint custom_vocabulary_lists_cefr_level
  check (cefr_level is null or cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

grant insert (user_id, id, name, words, source, cefr_level, completed, created_at)
  on public.custom_vocabulary_lists to authenticated;

-- Supply an exact guided lesson for every level. The existing B2 lesson remains.
insert into public.lessons (id, title, description, level, estimated_minutes, is_published, published_at)
values
  ('a1000000-0000-4000-8000-000000000001', 'Introduce yourself', 'Practice a short introduction with your name and where you are from.', 'A1', 4, true, now()),
  ('a2000000-0000-4000-8000-000000000001', 'Talk about your weekend', 'Describe familiar weekend activities and their order.', 'A2', 4, true, now()),
  ('b1000000-0000-4000-8000-000000000001', 'Make plans naturally', 'Explain a plan and add a reason or condition.', 'B1', 5, true, now()),
  ('c1000000-0000-4000-8000-000000000001', 'Qualify an opinion', 'Present a position, acknowledge a limitation, and refine your point.', 'C1', 6, true, now()),
  ('c2000000-0000-4000-8000-000000000001', 'Control stance and implication', 'Distinguish assertion, implication, and deliberate shifts in register.', 'C2', 6, true, now())
on conflict (id) do nothing;

insert into public.lesson_activities
  (id, lesson_id, position, activity_type, instruction, prompt, options, correct_answer, explanation, audio_text)
values
  ('a1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 1, 'listening', 'Listen, then choose the name.', '¿Cómo se llama?', '["Kurt", "Carlos", "Luis"]'::jsonb, 'Kurt', 'The speaker says “Me llamo Kurt.”', 'Hola. Me llamo Kurt.'),
  ('a1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000001', 2, 'response', 'Choose the natural introduction.', 'How would you say “I am from New York”?', '["Soy de Nueva York.", "Estoy de Nueva York.", "Tengo de Nueva York."]'::jsonb, 'Soy de Nueva York.', 'Use ser with de to express origin.', null),

  ('a2000000-0000-4000-8000-000000000011', 'a2000000-0000-4000-8000-000000000001', 1, 'listening', 'Listen, then choose the activity.', '¿Qué hace los sábados?', '["Descansa en casa", "Trabaja en la oficina", "Viaja en avión"]'::jsonb, 'Descansa en casa', 'The speaker says “Los sábados descanso en casa.”', 'Los sábados descanso en casa.'),
  ('a2000000-0000-4000-8000-000000000012', 'a2000000-0000-4000-8000-000000000001', 2, 'vocabulary', 'Choose the frequency word.', '___ salgo con amigos, pero no todos los fines de semana.', '["A veces", "Nunca", "Ayer"]'::jsonb, 'A veces', 'A veces describes something that happens on some occasions.', null),

  ('b1000000-0000-4000-8000-000000000011', 'b1000000-0000-4000-8000-000000000001', 1, 'listening', 'Listen, then identify the condition.', '¿De qué depende el plan?', '["Del tiempo", "Del trabajo", "Del dinero"]'::jsonb, 'Del tiempo', 'The speaker says “si hace buen tiempo.”', 'Si hace buen tiempo, saldré a caminar.'),
  ('b1000000-0000-4000-8000-000000000012', 'b1000000-0000-4000-8000-000000000001', 2, 'response', 'Choose the connected answer.', '¿Qué planes tienes hoy?', '["Depende del tiempo. Si no llueve, saldré a caminar.", "Ayer caminar mañana.", "Tiempo porque plan."]'::jsonb, 'Depende del tiempo. Si no llueve, saldré a caminar.', 'The answer states a condition and connects it to the plan.', null),

  ('c1000000-0000-4000-8000-000000000011', 'c1000000-0000-4000-8000-000000000001', 1, 'listening', 'Listen for the qualification.', '¿Qué limitación reconoce?', '["Planificar cada momento puede ser contraproducente", "Planificar nunca ayuda", "Improvisar es imposible"]'::jsonb, 'Planificar cada momento puede ser contraproducente', 'The speaker qualifies the benefit of planning rather than rejecting it.', 'Planificar ayuda a desconectar; ahora bien, llenar cada momento puede resultar contraproducente.'),
  ('c1000000-0000-4000-8000-000000000012', 'c1000000-0000-4000-8000-000000000001', 2, 'response', 'Choose the most nuanced continuation.', 'La planificación puede ser útil;…', '["con todo, conviene dejar margen para la improvisación.", "por eso nunca se improvisa.", "aunque planificar porque sí."]'::jsonb, 'con todo, conviene dejar margen para la improvisación.', '“Con todo” introduces a measured counterpoint in an appropriately formal register.', null),

  ('c2000000-0000-4000-8000-000000000021', 'c2000000-0000-4000-8000-000000000001', 1, 'listening', 'Identify what the speaker leaves implicit.', '¿Qué postura adopta?', '["Matiza una afirmación sin descartarla", "Niega toda relación entre lenguaje y pensamiento", "Presenta una certeza absoluta"]'::jsonb, 'Matiza una afirmación sin descartarla', '“No es tanto… sino…” reframes the claim rather than simply negating it.', 'No es tanto que el lenguaje determine lo que pensamos, sino que matiza cómo lo formulamos.'),
  ('c2000000-0000-4000-8000-000000000022', 'c2000000-0000-4000-8000-000000000001', 2, 'response', 'Preserve the implication while changing register.', 'Choose the precise reformulation.', '["Por nimio que parezca, el matiz condiciona la interpretación.", "El matiz es pequeño y da igual.", "Parece nimio porque no interpreta."]'::jsonb, 'Por nimio que parezca, el matiz condiciona la interpretación.', 'The concessive clause acknowledges apparent insignificance while preserving the claim.', null)
on conflict (id) do nothing;

-- Published lessons are visible only when they match the learner's active level.
drop policy if exists "Authenticated users can read published lessons" on public.lessons;
create policy "Authenticated users can read lessons at their level"
  on public.lessons for select to authenticated
  using (
    is_published
    and level = (
      select profiles.proficiency_level from public.profiles
      where profiles.id = (select auth.uid())
    )
  );

-- Enforce the same rule when starting an attempt; do not rely on the UI filter.
create or replace function public.start_lesson_attempt(p_lesson_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_total integer;
  v_attempt_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select count(*) into v_total
  from public.lesson_activities
  join public.lessons on lessons.id = lesson_activities.lesson_id
  join public.profiles on profiles.id = v_user_id
  where lesson_activities.lesson_id = p_lesson_id
    and lessons.is_published
    and lessons.level = profiles.proficiency_level;

  if v_total < 1 then
    raise exception 'Lesson is unavailable for the current level';
  end if;

  insert into public.lesson_attempts (user_id, lesson_id, total_activities)
  values (v_user_id, p_lesson_id, v_total)
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;

revoke all on function public.start_lesson_attempt(uuid) from public;
grant execute on function public.start_lesson_attempt(uuid) to authenticated;
