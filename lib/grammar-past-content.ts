import type { RuleExercise, RuleLesson } from './grammar-rules';

const form = (
  id: string,
  prompt: string,
  answer: string,
  explanation: string,
  instruction = 'Write only the missing verb form.',
): RuleExercise => ({
  id,
  kind: 'formation',
  instruction,
  prompt,
  answers: [answer],
  explanation,
});
const choose = (
  id: string,
  prompt: string,
  options: string[],
  explanation: string,
  kind: 'recognition' | 'choice' = 'choice',
): RuleExercise => ({
  id,
  kind,
  instruction: 'Choose the answer that matches the stated meaning.',
  prompt,
  options,
  answers: [options[0]],
  explanation,
});
// Options are deliberately reordered below; the answer key never depends on display order.
function vary(exercises: RuleExercise[]) {
  return exercises.map((exercise, index) => ({
    ...exercise,
    options:
      exercise.options &&
      (index % 2
        ? [...exercise.options].reverse()
        : [...exercise.options.slice(1), exercise.options[0]]),
  }));
}
const source = (level: string, section: string) => ({
  title: 'Instituto Cervantes · Plan curricular',
  url: `https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_${level}.htm`,
  section,
});
const lesson = (
  data: Omit<RuleLesson, 'version' | 'reviewStatus'>,
): RuleLesson => ({
  ...data,
  version: 1,
  reviewStatus: 'draft',
  exercises: vary(data.exercises),
});

