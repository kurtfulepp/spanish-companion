-- Dining Out B2 curriculum pilot: five versioned sets of 24 expressions.
-- Each set spans all six real-world moments. Twenty-four cumulative foundation
-- items are visibly distinguished from the 96 B2 core items. AI expansions
-- remain optional and never count toward completion of this curriculum.

create table if not exists public.vocabulary_learning_sets (
  id text primary key,
  theme_id text not null references public.vocabulary_themes(id) on delete cascade,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  set_number smallint not null check (set_number between 1 and 20),
  title text not null check (char_length(title) between 1 and 80),
  description text not null check (char_length(description) between 1 and 240),
  item_count smallint not null check (item_count between 1 and 100),
  content_version smallint not null default 1 check (content_version > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(theme_id, cefr_level, content_version, set_number)
);

alter table public.vocabulary_learning_sets enable row level security;
revoke all on public.vocabulary_learning_sets from public, anon, authenticated;
grant select on public.vocabulary_learning_sets to authenticated;
drop policy if exists "Learners can read published sets at their level" on public.vocabulary_learning_sets;
create policy "Learners can read published sets at their level"
  on public.vocabulary_learning_sets for select to authenticated
  using (
    is_published
    and cefr_level = (
      select profiles.proficiency_level from public.profiles
      where profiles.id = (select auth.uid())
    )
    and exists (
      select 1 from public.vocabulary_themes
      where vocabulary_themes.id = vocabulary_learning_sets.theme_id
        and vocabulary_themes.is_published
    )
  );

alter table public.vocabulary_items
  add column if not exists learning_set_id text references public.vocabulary_learning_sets(id) on delete set null,
  add column if not exists curriculum_position smallint,
  add column if not exists curriculum_role text,
  add column if not exists introduced_level text,
  add column if not exists content_version smallint;

alter table public.vocabulary_items
  drop constraint if exists vocabulary_items_curriculum_position,
  drop constraint if exists vocabulary_items_curriculum_role,
  drop constraint if exists vocabulary_items_introduced_level,
  drop constraint if exists vocabulary_items_content_version,
  drop constraint if exists vocabulary_items_curriculum_fields;
alter table public.vocabulary_items
  add constraint vocabulary_items_curriculum_position
    check (curriculum_position is null or curriculum_position between 1 and 24),
  add constraint vocabulary_items_curriculum_role
    check (curriculum_role is null or curriculum_role in ('core', 'review')),
  add constraint vocabulary_items_introduced_level
    check (introduced_level is null or introduced_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  add constraint vocabulary_items_content_version
    check (content_version is null or content_version > 0),
  add constraint vocabulary_items_curriculum_fields
    check (
      (learning_set_id is null and curriculum_position is null and curriculum_role is null and introduced_level is null and content_version is null)
      or
      (learning_set_id is not null and curriculum_position is not null and curriculum_role is not null and introduced_level is not null and content_version is not null and source = 'curated' and owner_id is null)
    );

create unique index if not exists vocabulary_items_learning_set_position
  on public.vocabulary_items(learning_set_id, section_id, curriculum_position)
  where learning_set_id is not null;

insert into public.vocabulary_learning_sets
  (id, theme_id, cefr_level, set_number, title, description, item_count, content_version, is_published)
values
  ('dining-out-b2-v1-s1', 'dining-out', 'B2', 1, 'Essential exchanges', 'Handle the core exchange in every moment of a meal.', 24, 1, true),
  ('dining-out-b2-v1-s2', 'dining-out', 'B2', 2, 'Make it specific', 'Add detail, clarify choices, and shape the meal to your needs.', 24, 1, true),
  ('dining-out-b2-v1-s3', 'dining-out', 'B2', 3, 'Compare and coordinate', 'Compare options and coordinate a more complex meal.', 24, 1, true),
  ('dining-out-b2-v1-s4', 'dining-out', 'B2', 4, 'Handle nuance', 'Manage constraints, tactful requests, and small problems.', 24, 1, true),
  ('dining-out-b2-v1-s5', 'dining-out', 'B2', 5, 'Respond flexibly', 'Use precise, flexible language across the whole experience.', 24, 1, true)
on conflict(id) do update set
  title = excluded.title,
  description = excluded.description,
  item_count = excluded.item_count,
  is_published = excluded.is_published;

-- Preserve the six existing B2 curated expressions as the first item for each
-- moment in Set 1. Their stable IDs and any assessment history remain intact.
update public.vocabulary_items i
set learning_set_id = 'dining-out-b2-v1-s1',
    curriculum_position = 1,
    curriculum_role = 'core',
    introduced_level = 'B2',
    content_version = 1
from public.vocabulary_sections s
where i.section_id = s.id
  and s.theme_id = 'dining-out'
  and i.cefr_level = 'B2'
  and i.source = 'curated'
  and i.owner_id is null
  and i.sort_order = 4;

with seed(section_slug, set_number, position, role, introduced_level, spanish, english, example_es, example_en, note) as (values
  -- Getting a table: 19 new items plus the preserved Set 1 item.
  ('getting-a-table', 1, 2, 'review', 'B1', '¿Habría una mesa disponible dentro de unos veinte minutos?', 'Would a table be available in about twenty minutes?', 'No tenemos prisa. ¿Habría una mesa disponible dentro de unos veinte minutos?', 'We are not in a hurry. Would a table be available in about twenty minutes?', 'The conditional makes the availability question less abrupt.'),
  ('getting-a-table', 1, 3, 'core', 'B2', 'Venimos sin reserva; ¿qué opciones tenemos?', 'We came without a reservation; what options do we have?', 'Venimos sin reserva; ¿qué opciones tenemos para cenar aquí esta noche?', 'We came without a reservation; what options do we have for dining here tonight?', 'Use this to invite alternatives rather than ask only for yes or no.'),
  ('getting-a-table', 1, 4, 'core', 'B2', 'Si se libera una mesa junto a la ventana, nos gustaría cambiar.', 'If a table by the window opens up, we would like to move.', 'Estamos bien aquí, pero si se libera una mesa junto a la ventana, nos gustaría cambiar.', 'We are fine here, but if a table by the window opens up, we would like to move.', 'This combines a real condition with a tactful preference.'),
  ('getting-a-table', 2, 1, 'review', 'A2', 'Tenemos una reserva a nombre de Fulepp.', 'We have a reservation under the name Fulepp.', 'Buenas noches, tenemos una reserva a nombre de Fulepp para las ocho.', 'Good evening, we have a reservation under the name Fulepp for eight.', 'A nombre de is the standard phrase for a reservation name.'),
  ('getting-a-table', 2, 2, 'core', 'B2', 'Nos apuntamos en la lista y volvemos cuando nos digan.', 'We will put our names on the list and return when you tell us.', 'Nos apuntamos en la lista y volvemos cuando nos digan que la mesa está lista.', 'We will put our names on the list and return when you tell us the table is ready.', 'The present subjunctive follows a future time clause with cuando.'),
  ('getting-a-table', 2, 3, 'core', 'B2', '¿Podrían avisarnos por mensaje cuando esté lista la mesa?', 'Could you text us when the table is ready?', 'Vamos a esperar cerca. ¿Podrían avisarnos por mensaje cuando esté lista la mesa?', 'We will wait nearby. Could you text us when the table is ready?', 'Avisar por mensaje is widely understood for a text notification.'),
  ('getting-a-table', 2, 4, 'core', 'B2', 'Nos vendría mejor una mesa alejada de la entrada.', 'A table away from the entrance would suit us better.', 'Hace un poco de frío; nos vendría mejor una mesa alejada de la entrada.', 'It is a little cold; a table away from the entrance would suit us better.', 'Venirle bien or mal expresses what suits someone.'),
  ('getting-a-table', 3, 1, 'review', 'B1', '¿Cuánto calculan que tardará en quedar libre una mesa?', 'How long do you estimate it will take for a table to open up?', '¿Cuánto calculan que tardará en quedar libre una mesa para cuatro?', 'How long do you estimate it will take for a table for four to open up?', 'Calcular que is useful for asking for an estimate.'),
  ('getting-a-table', 3, 2, 'core', 'B2', 'Mientras esperamos, ¿podemos tomar algo en la barra?', 'While we wait, can we have a drink at the bar?', 'Mientras esperamos a que se libere una mesa, ¿podemos tomar algo en la barra?', 'While we wait for a table to open up, can we have a drink at the bar?', 'Esperar a que takes the subjunctive when the event has not happened.'),
  ('getting-a-table', 3, 3, 'core', 'B2', 'No nos importa esperar con tal de que podamos sentarnos juntos.', 'We do not mind waiting as long as we can sit together.', 'No nos importa esperar un poco más con tal de que podamos sentarnos juntos.', 'We do not mind waiting a little longer as long as we can sit together.', 'Con tal de que introduces a condition and takes the subjunctive.'),
  ('getting-a-table', 3, 4, 'core', 'B2', 'Somos cinco, aunque quizá se incorpore otra persona más tarde.', 'There are five of us, although someone else may join later.', 'Somos cinco, aunque quizá se incorpore otra persona más tarde. ¿Hay espacio?', 'There are five of us, although someone else may join later. Is there room?', 'Incorporarse is a natural way to say that someone joins a group.'),
  ('getting-a-table', 4, 1, 'review', 'B1', '¿Podemos dejar el cochecito en algún lugar seguro?', 'Can we leave the stroller somewhere safe?', '¿Podemos dejar el cochecito en algún lugar seguro sin bloquear el paso?', 'Can we leave the stroller somewhere safe without blocking the way?', 'Cochecito is common for a baby stroller; coche de bebé is another regional form.'),
  ('getting-a-table', 4, 2, 'core', 'B2', 'Agradeceríamos que nos sentaran en una zona tranquila.', 'We would appreciate being seated in a quiet area.', 'Si tienen disponibilidad, agradeceríamos que nos sentaran en una zona tranquila.', 'If you have availability, we would appreciate being seated in a quiet area.', 'Agradecer que takes the subjunctive for the requested action.'),
  ('getting-a-table', 4, 3, 'core', 'B2', 'Si hubiera una cancelación, ¿podrían tenernos en cuenta?', 'If there were a cancellation, could you keep us in mind?', 'Si hubiera una cancelación para las nueve, ¿podrían tenernos en cuenta?', 'If there were a cancellation for nine, could you keep us in mind?', 'This hypothetical condition uses imperfect subjunctive plus conditional.'),
  ('getting-a-table', 4, 4, 'core', 'B2', '¿Habría inconveniente en que nos quedáramos un poco más?', 'Would there be any problem with us staying a little longer?', 'Tenemos una reunión después. ¿Habría inconveniente en que nos quedáramos un poco más?', 'We have a meeting afterward. Would there be any problem with us staying a little longer?', 'Inconveniente en que is followed by the subjunctive.'),
  ('getting-a-table', 5, 1, 'core', 'B2', 'Dado que uno de nosotros tiene movilidad reducida, necesitamos una mesa accesible.', 'Since one of us has reduced mobility, we need an accessible table.', 'Dado que uno de nosotros tiene movilidad reducida, necesitamos una mesa accesible y sin escalones.', 'Since one of us has reduced mobility, we need an accessible table with no steps.', 'Dado que introduces a clear reason in a neutral register.'),
  ('getting-a-table', 5, 2, 'core', 'B2', 'Preferimos esperar antes que quedar separados en dos mesas.', 'We would rather wait than be split between two tables.', 'Somos un grupo. Preferimos esperar antes que quedar separados en dos mesas.', 'We are a group. We would rather wait than be split between two tables.', 'Preferir antes que contrasts two options directly.'),
  ('getting-a-table', 5, 3, 'core', 'B2', '¿Se podrían juntar dos mesas sin obstaculizar el paso?', 'Could two tables be joined without blocking the way?', '¿Se podrían juntar dos mesas sin obstaculizar el paso de los meseros?', 'Could two tables be joined without blocking the servers?', 'Mesero is common in Latin America; camarero is common in Spain.'),
  ('getting-a-table', 5, 4, 'core', 'B2', 'Nos adaptamos al horario siempre que podamos cenar con calma.', 'We can adapt to the time as long as we can dine without rushing.', 'Nos adaptamos al horario que tengan disponible siempre que podamos cenar con calma.', 'We can adapt to the time you have available as long as we can dine without rushing.', 'Siempre que states the condition that makes the compromise acceptable.'),

  -- Understanding the menu.
  ('understanding-the-menu', 1, 2, 'review', 'B1', '¿Qué ingredientes lleva este plato?', 'What ingredients does this dish contain?', 'No reconozco el nombre. ¿Qué ingredientes lleva este plato?', 'I do not recognize the name. What ingredients does this dish contain?', 'Llevar commonly means to contain when discussing food.'),
  ('understanding-the-menu', 1, 3, 'core', 'B2', '¿En qué se diferencia este plato del que está al lado?', 'How is this dish different from the one next to it?', 'Los dos parecen parecidos. ¿En qué se diferencia este plato del que está al lado?', 'The two look similar. How is this dish different from the one next to it?', 'En qué se diferencia invites a useful comparison.'),
  ('understanding-the-menu', 1, 4, 'core', 'B2', '¿El plato se sirve tal como aparece descrito?', 'Is the dish served as it is described?', '¿El plato se sirve tal como aparece descrito o cambia según el día?', 'Is the dish served as described, or does it change depending on the day?', 'Tal como links the actual dish to its written description.'),
  ('understanding-the-menu', 2, 1, 'review', 'A2', '¿Cuál es la especialidad de la casa?', 'What is the house specialty?', 'Es nuestra primera visita. ¿Cuál es la especialidad de la casa?', 'It is our first visit. What is the house specialty?', 'Especialidad de la casa is broadly understood.'),
  ('understanding-the-menu', 2, 2, 'core', 'B2', 'Si tuviera que elegir uno, ¿con cuál se quedaría?', 'If you had to choose one, which would you go with?', 'Entre estos dos platos, si tuviera que elegir uno, ¿con cuál se quedaría?', 'Between these two dishes, if you had to choose one, which would you go with?', 'Quedarse con means to choose after comparing options.'),
  ('understanding-the-menu', 2, 3, 'core', 'B2', '¿La salsa predomina o deja que se note el sabor del pescado?', 'Does the sauce dominate, or does it let the flavor of the fish come through?', 'Prefiero sabores equilibrados. ¿La salsa predomina o deja que se note el sabor del pescado?', 'I prefer balanced flavors. Does the sauce dominate, or does it let the flavor of the fish come through?', 'This asks for a nuanced description rather than a basic ingredient list.'),
  ('understanding-the-menu', 2, 4, 'core', 'B2', '¿Qué quiere decir exactamente que está curado?', 'What exactly does it mean that it is cured?', 'No conozco esa preparación. ¿Qué quiere decir exactamente que está curado?', 'I do not know that preparation. What exactly does it mean that it is cured?', 'Use qué quiere decir exactamente to clarify menu terminology.'),
  ('understanding-the-menu', 3, 1, 'review', 'B1', '¿Tienen opciones vegetarianas que no sean solo ensalada?', 'Do you have vegetarian options that are not just salad?', '¿Tienen opciones vegetarianas completas que no sean solo ensalada?', 'Do you have complete vegetarian options that are not just salad?', 'Que no sean refers to an unspecified option and takes the subjunctive.'),
  ('understanding-the-menu', 3, 2, 'core', 'B2', 'Busco algo sabroso pero que no resulte demasiado pesado.', 'I am looking for something flavorful but not too heavy.', 'Para cenar busco algo sabroso pero que no resulte demasiado pesado.', 'For dinner I am looking for something flavorful but not too heavy.', 'Resultar describes how something comes across or feels.'),
  ('understanding-the-menu', 3, 3, 'core', 'B2', '¿Se nota mucho el sabor ahumado?', 'Is the smoky flavor very noticeable?', 'No suelo comer alimentos ahumados. ¿Se nota mucho el sabor ahumado?', 'I do not usually eat smoked foods. Is the smoky flavor very noticeable?', 'Notarse is useful for asking how prominent a flavor is.'),
  ('understanding-the-menu', 3, 4, 'core', 'B2', '¿Qué textura tiene y cómo está preparado?', 'What texture does it have, and how is it prepared?', 'Antes de decidir, ¿qué textura tiene y cómo está preparado?', 'Before deciding, what texture does it have, and how is it prepared?', 'A combined question helps distinguish unfamiliar dishes.'),
  ('understanding-the-menu', 4, 1, 'review', 'B1', '¿El menú incluye bebida y postre?', 'Does the set menu include a drink and dessert?', '¿El menú del día incluye bebida y postre o se cobran aparte?', 'Does the set menu include a drink and dessert, or are they charged separately?', 'Menú del día often means a fixed-price set menu.'),
  ('understanding-the-menu', 4, 2, 'core', 'B2', '¿Podría explicarme cómo se elabora este plato?', 'Could you explain how this dish is prepared?', 'Me interesa la preparación. ¿Podría explicarme cómo se elabora este plato?', 'I am interested in the preparation. Could you explain how this dish is prepared?', 'Elaborar is a neutral, precise verb for preparing food.'),
  ('understanding-the-menu', 4, 3, 'core', 'B2', '¿Cuál de estos platos representa mejor la cocina local?', 'Which of these dishes best represents the local cuisine?', 'Quisiera probar algo típico. ¿Cuál de estos platos representa mejor la cocina local?', 'I would like to try something typical. Which dish best represents the local cuisine?', 'This asks for cultural guidance without assuming one dish is authentic.'),
  ('understanding-the-menu', 4, 4, 'core', 'B2', '¿Hay algún ingrediente que pueda resultar amargo?', 'Is there any ingredient that might taste bitter?', 'No me molestan los sabores intensos, pero ¿hay algún ingrediente que pueda resultar amargo?', 'I do not mind intense flavors, but is there any ingredient that might taste bitter?', 'An indefinite ingredient after hay algún takes the subjunctive here.'),
  ('understanding-the-menu', 5, 1, 'core', 'B2', '¿Cómo equilibran la acidez y el picante en este plato?', 'How do they balance acidity and heat in this dish?', 'Me gustan ambos sabores. ¿Cómo equilibran la acidez y el picante en este plato?', 'I like both flavors. How do they balance acidity and heat in this dish?', 'Useful for discussing how flavors work together.'),
  ('understanding-the-menu', 5, 2, 'core', 'B2', '¿Qué plato recomendaría para alguien que quiere probar algo poco habitual?', 'What dish would you recommend for someone who wants to try something unusual?', '¿Qué plato recomendaría para alguien que quiere probar algo poco habitual pero no demasiado arriesgado?', 'What dish would you recommend for someone who wants to try something unusual but not too adventurous?', 'Para alguien que describes the diner rather than only the dish.'),
  ('understanding-the-menu', 5, 3, 'core', 'B2', 'Entre estas dos opciones, ¿cuál tiene un sabor más definido?', 'Between these two options, which has a more distinctive flavor?', 'Entre estas dos opciones, ¿cuál tiene un sabor más definido sin ser demasiado fuerte?', 'Between these two options, which has a more distinctive flavor without being too strong?', 'Sabor definido means a clear, distinctive flavor.'),
  ('understanding-the-menu', 5, 4, 'core', 'B2', '¿La ración es suficiente para compartir o conviene pedir dos?', 'Is the portion enough to share, or is it better to order two?', 'Somos cuatro. ¿La ración es suficiente para compartir o conviene pedir dos?', 'There are four of us. Is the portion enough to share, or is it better to order two?', 'Convenir is useful for asking what is advisable.'),

  -- Ordering naturally.
  ('ordering-naturally', 1, 2, 'review', 'A2', 'Para empezar, nos gustaría compartir dos entradas.', 'To start, we would like to share two appetizers.', 'Para empezar, nos gustaría compartir dos entradas y luego pedir los platos fuertes.', 'To start, we would like to share two appetizers and then order the main courses.', 'Entrada is common for appetizer; entrante is common in Spain.'),
  ('ordering-naturally', 1, 3, 'core', 'B2', 'Ya estamos listos; yo voy a pedir el pescado.', 'We are ready; I am going to order the fish.', 'Ya estamos listos; yo voy a pedir el pescado y ella se queda con la pasta.', 'We are ready; I will order the fish, and she will go with the pasta.', 'This coordinates several diners naturally.'),
  ('ordering-naturally', 1, 4, 'core', 'B2', '¿Podemos pedir las entradas primero y decidir lo demás después?', 'Can we order the appetizers first and decide the rest later?', 'Todavía dudamos con los platos fuertes. ¿Podemos pedir las entradas primero y decidir lo demás después?', 'We are still unsure about the main courses. Can we order the appetizers first and decide the rest later?', 'Lo demás refers concisely to everything else.'),
  ('ordering-naturally', 2, 1, 'review', 'A2', 'Quisiera el pescado, pero sin papas fritas.', 'I would like the fish, but without fries.', 'Quisiera el pescado, pero sin papas fritas; prefiero la ensalada.', 'I would like the fish, but without fries; I prefer the salad.', 'Quisiera is polite and widely used.'),
  ('ordering-naturally', 2, 2, 'core', 'B2', 'De plato fuerte, me quedo con el que nos recomendó.', 'For the main course, I will go with the one you recommended.', 'De plato fuerte, me quedo con el que nos recomendó al principio.', 'For the main course, I will go with the one you recommended at the beginning.', 'Me quedo con expresses a choice after consideration.'),
  ('ordering-naturally', 2, 3, 'core', 'B2', '¿Le importaría tomar primero las bebidas mientras terminamos de decidir?', 'Would you mind taking the drink order first while we finish deciding?', '¿Le importaría tomar primero las bebidas mientras terminamos de decidir la comida?', 'Would you mind taking the drink order first while we finish deciding on the food?', 'Le importaría plus infinitive is a tactful request.'),
  ('ordering-naturally', 2, 4, 'core', 'B2', 'Vamos a compartir las entradas y luego cada uno pedirá un plato.', 'We are going to share the appetizers, and then each person will order a dish.', 'Vamos a compartir las entradas y luego cada uno pedirá un plato distinto.', 'We are going to share the appetizers, and then each person will order a different dish.', 'This makes the structure of a group order clear.'),
  ('ordering-naturally', 3, 1, 'review', 'B1', '¿Podemos pedir otra ronda de bebidas?', 'Can we order another round of drinks?', 'Antes de pedir la comida, ¿podemos pedir otra ronda de bebidas?', 'Before ordering the food, can we order another round of drinks?', 'Otra ronda is a common way to order another set of drinks.'),
  ('ordering-naturally', 3, 2, 'core', 'B2', 'Todavía estamos decidiendo entre pedir por separado o compartir.', 'We are still deciding between ordering separately or sharing.', 'Todavía estamos decidiendo entre pedir por separado o compartir varios platos.', 'We are still deciding between ordering separately or sharing several dishes.', 'Entre presents the two alternatives under consideration.'),
  ('ordering-naturally', 3, 3, 'core', 'B2', 'Si pedimos esto para compartir, ¿alcanzará para cuatro?', 'If we order this to share, will it be enough for four?', 'Si pedimos dos entradas y esto para compartir, ¿alcanzará para cuatro?', 'If we order two appetizers and this to share, will it be enough for four?', 'Alcanzar means to be sufficient in much of Latin America.'),
  ('ordering-naturally', 3, 4, 'core', 'B2', '¿Podría sugerirnos un orden para que los platos combinen bien?', 'Could you suggest an order so the dishes go well together?', 'Queremos probar varias cosas. ¿Podría sugerirnos un orden para que los platos combinen bien?', 'We want to try several things. Could you suggest an order so the dishes go well together?', 'Para que takes the subjunctive when expressing a desired result.'),
  ('ordering-naturally', 4, 1, 'review', 'B1', 'Para mí lo mismo, pero con la salsa aparte.', 'The same for me, but with the sauce on the side.', 'Para mí lo mismo que pidió ella, pero con la salsa aparte.', 'The same for me as she ordered, but with the sauce on the side.', 'Lo mismo avoids repeating the full order.'),
  ('ordering-naturally', 4, 2, 'core', 'B2', 'Preferiría que trajeran cada plato cuando estuviera listo.', 'I would prefer each dish to be brought when it is ready.', 'No hace falta servir todo a la vez; preferiría que trajeran cada plato cuando estuviera listo.', 'There is no need to serve everything at once; I would prefer each dish to be brought when ready.', 'Preferir que takes the subjunctive for another person’s action.'),
  ('ordering-naturally', 4, 3, 'core', 'B2', 'En lugar de pedir platos individuales, vamos a probar varias cosas.', 'Instead of ordering individual dishes, we are going to try several things.', 'En lugar de pedir platos individuales, vamos a probar varias cosas y compartirlas.', 'Instead of ordering individual dishes, we will try several things and share them.', 'En lugar de introduces an alternative plan.'),
  ('ordering-naturally', 4, 4, 'core', 'B2', '¿Nos puede orientar sobre cuánto pedir para no excedernos?', 'Can you guide us on how much to order so we do not overdo it?', 'Somos seis. ¿Nos puede orientar sobre cuánto pedir para no excedernos?', 'There are six of us. Can you guide us on how much to order so we do not overdo it?', 'Orientar sobre asks for practical guidance.'),
  ('ordering-naturally', 5, 1, 'core', 'B2', 'Vamos a dejarnos aconsejar, pero preferimos sabores poco picantes.', 'We will take your advice, but we prefer mildly spicy flavors.', 'Vamos a dejarnos aconsejar con los platos, pero preferimos sabores poco picantes.', 'We will take your advice on the dishes, but we prefer mildly spicy flavors.', 'Dejarse aconsejar shows openness to a recommendation.'),
  ('ordering-naturally', 5, 2, 'core', 'B2', 'Quisiéramos armar un menú para compartir entre todos.', 'We would like to put together a menu for everyone to share.', 'Quisiéramos armar un menú variado para compartir entre todos.', 'We would like to put together a varied menu for everyone to share.', 'Armar is common in Latin America for putting something together.'),
  ('ordering-naturally', 5, 3, 'core', 'B2', '¿Sería posible escalonar los platos para que no lleguen todos juntos?', 'Would it be possible to stagger the dishes so they do not all arrive together?', '¿Sería posible escalonar los platos para que podamos compartirlos con calma?', 'Would it be possible to stagger the dishes so we can share them at an easy pace?', 'Escalonar means to arrange something in stages.'),
  ('ordering-naturally', 5, 4, 'core', 'B2', 'Antes de cerrar la orden, quisiera confirmar las modificaciones.', 'Before finalizing the order, I would like to confirm the changes.', 'Antes de cerrar la orden, quisiera confirmar las modificaciones de cada plato.', 'Before finalizing the order, I would like to confirm the changes to each dish.', 'Cerrar la orden means to finalize it; pedido is another common term.'),

  -- Preferences and needs.
  ('preferences', 1, 2, 'review', 'A2', '¿Puede traer la salsa aparte?', 'Can you bring the sauce on the side?', '¿Puede traer la salsa aparte para que yo decida cuánto poner?', 'Can you bring the sauce on the side so I can decide how much to use?', 'Aparte is the usual way to request something on the side.'),
  ('preferences', 1, 3, 'core', 'B2', 'No es una alergia, pero trato de evitar los lácteos.', 'It is not an allergy, but I try to avoid dairy.', 'No es una alergia, pero trato de evitar los lácteos siempre que puedo.', 'It is not an allergy, but I try to avoid dairy whenever I can.', 'This distinguishes a preference from a medical allergy.'),
  ('preferences', 1, 4, 'core', 'B2', 'Si es posible, preferiría que no añadieran sal al final.', 'If possible, I would prefer that they not add salt at the end.', 'Si es posible, preferiría que no añadieran sal al final de la preparación.', 'If possible, I would prefer that they not add salt at the end of the preparation.', 'Preferir que takes the subjunctive for a requested change.'),
  ('preferences', 2, 1, 'review', 'A2', 'Soy alérgico a los frutos secos.', 'I am allergic to nuts.', 'Soy alérgico a los frutos secos, así que necesito evitar cualquier plato que los lleve.', 'I am allergic to nuts, so I need to avoid any dish that contains them.', 'Use alérgico or alérgica according to the speaker.'),
  ('preferences', 2, 2, 'core', 'B2', '¿Hay riesgo de contaminación cruzada en la cocina?', 'Is there a risk of cross-contamination in the kitchen?', 'La alergia es grave. ¿Hay riesgo de contaminación cruzada en la cocina?', 'The allergy is serious. Is there a risk of cross-contamination in the kitchen?', 'Contaminación cruzada is the precise safety term.'),
  ('preferences', 2, 3, 'core', 'B2', 'Necesito confirmar si el caldo se prepara con carne.', 'I need to confirm whether the stock is made with meat.', 'Aunque el plato parece vegetariano, necesito confirmar si el caldo se prepara con carne.', 'Although the dish looks vegetarian, I need to confirm whether the stock is made with meat.', 'Caldo may contain meat even when the visible ingredients do not.'),
  ('preferences', 2, 4, 'core', 'B2', '¿Podrían sustituir la guarnición sin cambiar el resto del plato?', 'Could you substitute the side without changing the rest of the dish?', '¿Podrían sustituir las papas por verduras sin cambiar el resto del plato?', 'Could you substitute vegetables for the potatoes without changing the rest of the dish?', 'Sustituir X por Y means to replace X with Y.'),
  ('preferences', 3, 1, 'review', 'B1', 'No como carne, aunque sí como pescado.', 'I do not eat meat, although I do eat fish.', 'No como carne, aunque sí como pescado y mariscos.', 'I do not eat meat, although I do eat fish and seafood.', 'Aunque sí clarifies an exception to the restriction.'),
  ('preferences', 3, 2, 'core', 'B2', 'Me gustaría mantener los sabores del plato, salvo el ingrediente que no puedo comer.', 'I would like to preserve the flavors of the dish except for the ingredient I cannot eat.', 'Me gustaría mantener los sabores originales del plato, salvo el ingrediente que no puedo comer.', 'I would like to preserve the original flavors of the dish except for the ingredient I cannot eat.', 'Salvo marks a specific exception.'),
  ('preferences', 3, 3, 'core', 'B2', '¿Qué alternativa recomienda que conserve una textura parecida?', 'What alternative do you recommend that keeps a similar texture?', 'Si quitan el queso, ¿qué alternativa recomienda que conserve una textura parecida?', 'If they remove the cheese, what alternative do you recommend that keeps a similar texture?', 'An unspecified recommended alternative triggers the subjunctive.'),
  ('preferences', 3, 4, 'core', 'B2', 'No me importa que pique, siempre que el sabor esté equilibrado.', 'I do not mind it being spicy as long as the flavor is balanced.', 'No me importa que pique bastante, siempre que el sabor esté equilibrado.', 'I do not mind it being quite spicy as long as the flavor is balanced.', 'No importar que and siempre que both take the subjunctive here.'),
  ('preferences', 4, 1, 'review', 'B1', '¿Se puede preparar sin mantequilla?', 'Can it be prepared without butter?', '¿Se puede preparar sin mantequilla o ya viene mezclada con la salsa?', 'Can it be prepared without butter, or is it already mixed into the sauce?', 'Se puede keeps the request impersonal.'),
  ('preferences', 4, 2, 'core', 'B2', 'Agradecería que comprobaran los ingredientes con la cocina.', 'I would appreciate it if you checked the ingredients with the kitchen.', 'Como la alergia es seria, agradecería que comprobaran los ingredientes con la cocina.', 'Since the allergy is serious, I would appreciate it if you checked the ingredients with the kitchen.', 'This is clear and tactful for a safety-critical request.'),
  ('preferences', 4, 3, 'core', 'B2', '¿Podría servirse una porción sin la salsa que contiene gluten?', 'Could a portion be served without the sauce that contains gluten?', 'Compartiremos el plato. ¿Podría servirse una porción sin la salsa que contiene gluten?', 'We will share the dish. Could one portion be served without the sauce that contains gluten?', 'Una porción specifies that only part of the order needs changing.'),
  ('preferences', 4, 4, 'core', 'B2', 'Tengo una restricción médica, no solo una preferencia.', 'I have a medical restriction, not just a preference.', 'Necesito ser claro: tengo una restricción médica, no solo una preferencia.', 'I need to be clear: I have a medical restriction, not just a preference.', 'Use this when the seriousness of a restriction must be unmistakable.'),
  ('preferences', 5, 1, 'core', 'B2', 'Prefiero una opción vegetal que siga siendo sustanciosa.', 'I prefer a plant-based option that is still substantial.', 'Para el plato principal, prefiero una opción vegetal que siga siendo sustanciosa.', 'For the main course, I prefer a plant-based option that is still substantial.', 'Sustancioso describes food that is filling and substantial.'),
  ('preferences', 5, 2, 'core', 'B2', '¿Cómo adaptarían el plato sin que perdiera su carácter?', 'How would you adapt the dish without it losing its character?', 'Si eliminan los lácteos, ¿cómo adaptarían el plato sin que perdiera su carácter?', 'If they remove the dairy, how would you adapt the dish without it losing its character?', 'Sin que takes the subjunctive; perdiera reflects a hypothetical result.'),
  ('preferences', 5, 3, 'core', 'B2', 'Para evitar malentendidos, ¿podría repetir cómo quedará el pedido?', 'To avoid misunderstandings, could you repeat how the order will be prepared?', 'Para evitar malentendidos con la alergia, ¿podría repetir cómo quedará el pedido?', 'To avoid misunderstandings about the allergy, could you repeat how the order will be prepared?', 'A confirmation request is useful after several modifications.'),
  ('preferences', 5, 4, 'core', 'B2', 'Si la sustitución cambia el precio, avíseme antes de prepararlo.', 'If the substitution changes the price, let me know before preparing it.', 'Si la sustitución cambia el precio del plato, avíseme antes de prepararlo.', 'If the substitution changes the price of the dish, let me know before preparing it.', 'Avíseme is a formal affirmative command.'),

  -- Solving a problem.
  ('solving-problems', 1, 2, 'review', 'B1', 'Creo que esto no es lo que pedí.', 'I do not think this is what I ordered.', 'Disculpe, creo que esto no es lo que pedí; yo había pedido pescado.', 'Excuse me, I do not think this is what I ordered; I had ordered fish.', 'Creo que softens the correction without making it unclear.'),
  ('solving-problems', 1, 3, 'core', 'B2', 'No quisiera devolverlo, pero está demasiado frío.', 'I would rather not send it back, but it is too cold.', 'No quisiera devolverlo, pero está demasiado frío para comerlo así.', 'I would rather not send it back, but it is too cold to eat this way.', 'The conditional expresses reluctance before stating the problem.'),
  ('solving-problems', 1, 4, 'core', 'B2', 'Parece que hubo una confusión con nuestra orden.', 'It seems there was a mix-up with our order.', 'Parece que hubo una confusión con nuestra orden porque faltan dos platos.', 'It seems there was a mix-up with our order because two dishes are missing.', 'Hubo reports the completed occurrence of a problem.'),
  ('solving-problems', 2, 1, 'review', 'A2', 'Disculpe, nos falta una bebida.', 'Excuse me, we are missing a drink.', 'Disculpe, nos falta una bebida y ya llegó toda la comida.', 'Excuse me, we are missing a drink and all the food has arrived.', 'Nos falta focuses on the missing item.'),
  ('solving-problems', 2, 2, 'core', 'B2', 'Uno de los platos llegó, pero los demás todavía no.', 'One of the dishes arrived, but the others have not yet.', 'Uno de los platos llegó hace diez minutos, pero los demás todavía no.', 'One dish arrived ten minutes ago, but the others have not yet.', 'This clearly explains uneven timing at the table.'),
  ('solving-problems', 2, 3, 'core', 'B2', '¿Podrían confirmar si el resto del pedido está en camino?', 'Could you confirm whether the rest of the order is on its way?', '¿Podrían confirmar con la cocina si el resto del pedido está en camino?', 'Could you confirm with the kitchen whether the rest of the order is on its way?', 'Estar en camino means that something is on the way.'),
  ('solving-problems', 2, 4, 'core', 'B2', 'La carne está más hecha de lo que habíamos pedido.', 'The meat is more well-done than we had ordered.', 'La carne está bastante más hecha de lo que habíamos pedido. ¿Se puede cambiar?', 'The meat is much more well-done than we had ordered. Can it be changed?', 'Más de lo que compares the result with the original request.'),
  ('solving-problems', 3, 1, 'review', 'B1', '¿Podrían calentarlo un poco más?', 'Could you warm it a little more?', 'El centro está frío. ¿Podrían calentarlo un poco más?', 'The center is cold. Could you warm it a little more?', 'Podrían is a polite conditional request.'),
  ('solving-problems', 3, 2, 'core', 'B2', 'Entiendo que están ocupados, pero necesitamos una actualización.', 'I understand you are busy, but we need an update.', 'Entiendo que están ocupados, pero llevamos mucho tiempo esperando y necesitamos una actualización.', 'I understand you are busy, but we have been waiting a long time and need an update.', 'This acknowledges the situation while keeping the request clear.'),
  ('solving-problems', 3, 3, 'core', 'B2', 'La salsa tiene un sabor distinto al que nos describieron.', 'The sauce tastes different from how it was described to us.', 'La salsa tiene un sabor mucho más dulce del que nos describieron.', 'The sauce tastes much sweeter than it was described to us.', 'Distinto al que refers back to the expected flavor.'),
  ('solving-problems', 3, 4, 'core', 'B2', 'Nos gustaría encontrar una solución sin retrasar más la cena.', 'We would like to find a solution without delaying dinner any further.', 'Nos gustaría encontrar una solución que no retrasara más la cena.', 'We would like to find a solution that would not delay dinner any further.', 'The imperfect subjunctive presents the desired solution tactfully.'),
  ('solving-problems', 4, 1, 'review', 'B1', 'Pedimos este plato sin queso.', 'We ordered this dish without cheese.', 'Disculpe, pedimos este plato sin queso, pero parece que sí lleva.', 'Excuse me, we ordered this dish without cheese, but it seems it does contain some.', 'This directly restates the requested modification.'),
  ('solving-problems', 4, 2, 'core', 'B2', 'No es urgente, pero quisiéramos saber cuánto falta.', 'It is not urgent, but we would like to know how much longer it will be.', 'No es urgente, pero quisiéramos saber cuánto falta para que salga el plato.', 'It is not urgent, but we would like to know how much longer until the dish comes out.', 'Cuánto falta asks about remaining time.'),
  ('solving-problems', 4, 3, 'core', 'B2', 'Agradezco que lo revisen; prefiero esperar a recibirlo correctamente.', 'I appreciate you checking; I prefer to wait to receive it correctly.', 'Agradezco que lo revisen con la cocina; prefiero esperar a recibirlo correctamente.', 'I appreciate you checking with the kitchen; I prefer to wait to receive it correctly.', 'Agradecer que takes the subjunctive.'),
  ('solving-problems', 4, 4, 'core', 'B2', '¿Qué alternativa podrían ofrecernos que saliera más rápido?', 'What alternative could you offer us that would come out faster?', 'Si este plato tardará mucho, ¿qué alternativa podrían ofrecernos que saliera más rápido?', 'If this dish will take a long time, what alternative could you offer that would come out faster?', 'The imperfect subjunctive describes the desired hypothetical alternative.'),
  ('solving-problems', 5, 1, 'core', 'B2', 'El problema no es solo la demora, sino que nadie nos ha informado.', 'The problem is not only the delay, but that no one has updated us.', 'El problema no es solo la demora, sino que nadie nos ha informado de lo ocurrido.', 'The problem is not only the delay, but that no one has informed us what happened.', 'No solo... sino que links two related complaints.'),
  ('solving-problems', 5, 2, 'core', 'B2', 'Preferiríamos resolverlo aquí antes que presentar una queja formal.', 'We would prefer to resolve it here rather than make a formal complaint.', 'Preferiríamos resolverlo aquí con usted antes que presentar una queja formal.', 'We would prefer to resolve it here with you rather than make a formal complaint.', 'This signals seriousness while leaving room for resolution.'),
  ('solving-problems', 5, 3, 'core', 'B2', 'Comprendo el imprevisto; aun así, agradeceríamos una solución.', 'I understand the unforeseen problem; even so, we would appreciate a solution.', 'Comprendo el imprevisto en la cocina; aun así, agradeceríamos una solución concreta.', 'I understand the unforeseen problem in the kitchen; even so, we would appreciate a concrete solution.', 'Aun así acknowledges the explanation without dropping the request.'),
  ('solving-problems', 5, 4, 'core', 'B2', '¿Podrían ajustar la cuenta para reflejar el plato que no llegó?', 'Could you adjust the bill to reflect the dish that never arrived?', 'Como el plato nunca llegó, ¿podrían ajustar la cuenta para reflejarlo?', 'Since the dish never arrived, could you adjust the bill to reflect that?', 'Ajustar la cuenta is a direct request for a billing correction.'),

  -- Paying and leaving.
  ('paying', 1, 2, 'review', 'A2', '¿Nos trae la cuenta cuando pueda?', 'Could you bring us the bill when you can?', 'Ya terminamos. ¿Nos trae la cuenta cuando pueda?', 'We are finished. Could you bring us the bill when you can?', 'La cuenta is the restaurant bill throughout the Spanish-speaking world.'),
  ('paying', 1, 3, 'core', 'B2', 'Antes de pagar, ¿podría revisar este cargo con nosotros?', 'Before we pay, could you review this charge with us?', 'Antes de pagar, ¿podría revisar este cargo con nosotros? No sabemos a qué corresponde.', 'Before we pay, could you review this charge with us? We do not know what it is for.', 'Corresponder a explains what a charge relates to.'),
  ('paying', 1, 4, 'core', 'B2', '¿Podemos dividir la cuenta según lo que pidió cada uno?', 'Can we split the bill according to what each person ordered?', 'Somos cuatro. ¿Podemos dividir la cuenta según lo que pidió cada uno?', 'There are four of us. Can we split the bill according to what each person ordered?', 'Según lo que is useful when the shares are unequal.'),
  ('paying', 2, 1, 'review', 'B1', '¿El servicio está incluido en el total?', 'Is service included in the total?', 'Antes de dejar propina, ¿el servicio está incluido en el total?', 'Before leaving a tip, is service included in the total?', 'Customs vary by country; ask rather than assume.'),
  ('paying', 2, 2, 'core', 'B2', 'Veo un cargo que no reconozco; ¿podría explicármelo?', 'I see a charge I do not recognize; could you explain it to me?', 'Veo un cargo adicional que no reconozco; ¿podría explicármelo?', 'I see an additional charge I do not recognize; could you explain it to me?', 'The attached pronouns in explicármelo refer to explaining the charge to me.'),
  ('paying', 2, 3, 'core', 'B2', '¿Aceptan dividir el pago entre dos tarjetas?', 'Can you split the payment between two cards?', '¿Aceptan dividir el pago en partes iguales entre dos tarjetas?', 'Can you split the payment equally between two cards?', 'Entre dos tarjetas specifies the payment method rather than separate checks.'),
  ('paying', 2, 4, 'core', 'B2', '¿Podría emitir un comprobante con el detalle de los gastos?', 'Could you issue a receipt with an itemized list of the expenses?', 'Necesito justificar el gasto. ¿Podría emitir un comprobante con el detalle?', 'I need to document the expense. Could you issue an itemized receipt?', 'Comprobante is common in Latin America; recibo is also widely used.'),
  ('paying', 3, 1, 'review', 'A2', 'Pago con tarjeta, por favor.', 'I will pay by card, please.', 'Pago con tarjeta, por favor. ¿La acerco aquí?', 'I will pay by card, please. Do I tap it here?', 'Con tarjeta states the payment method.'),
  ('paying', 3, 2, 'core', 'B2', '¿La propina se añade en la terminal o se deja aparte?', 'Is the tip added on the card terminal or left separately?', '¿La propina se añade en la terminal o se deja aparte en efectivo?', 'Is the tip added on the card terminal or left separately in cash?', 'Terminal and datáfono are regional terms for the card machine.'),
  ('paying', 3, 3, 'core', 'B2', 'Nos gustaría pagar una parte en efectivo y otra con tarjeta.', 'We would like to pay part in cash and part by card.', 'Nos gustaría pagar la mitad en efectivo y el resto con tarjeta.', 'We would like to pay half in cash and the rest by card.', 'Una parte... y otra expresses a split payment.'),
  ('paying', 3, 4, 'core', 'B2', '¿Podrían desglosar los impuestos y el servicio?', 'Could you itemize the taxes and service charge?', 'Para entender el total, ¿podrían desglosar los impuestos y el servicio?', 'To understand the total, could you itemize the taxes and service charge?', 'Desglosar means to break a total into its components.'),
  ('paying', 4, 1, 'review', 'B1', '¿Podemos pagar por separado?', 'Can we pay separately?', 'Cada uno pagará lo suyo. ¿Podemos pagar por separado?', 'Each person will pay their own share. Can we pay separately?', 'Pagar por separado is widely understood.'),
  ('paying', 4, 2, 'core', 'B2', 'Para evitar confusiones, cada uno pagará exactamente lo que pidió.', 'To avoid confusion, each person will pay exactly for what they ordered.', 'Para evitar confusiones con la cuenta, cada uno pagará exactamente lo que pidió.', 'To avoid confusion with the bill, each person will pay exactly for what they ordered.', 'Lo que pidió refers to each person’s own items.'),
  ('paying', 4, 3, 'core', 'B2', '¿Es posible cargar una cantidad concreta a cada tarjeta?', 'Is it possible to charge a specific amount to each card?', '¿Es posible cargar cincuenta a esta tarjeta y el resto a la otra?', 'Is it possible to charge fifty to this card and the rest to the other?', 'Una cantidad concreta makes the requested split precise.'),
  ('paying', 4, 4, 'core', 'B2', 'Creo que se cobró dos veces el mismo concepto.', 'I think the same item was charged twice.', 'Al revisar la cuenta, creo que se cobró dos veces el mismo concepto.', 'Looking over the bill, I think the same item was charged twice.', 'Concepto refers to a line item or charge on a bill.'),
  ('paying', 5, 1, 'core', 'B2', '¿Podría aclararnos cómo calcularon el cargo por servicio?', 'Could you clarify how the service charge was calculated?', 'El porcentaje no nos queda claro. ¿Podría aclararnos cómo calcularon el cargo por servicio?', 'The percentage is not clear to us. Could you clarify how the service charge was calculated?', 'No quedar claro describes something that remains unclear.'),
  ('paying', 5, 2, 'core', 'B2', 'Necesito una factura a nombre de la empresa.', 'I need an invoice made out to the company.', 'Necesito una factura a nombre de la empresa con los datos fiscales.', 'I need an invoice made out to the company with the tax details.', 'Factura is an invoice; requirements vary by country.'),
  ('paying', 5, 3, 'core', 'B2', 'El total no coincide con la suma de los conceptos.', 'The total does not match the sum of the line items.', 'Al sumar los conceptos, el total no coincide. ¿Podría revisarlo?', 'When I add the line items, the total does not match. Could you review it?', 'Coincidir con expresses that two figures match.'),
  ('paying', 5, 4, 'core', 'B2', 'Todo estuvo muy bien; transmítale nuestras felicitaciones a la cocina.', 'Everything was excellent; please pass our compliments to the kitchen.', 'Todo estuvo muy bien; transmítale nuestras felicitaciones al equipo de cocina.', 'Everything was excellent; please pass our compliments to the kitchen team.', 'Transmítale is a formal command with an attached indirect-object pronoun.')
), numbered as (
  select seed.*,
    row_number() over (partition by section_slug order by set_number, position) as sequence
  from seed
)
insert into public.vocabulary_items
  (id, section_id, spanish, english, example_es, example_en, usage_note,
   sort_order, cefr_level, source, learning_set_id, curriculum_position,
   curriculum_role, introduced_level, content_version)
select
  (substr(md5('dining-out-b2-v1:' || n.section_slug || ':' || n.sequence), 1, 8) || '-' ||
   substr(md5('dining-out-b2-v1:' || n.section_slug || ':' || n.sequence), 9, 4) || '-4' ||
   substr(md5('dining-out-b2-v1:' || n.section_slug || ':' || n.sequence), 14, 3) || '-8' ||
   substr(md5('dining-out-b2-v1:' || n.section_slug || ':' || n.sequence), 18, 3) || '-' ||
   substr(md5('dining-out-b2-v1:' || n.section_slug || ':' || n.sequence), 21, 12))::uuid,
  s.id, n.spanish, n.english, n.example_es, n.example_en, n.note,
  100 + n.set_number * 10 + n.position, 'B2', 'curated',
  'dining-out-b2-v1-s' || n.set_number, n.position, n.role,
  n.introduced_level, 1
from numbered n
join public.vocabulary_sections s
  on s.theme_id = 'dining-out' and s.slug = n.section_slug
on conflict(id) do update set
  spanish = excluded.spanish,
  english = excluded.english,
  example_es = excluded.example_es,
  example_en = excluded.example_en,
  usage_note = excluded.usage_note,
  learning_set_id = excluded.learning_set_id,
  curriculum_position = excluded.curriculum_position,
  curriculum_role = excluded.curriculum_role,
  introduced_level = excluded.introduced_level,
  content_version = excluded.content_version;

do $$
declare
  v_total integer;
  v_review integer;
  v_bad_sets integer;
begin
  select count(*) into v_total
  from public.vocabulary_items i
  join public.vocabulary_sections s on s.id = i.section_id
  where s.theme_id = 'dining-out' and i.cefr_level = 'B2' and i.learning_set_id is not null;
  select count(*) into v_review
  from public.vocabulary_items i
  join public.vocabulary_sections s on s.id = i.section_id
  where s.theme_id = 'dining-out' and i.cefr_level = 'B2' and i.curriculum_role = 'review';
  select count(*) into v_bad_sets from (
    select learning_set_id
    from public.vocabulary_items
    where learning_set_id like 'dining-out-b2-v1-s%'
    group by learning_set_id
    having count(*) <> 24
  ) invalid;
  if v_total <> 120 or v_review <> 24 or v_bad_sets <> 0 then
    raise exception 'Dining Out B2 seed failed: total %, review %, invalid sets %', v_total, v_review, v_bad_sets;
  end if;
end;
$$;
