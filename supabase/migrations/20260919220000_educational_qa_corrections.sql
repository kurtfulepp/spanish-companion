-- Reviewed against PCIC functions/grammar and RAE usage on 2026-09-19.
-- These are scoped C1 register/stance samples, not a validated CEFR placement
-- instrument. Preserve row IDs and history; assessment content fingerprints
-- prevent old answers from establishing knowledge of changed expressions.
with corrections(section_id, old_spanish, spanish, english, example_es, example_en, usage_note) as (
  values
  ('d1000000-0000-4000-8000-000000000001'::uuid, '¿Nos pueden traer otra silla?',
   'Entendemos que están completos; aun así, agradeceríamos que nos avisaran si quedara una mesa libre.',
   'We understand you are fully booked; even so, we would appreciate being told if a table became available.',
   'No queremos comprometer las reservas. Entendemos que están completos; aun así, agradeceríamos que nos avisaran si quedara una mesa libre.',
   'We do not want to interfere with reservations. We understand you are fully booked; even so, we would appreciate being told if a table became available.',
   'C1 refinement: acknowledge a constraint before making a tactful request. Aun así maintains the request despite that constraint. Avisasen and quedase are also accepted.'),
  ('d1000000-0000-4000-8000-000000000002'::uuid, '¿Está muy picante?',
   'Más que el picante en sí, me preocupa que enmascare los demás sabores.',
   'More than the heat itself, I am concerned that it might mask the other flavors.',
   'Me gustan los platos intensos. Más que el picante en sí, me preocupa que enmascare los demás sabores.',
   'I like dishes with strong flavors. More than the heat itself, I am concerned that it might mask the other flavors.',
   'C1 refinement: use más que to redirect the concern. Me preocupa que frames the possible effect as an evaluation and takes enmascare here.'),
  ('d1000000-0000-4000-8000-000000000003'::uuid, 'Eso es todo por ahora.',
   'Nos dejamos aconsejar, con la salvedad de que preferimos evitar los platos demasiado pesados.',
   'We are happy to take your advice, with the proviso that we prefer to avoid dishes that are too heavy.',
   'Queremos probar la cocina local. Nos dejamos aconsejar, con la salvedad de que preferimos evitar los platos demasiado pesados.',
   'We want to try the local cuisine. We are happy to take your advice, with the proviso that we prefer to avoid dishes that are too heavy.',
   'C1 refinement: con la salvedad de que adds an explicit reservation in a relatively formal register. Here preferimos states a real preference; the expression does not automatically require subjunctive.'),
  ('d1000000-0000-4000-8000-000000000004'::uuid, '¿Me lo puede poner aparte?',
   'No se trata de una preferencia, sino de una restricción que convendría confirmar con la cocina.',
   'This is not a preference, but a restriction that should be confirmed with the kitchen.',
   'No se trata de una preferencia, sino de una restricción que convendría confirmar con la cocina. ¿Podría comprobar los ingredientes?',
   'This is not a preference, but a restriction that should be confirmed with the kitchen. Could you check the ingredients?',
   'C1 refinement: no se trata de… sino de… corrects the framing. Convendría softens the recommendation; in a real allergy situation, state the allergen and the need clearly.'),
  ('d1000000-0000-4000-8000-000000000005'::uuid, '¿Podemos hablar con el encargado?',
   'Sin poner en duda su explicación, nos gustaría saber cómo piensan resolver el problema.',
   'Without questioning your explanation, we would like to know how you intend to resolve the problem.',
   'Entendemos que haya habido un imprevisto. Sin poner en duda su explicación, nos gustaría saber cómo piensan resolver el problema.',
   'We understand that there has been an unforeseen problem. Without questioning your explanation, we would like to know how you intend to resolve the problem.',
   'C1 refinement: qualify a complaint while preserving its practical aim. Cómo keeps its accent in the indirect question. This formal wording can sound firm, depending on tone.'),
  ('d1000000-0000-4000-8000-000000000006'::uuid, 'Todo estuvo muy rico.',
   'La comida nos ha gustado; eso no quita que haya aspectos del servicio que convendría mejorar.',
   'We enjoyed the food; that does not mean there are no aspects of the service that could be improved.',
   'La comida nos ha gustado; eso no quita que haya aspectos del servicio que convendría mejorar. Nos referimos, sobre todo, a la espera.',
   'We enjoyed the food; that does not mean there are no aspects of the service that could be improved. We are referring above all to the wait.',
   'C1 refinement: eso no quita que acknowledges one point without conceding another; use haya here. Nos gustó is a valid regional or temporal alternative to nos ha gustado.')
)
update public.vocabulary_items as item
set spanish = c.spanish, english = c.english, example_es = c.example_es,
    example_en = c.example_en, usage_note = c.usage_note
from corrections c
where item.section_id = c.section_id and item.spanish = c.old_spanish
  and item.cefr_level = 'C1' and item.source = 'curated' and item.owner_id is null;

update public.lesson_activities
set instruction = 'Use the simple future to state the planned action.',
    prompt = 'Complete with the simple future: Cuando termine de trabajar, ___ a tomar algo con unos amigos.',
    explanation = 'The task asks for the simple future: saldré. Salgo can also refer to a planned future action in ordinary Spanish; it is not ungrammatical. Termine presents the future event after cuando.'
where id = 'b2000000-0000-4000-8000-000000000013'
  and correct_answer = 'saldré';

-- Make the intended meaning explicit: a grammatical alternative with a
-- different message must not be presented as inherently incorrect.
update public.lesson_activities
set prompt = 'Keep both ideas: planning can help, but leave room for improvisation. La planificación puede ser útil;…'
where prompt = 'La planificación puede ser útil;…' and correct_answer = 'con todo, conviene dejar margen para la improvisación.';
update public.lesson_activities
set prompt = 'Reformulate without changing the meaning: Aunque el matiz parezca insignificante, influye en cómo se interpreta el mensaje.'
where prompt = 'Choose the precise reformulation.' and correct_answer = 'Por nimio que parezca, el matiz condiciona la interpretación.';

-- Retire the unvalidated score-to-CEFR RPC as well as its UI caller. Preserve
-- old rows for history; no current client may create new placement claims.
revoke execute on function public.complete_level_assessment(integer[], text)
  from public, anon, authenticated;

update public.vocabulary_items
set example_es = 'Si este plato tarda mucho, ¿qué alternativa podrían ofrecernos que saliera más rápido?',
    usage_note = 'An open future condition uses present indicative after si: si tarda. Saliera describes the desired hypothetical alternative; saliese is also valid.'
where source = 'curated' and cefr_level = 'B2' and owner_id is null
  and spanish = '¿Qué alternativa podrían ofrecernos que saliera más rápido?'
  and example_es = 'Si este plato tardará mucho, ¿qué alternativa podrían ofrecernos que saliera más rápido?';

update public.vocabulary_items
set usage_note = 'Quisiera is an imperfect subjunctive form used here to express a tactful wish or reluctance. It is not a conditional form; querría is the conditional.'
where source = 'curated' and cefr_level = 'B2' and owner_id is null
  and spanish = 'No quisiera devolverlo, pero está demasiado frío.';