export const PAST_RULES: RuleLesson[] = [
  lesson({
    id: 'A1-08.present-person',
    moduleId: 'A1-08',
    level: 'A1',
    title: 'Match a present-tense verb to its person',
    objective:
      'Say who does an everyday activity using regular present-tense verbs.',
    prerequisites: ['A1-01', 'A1-07'],
    prerequisiteNote:
      'Identify the subject: yo, tú, él/ella/usted, nosotros, vosotros, or ellos/ustedes.',
    explanation:
      'Use this when describing a routine. Remove -ar, -er, or -ir and add the ending for the person. The verb agrees with the subject even when the subject pronoun is omitted. Usted takes the same verb form as él/ella; ustedes takes the same form as ellos/ellas.',
    pattern:
      'hablar: hablo, hablas, habla, hablamos, habláis, hablan · comer: como, comes, come, comemos, coméis, comen · vivir: vivo, vives, vive, vivimos, vivís, viven',
    examples: [
      { spanish: 'Trabajo en casa.', english: 'I work at home.' },
      { spanish: 'Ustedes viven aquí.', english: 'You all live here.' },
    ],
    contrast:
      'Trabajo refers to yo; trabaja can refer to él, ella, or usted. An omitted subject can be understood from the conversation, but some endings need that context.',
    variation:
      'Vosotros is common in much of Spain; ustedes is used throughout Spanish-speaking America and elsewhere. Voseo is also standard in many regions: for example, vos hablás, comés, vivís. Tasks here name a subject explicitly and do not test all regional paradigms.',
    source: source('a1-a2', '9.1.1 Present indicative; 7.1 subject pronouns'),
    exercises: [
      choose(
        'person',
        'In “Yo vivo aquí”, who lives here?',
        ['The speaker', 'A group of people', 'The person being addressed'],
        'Yo identifies the speaker; vivo is first person singular.',
        'recognition',
      ),
      form(
        'ar',
        'Yo ___ en casa. (trabajar, present)',
        'trabajo',
        'Yo takes -o: trabajo.',
      ),
      form(
        'ir',
        'Ustedes ___ aquí. (vivir, present)',
        'viven',
        'Ustedes takes third person plural: viven.',
      ),
      choose(
        'context',
        'Say that you and Ana eat at home.',
        [
          'Ana y yo comemos en casa.',
          'Ana y yo comen en casa.',
          'Ana y yo como en casa.',
        ],
        'Ana y yo is nosotros, so use comemos.',
      ),
    ],
    production: {
      prompt:
        'Write three short sentences about your routine and another person’s routine. Use regular present verbs and make the subjects clear.',
      checklist: [
        'I matched each verb to its subject.',
        'I used present forms for routines.',
      ],
      example: 'Trabajo en casa. Ana vive cerca. Comemos juntos.',
    },
  }),
  lesson({
    id: 'A2-05.regular-preterite',
    moduleId: 'A2-05',
    level: 'A2',
    title: 'Form completed past actions',
    objective: 'Describe a completed event with regular preterite forms.',
    prerequisites: ['A1-08'],
    prerequisiteNote:
      'Match a verb to its person and identify regular -ar, -er, and -ir verbs.',
    explanation:
      'Use the preterite (pretérito indefinido or perfecto simple) to present an event as a complete whole in the past. With regular verbs, remove the infinitive ending and add the preterite ending. Written accents distinguish forms such as hablo (I speak) and habló (he, she, or usted spoke).',
    pattern:
      'hablar: hablé, hablaste, habló, hablamos, hablasteis, hablaron · comer/vivir: -í, -iste, -ió, -imos, -isteis, -ieron',
    examples: [
      { spanish: 'Ayer compré pan.', english: 'Yesterday I bought bread.' },
      {
        spanish: 'El domingo comimos juntos.',
        english: 'On Sunday we ate together.',
      },
    ],
    contrast:
      'Hablé presents a past event as a whole; hablaba presents a past situation from within. This lesson focuses on forming the requested preterite. A time expression alone does not determine tense.',
    variation:
      'Hablamos and vivimos can be present or preterite; context distinguishes them. Regional choices between the simple past and present perfect vary. When a task explicitly asks for the preterite, supply that form.',
    source: source('a1-a2', '9.1.3 Pretérito indefinido'),
    exercises: [
      choose(
        'recognize',
        'Which form means “I bought” in the preterite?',
        ['compré', 'compro', 'compró'],
        'Compré is first person singular preterite; compró is third person.',
        'recognition',
      ),
      form(
        'ar',
        'Ayer yo ___ a Ana. (visitar, preterite)',
        'visité',
        'Regular -ar verbs take -é with yo.',
      ),
      form(
        'er',
        'Ellas ___ temprano. (comer, preterite)',
        'comieron',
        'Ellas takes -ieron with regular -er verbs.',
      ),
      choose(
        'choice',
        'Report the completed purchase by Marta using the preterite.',
        ['Marta compró pan.', 'Marta compro pan.', 'Marta compré pan.'],
        'Compró matches Marta; the accent matters.',
      ),
    ],
    production: {
      prompt:
        'Write three completed events from a past day. Use regular verbs in the preterite and include at least two different subjects.',
      checklist: [
        'I used the requested preterite endings.',
        'I checked written accents and subjects.',
      ],
      example: 'Ayer visité a Ana. Ella preparó café. Comimos juntos.',
    },
  }),
  lesson({
    id: 'A2-05.irregular-preterite',
    moduleId: 'A2-05',
    level: 'A2',
    title: 'Use common irregular past forms',
    objective: 'Report completed events with ir, ser, tener, estar, and hacer.',
    prerequisites: ['A2-05'],
    prerequisiteNote:
      'Know the purpose of the preterite and regular person endings. This lesson adds five frequent irregular verbs.',
    explanation:
      'Use these forms to say where you went, what happened, or how an event was. Ir and ser share fui, fuiste, fue, fuimos, fuisteis, fueron; meaning comes from the sentence. Tener uses tuv-, estar uses estuv-, and hacer uses hic- (but hizo in third person singular). These irregular forms do not carry written accents.',
    pattern:
      'tener: tuve, tuviste, tuvo, tuvimos, tuvisteis, tuvieron · estar: estuve, estuviste, estuvo, estuvimos, estuvisteis, estuvieron · hacer: hice, hiciste, hizo, hicimos, hicisteis, hicieron',
    examples: [
      { spanish: 'Fuimos al mercado.', english: 'We went to the market.' },
      { spanish: 'La visita fue breve.', english: 'The visit was brief.' },
      { spanish: 'Ana hizo la cena.', english: 'Ana made dinner.' },
    ],
    contrast:
      'Fui al mercado uses ir for movement; fui el guía uses ser for a role. The shared verb form does not by itself tell you which verb is meant.',
    variation:
      'This is a selected group, not the complete irregular preterite inventory. Other stems, third-person stem changes, and spelling changes need their own lessons.',
    source: source(
      'a1-a2',
      '9.1.3 Pretérito indefinido: frequent irregular verbs',
    ),
    exercises: [
      choose(
        'recognize',
        'In “Fuimos al cine”, which infinitive does fuimos come from?',
        ['ir', 'ser', 'hacer'],
        'Al cine gives a destination, so this is ir.',
        'recognition',
      ),
      form(
        'tener',
        'Yo ___ una reunión ayer. (tener, preterite)',
        'tuve',
        'Tener uses tuv- and the first-person ending -e, without an accent.',
      ),
      form(
        'hacer',
        'Ana ___ la cena. (hacer, preterite)',
        'hizo',
        'Hacer uses hizo in third person singular.',
      ),
      choose(
        'choice',
        'Describe the completed visit as short, using ser in the preterite.',
        [
          'La visita fue breve.',
          'La visita fui breve.',
          'La visita fueron breve.',
        ],
        'La visita is singular; fue is the matching form of ser.',
      ),
    ],
    production: {
      prompt:
        'Describe a past outing in three sentences. Include where you went and something you did, using at least two of these irregular verbs.',
      checklist: [
        'I chose the correct irregular stem and person.',
        'The context makes ir or ser clear.',
      ],
      example:
        'Fui al mercado. Tuve tiempo para comprar fruta. Después hice la cena.',
    },
  }),
  lesson({
    id: 'B1-01.past-viewpoint',
    moduleId: 'B1-01',
    level: 'B1',
    title: 'Choose background or a completed event',
    objective:
      'Choose imperfect or preterite to express a stated narrative viewpoint.',
    prerequisites: ['A2-05', 'A2-06'],
    prerequisiteNote:
      'Form the preterite and imperfect before comparing their uses.',
    explanation:
      'Use the imperfect to show a past situation from within, without presenting its boundaries: the setting, a routine, or an action in progress. Use the preterite to present an event as a whole and often advance the story. The same verb can take either tense when your viewpoint changes. Duration and repetition do not automatically require the imperfect.',
    pattern: 'Leía cuando sonó el teléfono. · Leí el libro en dos días.',
    examples: [
      {
        spanish: 'Llovía cuando salimos.',
        english: 'It was raining when we left.',
      },
      {
        spanish: 'Llovió durante dos horas.',
        english: 'It rained for two hours (presented as a whole).',
      },
    ],
    contrast:
      'Leía el libro views reading in progress; leí el libro presents the reading as a complete event. A long event or a bounded series of repeated events can use the preterite. An interruption is a useful context, not the definition of the imperfect.',
    variation:
      'Both tenses may be grammatical in a sentence with little context. Tasks specify the intended viewpoint; feedback describes a meaning mismatch rather than declaring every alternative ungrammatical.',
    source: source(
      'b1-b2',
      '9.1.2–9.1.3 Imperfect and preterite: aspect and narrative uses',
    ),
    exercises: [
      choose(
        'recognize',
        '“Cocinaba cuando llegó Ana.” Which action is presented as already in progress?',
        ['Cooking', 'Ana’s arrival', 'Both events as completed wholes'],
        'Cocinaba gives the ongoing background; llegó presents the arrival.',
        'recognition',
      ),
      form(
        'background',
        'Show the rain as ongoing at our departure: ___ cuando salimos. (llover)',
        'llovía',
        'Llovía presents rain from within, as the setting.',
      ),
      form(
        'event',
        'Present the phone ringing as the next completed event: Entonces ___ el teléfono. (sonar, preterite)',
        'sonó',
        'Sonó presents the event as a whole.',
      ),
      choose(
        'choice',
        'Present three visits last month as a completed, counted series.',
        [
          'El mes pasado visité a Ana tres veces.',
          'El mes pasado visitaba a Ana tres veces.',
        ],
        'Visité presents the bounded series as a whole; repetition does not force the imperfect.',
      ),
    ],
    production: {
      prompt:
        'Tell a short past scene in four sentences: describe the setting, then give two events that move the story forward. Make the viewpoint clear.',
      checklist: [
        'I used the imperfect for a setting or ongoing situation.',
        'I used the preterite to present events as wholes.',
        'I chose tense for meaning, not just a time word.',
      ],
      example:
        'Era tarde y llovía. Esperaba el autobús. Ana llegó en coche. Volvimos juntos a casa.',
    },
  }),
  lesson({
    id: 'B2-01.past-narration',
    moduleId: 'B2-01',
    level: 'B2',
    title: 'Build a clear past timeline',
    objective:
      'Integrate background, completed events, and earlier events in a connected narrative.',
    prerequisites: ['B1-01', 'B1-02'],
    prerequisiteNote:
      'Distinguish preterite and imperfect and form haber in the imperfect plus a participle.',
    explanation:
      'Use this when explaining an incident or telling a story whose events are not mentioned in chronological order. The imperfect supplies background; the preterite presents completed events; the pluperfect places something before a past reference point. Keep that reference point clear when moving between times.',
    pattern:
      'Cuando llegué, la estación estaba vacía: el tren ya había salido.',
    examples: [
      {
        spanish: 'Buscaba mis llaves. Recordé que las había dejado en casa.',
        english:
          'I was looking for my keys. I remembered that I had left them at home.',
      },
      {
        spanish:
          'Había reservado una mesa, pero el restaurante estaba cerrado cuando llegamos.',
        english:
          'I had reserved a table, but the restaurant was closed when we arrived.',
      },
    ],
    contrast:
      'Cuando llegué, Ana salió places her departure at or following my arrival. Cuando llegué, Ana ya había salido makes her departure earlier. Listing sentences is not enough: the tense choices must preserve the intended order.',
    variation:
      'This is B2 integration and refinement of earlier forms, not their first introduction. It covers the narrative part of B2-01; future perfect, conditional perfect, conjecture, and other indicative uses remain separate lessons. Regional present-perfect choices are not assessed here.',
    source: source(
      'b1-b2',
      '9.1.2, 9.1.3, 9.1.8: narrative aspect and anteriority',
    ),
    exercises: [
      choose(
        'recognize',
        '“Cuando entré, Ana ya había apagado la luz.” What happened first?',
        [
          'Ana turned off the light',
          'I entered',
          'Both necessarily happened together',
        ],
        'Había apagado locates the action before entré.',
        'recognition',
      ),
      form(
        'earlier',
        'The train left before our arrival: Cuando llegamos, el tren ya ___. (salir, pluperfect)',
        'había salido',
        'The train is singular: había + salido.',
      ),
      form(
        'setting',
        'Show the station’s state at our arrival: La estación ___ vacía. (estar, imperfect)',
        'estaba',
        'Estaba gives the background state at that moment.',
      ),
      choose(
        'choice',
        'Marta finished cooking before Luis arrived. Preserve that order explicitly.',
        [
          'Cuando Luis llegó, Marta ya había terminado de cocinar.',
          'Cuando Luis llegó, Marta empezó a cocinar.',
        ],
        'The pluperfect places the completion before the arrival; empezó would start a different sequence.',
      ),
    ],
    production: {
      prompt:
        'Write a six-sentence account of a missed appointment or a changed plan. Include a setting, two events, and something that had happened earlier. Make the order clear without relying only on sentence order.',
      checklist: [
        'The past reference point is clear.',
        'Background and completed events have distinct roles.',
        'The pluperfect marks an event before that reference point.',
        'The reader can reconstruct the sequence.',
      ],
      example:
        'Llovía y esperaba un taxi. Había reservado una mesa para las ocho. El taxi llegó tarde. Cuando entré en el restaurante, Ana ya había pedido la cena. Estaba cansada, pero sonrió. Cenamos juntos.',
    },
  }),
];

export const PAST_PATH_IDS = [
  'A1-08.present-person',
  'A2-05.regular-preterite',
  'A2-05.irregular-preterite',
  'A2-06.imperfect',
  'B1-01.past-viewpoint',
  'B1-02.earlier-past',
  'B2-01.past-narration',
];
export type PathPractice = {
  check: RuleExercise[];
  notice: { first: string; second: string; explanation: string };
  revisit: RuleExercise[];
  writingPrompt: string;
};
const pack = (
  check: RuleExercise[],
  first: string,
  second: string,
  explanation: string,
  revisit: RuleExercise[],
  writingPrompt: string,
): PathPractice => ({
  check: vary(check),
  notice: { first, second, explanation },
  revisit: vary(revisit),
  writingPrompt,
});
export const PAST_PRACTICE: Record<string, PathPractice> = {
  'A1-08.present-person': pack(
    [
      form(
        'check-form',
        'Nosotros ___ aquí. (vivir, present)',
        'vivimos',
        'Nosotros takes -imos with vivir.',
      ),
      choose(
        'check-choice',
        'Say that Ana works here.',
        ['Ana trabaja aquí.', 'Ana trabajo aquí.'],
        'Ana takes third person singular: trabaja.',
      ),
    ],
    'Como en casa.',
    'Comemos en casa.',
    'Como refers to I; comemos refers to we. The ending changes who does the action.',
    [
      choose(
        'revisit-recognize',
        '“Bebemos agua.” Who is included in the verb ending?',
        ['The speaker and others', 'Only the speaker', 'Only Ana'],
        'Bebemos is first person plural.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Tú ___ español. (hablar, present)',
        'hablas',
        'Tú takes -as with hablar.',
      ),
      choose(
        'revisit-choice',
        'Address several people with ustedes and say they eat here.',
        ['Ustedes comen aquí.', 'Ustedes comemos aquí.'],
        'Ustedes takes comen, not comemos.',
      ),
    ],
    'Write three new routine sentences about yourself and other people. Use different activities from your first attempt.',
  ),
  'A2-05.regular-preterite': pack(
    [
      form(
        'check-form',
        'Yo ___ la puerta. (abrir, preterite)',
        'abrí',
        'Regular -ir verbs take -í with yo.',
      ),
      choose(
        'check-choice',
        'Say that Ana finished yesterday, using the preterite.',
        ['Ana terminó ayer.', 'Ana terminé ayer.'],
        'Terminó matches Ana; terminé matches yo.',
      ),
    ],
    'Hablo con Ana.',
    'Habló con Ana.',
    'The accent changes both tense and person: I speak versus he/she/usted spoke.',
    [
      choose(
        'revisit-recognize',
        'Which is third person singular preterite?',
        ['bebió', 'bebí', 'bebo'],
        'Bebió means he/she/usted drank.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Nosotros ___ fruta. (comprar, preterite)',
        'compramos',
        'Compramos is the nosotros preterite; it also has a present reading in other contexts.',
      ),
      choose(
        'revisit-choice',
        'Say that you and Ana finished the work, using the preterite.',
        ['Ana y yo terminamos el trabajo.', 'Ana y yo terminaron el trabajo.'],
        'Ana y yo takes first person plural.',
      ),
    ],
    'Describe three different completed events from a past weekend using regular preterite verbs.',
  ),
  'A2-05.irregular-preterite': pack(
    [
      form(
        'check-form',
        'Yo ___ al parque. (ir, preterite)',
        'fui',
        'Fui is the yo form of ir or ser; the destination identifies ir.',
      ),
      choose(
        'check-choice',
        'Say that Ana made bread yesterday.',
        ['Ana hizo pan ayer.', 'Ana hico pan ayer.'],
        'The third person singular of hacer is hizo.',
      ),
    ],
    'Fue al museo.',
    'Fue una visita breve.',
    'The first fue is ir with a destination; the second is ser describing the visit.',
    [
      choose(
        'revisit-recognize',
        '“La reunión fue corta.” What is the infinitive of fue?',
        ['ser', 'ir', 'tener'],
        'Fue describes the meeting rather than movement.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Nosotros ___ en Madrid. (estar, preterite)',
        'estuvimos',
        'Estar uses estuv-: estuvimos.',
      ),
      choose(
        'revisit-choice',
        'Say that Ana had a problem, using the preterite.',
        ['Ana tuvo un problema.', 'Ana tuve un problema.'],
        'Tuvo is third person; tuve is first person.',
      ),
    ],
    'Describe a different past trip or errand in three sentences, using ir and at least one other irregular preterite.',
  ),
  'A2-06.imperfect': pack(
    [
      form(
        'check-form',
        'Yo ___ cerca del colegio. (vivir, imperfect)',
        'vivía',
        'Vivir takes -ía in first person singular imperfect.',
      ),
      choose(
        'check-choice',
        'Describe walking to school as your former routine, without presenting its limits.',
        ['Iba al colegio a pie.', 'Fui al colegio a pie una vez.'],
        'Iba presents the past routine; fui una vez presents a single completed visit.',
      ),
    ],
    'Ahora vivo cerca.',
    'Antes vivía cerca.',
    'Vivía places the situation in the past without presenting its beginning or end.',
    [
      choose(
        'revisit-recognize',
        '“De niña, leía por las tardes.” How is reading presented?',
        ['As a former routine', 'As a future plan', 'As one completed reading'],
        'Leía presents a habitual past activity.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Nosotros ___ en el parque. (jugar, imperfect)',
        'jugábamos',
        'Regular imperfect -ar endings do not use the present stem change: jugábamos.',
      ),
      choose(
        'revisit-choice',
        'Describe Ana’s former daily routine without bounding it.',
        ['Ana desayunaba temprano.', 'Ana desayunó temprano aquel día.'],
        'Desayunaba presents the routine from within.',
      ),
    ],
    'Describe a different period of your life in three sentences using past routines and an imperfect description.',
  ),
  'B1-01.past-viewpoint': pack(
    [
      form(
        'check-form',
        'Describe ongoing reading when Ana arrived: Yo ___ cuando llegó Ana. (leer, imperfect)',
        'leía',
        'Leía presents reading in progress.',
      ),
      choose(
        'check-choice',
        'Present five calls yesterday as a complete series.',
        ['Ayer llamé cinco veces.', 'Ayer llamaba cinco veces.'],
        'A bounded, counted series can take the preterite.',
      ),
    ],
    'Leía el informe.',
    'Leí el informe.',
    'The first looks at reading in progress; the second presents the reading as a whole. Neither tense is chosen just because an activity lasts a long time.',
    [
      choose(
        'revisit-recognize',
        '“Dormía cuando sonó la alarma.” Which is the background?',
        ['Sleeping', 'The alarm ringing', 'A future event'],
        'Dormía is the ongoing background.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Present the opening as the next completed event: Entonces Ana ___ la ventana. (abrir, preterite)',
        'abrió',
        'Abrió presents an event that advances the story.',
      ),
      choose(
        'revisit-choice',
        'Present living there for ten years as one complete period.',
        ['Viví allí diez años.', 'Vivía allí cuando conocí a Ana.'],
        'Viví bounds the period as a whole; its length does not require the imperfect.',
      ),
    ],
    'Write a new four-sentence scene. Give ongoing background and two completed events; include one event that lasted a while.',
  ),
  'B1-02.earlier-past': pack(
    [
      form(
        'check-form',
        'Ana ya ___ cuando llamé. (salir, pluperfect)',
        'había salido',
        'Había salido places her departure before the call.',
      ),
      choose(
        'check-choice',
        '“Habíamos comido cuando llegó Ana.” What was earlier?',
        ['Our meal', 'Ana’s arrival'],
        'Habíamos comido places the meal before llegó.',
      ),
    ],
    'Cuando llegué, Ana salió.',
    'Cuando llegué, Ana ya había salido.',
    'The second explicitly places her departure before my arrival; the first places it at or after that arrival.',
    [
      choose(
        'revisit-recognize',
        '“Cuando llamé, ya habían cerrado la tienda.” Which happened first?',
        ['The shop closed', 'I called', 'Neither order is indicated'],
        'Habían cerrado is earlier than llamé.',
        'recognition',
      ),
      form(
        'revisit-form',
        'Nosotros ya ___ cuando llegó Ana. (terminar, pluperfect)',
        'habíamos terminado',
        'Use habíamos for nosotros plus the unchanging participle terminado.',
      ),
      choose(
        'revisit-choice',
        'Say explicitly that Luis left before you arrived.',
        ['Cuando llegué, Luis ya había salido.', 'Cuando llegué, Luis salió.'],
        'Había salido makes the earlier departure explicit.',
      ),
    ],
    'Write a new account of arriving somewhere. Include two things that had already happened and a later event.',
  ),
  'B2-01.past-narration': pack(
    [
      form(
        'check-form',
        'The guests ate before I arrived: Cuando llegué, los invitados ya ___. (comer, pluperfect)',
        'habían comido',
        'Plural invitados requires habían; eating precedes the arrival.',
      ),
      choose(
        'check-choice',
        'Choose the sentence that presents rain as the ongoing background to our departure.',
        ['Llovía cuando salimos.', 'Llovió durante dos horas.'],
        'Llovía supplies the background; llovió presents a bounded event.',
      ),
    ],
    'Cuando llamé, Ana preparó la cena.',
    'Cuando llamé, Ana ya había preparado la cena.',
    'Changing the tense moves preparation from the time of the call to before the call. A coherent story preserves this relationship.',
    [
      choose(
        'revisit-recognize',
        '“Estaba oscuro. Encendí la luz: alguien había cerrado las cortinas.” What preceded switching on the light?',
        [
          'Someone closed the curtains',
          'The light was switched off again',
          'The sentence states no earlier event',
        ],
        'Había cerrado places the closing before encendí; estaba supplies a state.',
        'recognition',
      ),
      form(
        'revisit-form',
        'The guests left before we arrived: Cuando llegamos, los invitados ya ___. (irse, pluperfect; include se)',
        'se habían ido',
        'Se comes before the auxiliary; habían agrees with invitados and ido remains unchanged.',
      ),
      choose(
        'revisit-choice',
        'Choose the account with cooking already complete before the arrival.',
        [
          'Hacía frío. Llegué a casa. Ana ya había preparado la cena.',
          'Hacía frío. Llegué a casa. Entonces Ana empezó a preparar la cena.',
        ],
        'Ya había preparado gives an earlier completed action; empezó describes a later start.',
      ),
    ],
    'Write a different six-sentence story about a surprise. Give background, events that advance the story, and an earlier cause using the pluperfect.',
  ),
};
