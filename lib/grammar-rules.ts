import { PAST_RULES } from './grammar-past-content';
import type { CEFRLevel } from './cefr';

export type EvidenceKind = 'recognition' | 'formation' | 'choice';
export type RuleExercise = {
  id: string;
  kind: EvidenceKind;
  instruction: string;
  prompt: string;
  options?: string[];
  answers: string[];
  explanation: string;
};
export type RuleLesson = {
  id: string;
  version: number;
  moduleId: string;
  level: CEFRLevel;
  title: string;
  objective: string;
  prerequisites: string[];
  prerequisiteNote: string;
  explanation: string;
  pattern: string;
  examples: { spanish: string; english: string }[];
  contrast: string;
  variation: string;
  source: { title: string; url: string; section: string };
  reviewStatus: 'draft';
  exercises: RuleExercise[];
  production: { prompt: string; checklist: string[]; example: string };
};
const pcic = (levels: string, section: string) => ({
  title: `Instituto Cervantes · ${levels.toUpperCase()}`,
  url: `https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_${levels}.htm`,
  section,
});

export const GRAMMAR_RULES: RuleLesson[] = [
  {
    id: 'A1-04.agreement',
    version: 1,
    moduleId: 'A1-04',
    level: 'A1',
    title: 'Make adjectives agree',
    objective:
      'Describe familiar objects using matching noun and adjective forms.',
    prerequisites: ['A1-02', 'A1-03'],
    prerequisiteNote:
      'Know el/la/los/las and whether the noun is singular or plural. Learn the article with each noun.',
    explanation:
      'An adjective describing a noun agrees with its grammatical gender and number. For adjectives such as pequeño, use -o, -a, -os, or -as. Some adjectives have one gender form: fácil describes either a masculine or a feminine noun, but becomes fáciles in the plural.',
    pattern:
      'el libro pequeño → los libros pequeños · la casa pequeña → las casas pequeñas',
    examples: [
      { spanish: 'La mesa es pequeña.', english: 'The table is small.' },
      { spanish: 'Los libros son pequeños.', english: 'The books are small.' },
      {
        spanish: 'Las preguntas son fáciles.',
        english: 'The questions are easy.',
      },
    ],
    contrast:
      'In la mesa pequeña and la mesa es pequeña, pequeña describes mesa in both positions. Do not decide agreement from the person speaking or from the nearest unrelated word.',
    variation:
      'Noun endings are clues, not guarantees of gender. This lesson covers ordinary descriptive adjectives; compound colors and other special patterns come later.',
    source: pcic('a1-a2', '2.2–2.4: adjective gender, number, and position'),
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Identify the word being described.',
        prompt: 'La casa es pequeña. What does pequeña describe?',
        options: ['The house', 'The speaker', 'Several houses'],
        answers: ['The house'],
        explanation: 'Pequeña agrees with casa, the feminine singular noun.',
      },
      {
        id: 'form-singular',
        kind: 'formation',
        instruction: 'Write only the missing adjective. Use pequeño.',
        prompt: 'La mesa es ___.',
        answers: ['pequeña'],
        explanation: 'Mesa is feminine singular, so pequeño becomes pequeña.',
      },
      {
        id: 'form-plural',
        kind: 'formation',
        instruction: 'Write only the missing adjective. Use fácil.',
        prompt: 'Los ejercicios son ___.',
        answers: ['fáciles'],
        explanation:
          'Fácil has the same form for both genders. Its plural is fáciles, including the written accent.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'You are describing two small houses. Choose the matching description.',
        prompt: 'Hay dos casas ___.',
        options: ['pequeña', 'pequeñas', 'pequeños'],
        answers: ['pequeñas'],
        explanation:
          'Casas is feminine plural. Pequeñas preserves both features.',
      },
    ],
    production: {
      prompt:
        'Write two short Spanish sentences: describe one object, then several objects. Use an adjective in each sentence.',
      checklist: [
        'I identified each noun’s gender.',
        'My adjectives match singular or plural.',
        'I wrote my own descriptions.',
      ],
      example: 'El libro es pequeño. Las mesas son pequeñas.',
    },
  },
  {
    id: 'A2-06.imperfect',
    version: 1,
    moduleId: 'A2-06',
    level: 'A2',
    title: 'Describe a past routine',
    objective:
      'Form the imperfect to describe a familiar past habit or background.',
    prerequisites: ['A1-08', 'A2-05'],
    prerequisiteNote:
      'Recognize verb persons and the difference between a description and a completed event.',
    explanation:
      'The imperfect lets you look inside a past situation without presenting its beginning or end. It often describes routines and background. Regular -ar verbs use -aba, -abas, -aba, -ábamos, -abais, -aban. Regular -er and -ir verbs use -ía, -ías, -ía, -íamos, -íais, -ían.',
    pattern: 'hablar → hablaba · comer → comía · vivir → vivía',
    examples: [
      {
        spanish: 'De niña, Ana jugaba en el parque.',
        english: 'As a child, Ana used to play in the park.',
      },
      {
        spanish: 'Vivíamos cerca de la escuela.',
        english: 'We lived near the school.',
      },
      {
        spanish: 'Antes iba al trabajo en autobús.',
        english: 'I used to go to work by bus.',
      },
    ],
    contrast:
      'Caminaba al trabajo presents a routine or an activity from within. Caminé al trabajo presents a completed journey. A time expression alone does not force either tense.',
    variation:
      'The three irregular imperfect verbs are ser (era…), ir (iba…), and ver (veía…). Ustedes uses the third-person plural; vosotros uses -abais/-íais.',
    source: pcic('a1-a2', '9.1.2: imperfect indicative'),
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Read the description of a childhood routine.',
        prompt: 'De pequeño, Luis jugaba aquí cada tarde. What is presented?',
        options: [
          'One completed visit',
          'A repeated past activity',
          'A future plan',
        ],
        answers: ['A repeated past activity'],
        explanation:
          'The speaker describes Luis’s routine rather than counting completed visits.',
      },
      {
        id: 'form-regular',
        kind: 'formation',
        instruction: 'Use the imperfect of vivir. Write only the missing verb.',
        prompt: 'Nosotros ___ en Lima.',
        answers: ['vivíamos'],
        explanation: 'Remove -ir and add the nosotros ending -íamos: vivíamos.',
      },
      {
        id: 'form-irregular',
        kind: 'formation',
        instruction: 'Use the imperfect of ir. Write only the missing verb.',
        prompt: 'Yo ___ a la escuela a pie.',
        answers: ['iba'],
        explanation: 'Ir is irregular in the imperfect: yo iba.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'You want to describe a past routine without presenting it as a completed whole.',
        prompt: 'Antes, yo ___ al trabajo a pie.',
        options: ['camino', 'caminaba', 'caminaré'],
        answers: ['caminaba'],
        explanation:
          'Caminaba gives the past habitual viewpoint requested. Camino is present and caminaré is future.',
      },
    ],
    production: {
      prompt:
        'Describe a past routine in two or three Spanish sentences. Include where you lived or went, and something you regularly did.',
      checklist: [
        'I used imperfect forms for my background or routine.',
        'My verb endings match the subjects.',
        'I described a past situation rather than a future plan.',
      ],
      example:
        'Antes vivía en Quito. Iba a la escuela a pie y jugaba con mis amigos.',
    },
  },
  {
    id: 'B1-02.earlier-past',
    version: 1,
    moduleId: 'B1-02',
    level: 'B1',
    title: 'Say what had already happened',
    objective:
      'Place one event before another past reference point using the pluperfect.',
    prerequisites: ['A2-06', 'A2-07', 'B1-01'],
    prerequisiteNote:
      'Review the imperfect of haber and participles. A past reference point can be in the sentence or established by the conversation.',
    explanation:
      'Use the imperfect of haber plus a past participle to look back from a past reference point: había, habías, había, habíamos, habíais, habían. The participle stays unchanged with haber. Regular participles end in -ado or -ido; frequent irregulars include hecho, visto, escrito, and abierto.',
    pattern:
      'past reference point + an earlier event: llegué → ya habían salido',
    examples: [
      {
        spanish: 'Cuando llegué, Marta ya había salido.',
        english: 'When I arrived, Marta had already left.',
      },
      {
        spanish: 'No tenía hambre porque había comido.',
        english: 'I was not hungry because I had eaten.',
      },
      {
        spanish: 'Habíamos abierto las ventanas.',
        english: 'We had opened the windows.',
      },
    ],
    contrast:
      'Cuando llegué, Marta salió places her departure at or after my arrival in an ordinary sequential reading. Cuando llegué, Marta ya había salido puts her departure earlier. Ya is not a mechanical tense trigger.',
    variation:
      'The participle does not agree with a subject or object after haber: ellas habían escrito, not escritas. Regional differences in the present perfect do not remove this earlier-past relationship.',
    source: pcic('b1-b2', '9.1.8: pluperfect indicative'),
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Put the events in order.',
        prompt:
          'Cuando entré, Pablo ya había cerrado la ventana. What happened first?',
        options: [
          'I entered',
          'Pablo closed the window',
          'Both necessarily happened together',
        ],
        answers: ['Pablo closed the window'],
        explanation:
          'Había cerrado places the closing before the past reference point entré.',
      },
      {
        id: 'form-auxiliary',
        kind: 'formation',
        instruction:
          'Use the pluperfect of comer. Write the two missing words.',
        prompt: 'Nosotros ya ___ antes de salir.',
        answers: ['habíamos comido'],
        explanation: 'Nosotros requires habíamos. Comido remains unchanged.',
      },
      {
        id: 'form-participle',
        kind: 'formation',
        instruction:
          'Use the participle of escribir. Write only the missing word.',
        prompt: 'Ellas habían ___ la carta.',
        answers: ['escrito'],
        explanation:
          'Escrito is the irregular participle of escribir. Haber does not allow agreement with ellas or carta.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'The film started at eight. You arrived at eight thirty. Choose the earlier-past form.',
        prompt: 'Cuando llegué, la película ya ___.',
        options: ['había empezado', 'empezará', 'empieza'],
        answers: ['había empezado'],
        explanation:
          'The starting is earlier than your arrival, which is itself in the past.',
      },
    ],
    production: {
      prompt:
        'Write two or three Spanish sentences about arriving somewhere. Say what had happened before you arrived and what you did next.',
      checklist: [
        'I established a past reference point.',
        'I used había/habías/etc. plus a participle for the earlier event.',
        'The order of events is clear.',
      ],
      example:
        'Llegué a casa a las nueve. Mi hermana ya había preparado la cena. Comimos juntos.',
    },
  },
  {
    id: 'B2-04.past-counterfactual',
    version: 1,
    moduleId: 'B2-04',
    level: 'B2',
    title: 'Imagine a different past',
    objective: 'Describe an unreal past condition and an imagined past result.',
    prerequisites: ['B1-04', 'B2-02', 'B2-03'],
    prerequisiteNote:
      'Review conditional forms and hubiera/hubiese plus a participle before combining the clauses.',
    explanation:
      'To imagine a past that did not happen, put the condition in si + pluperfect subjunctive. A conditional perfect can express its imagined past consequence. Keep the actual events and the alternative clear from context.',
    pattern: 'si + hubiera/hubiese + participle → habría + participle',
    examples: [
      {
        spanish: 'Si hubiera salido antes, habría llegado a tiempo.',
        english: 'If I had left earlier, I would have arrived on time.',
      },
      {
        spanish: 'Habríamos llamado si hubiéramos tenido tu número.',
        english: 'We would have called if we had had your number.',
      },
      {
        spanish: 'Si hubieses avisado, habríamos esperado.',
        english: 'If you had let us know, we would have waited.',
      },
    ],
    contrast:
      'Si tuviera tiempo, viajaría imagines a present or future situation. Si hubiera tenido tiempo, habría viajado imagines a different past. A present result after a past condition is possible, but it is a separate mixed-time objective.',
    variation:
      'Hubiera and hubiese are both accepted in the condition. Hubiera + participle is also an accepted alternative to habría + participle in many counterfactual result clauses; it is accepted here. This exercise does not teach every use of si.',
    source: pcic(
      'b1-b2',
      '9.1.10 and 15.3.6: conditional perfect and conditional clauses',
    ),
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Yesterday you left late and missed your train.',
        prompt:
          'Si hubiera salido antes, habría llegado a tiempo. What does this describe?',
        options: [
          'The actual journey',
          'A different imagined past',
          'A promise for tomorrow',
        ],
        answers: ['A different imagined past'],
        explanation:
          'Given the stated facts, the sentence imagines changing the departure and its past consequence.',
      },
      {
        id: 'form-condition',
        kind: 'formation',
        instruction:
          'Use the pluperfect subjunctive of saber for yo. Write the two missing words.',
        prompt: 'Si lo ___, te habría llamado.',
        answers: ['hubiera sabido', 'hubiese sabido'],
        explanation:
          'Both hubiera sabido and hubiese sabido form the required past condition.',
      },
      {
        id: 'form-result',
        kind: 'formation',
        instruction:
          'Use the conditional perfect of llegar for nosotros. Write the two missing words.',
        prompt: 'Si hubiéramos salido antes, ___ a tiempo.',
        answers: ['habríamos llegado'],
        explanation:
          'The requested conditional perfect is habríamos llegado. Hubiéramos llegado is also grammatical as a result clause, but uses the pluperfect subjunctive rather than the requested form.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'You did not study and did not pass. Select the counterfactual past condition.',
        prompt: 'Si ___ más, habría aprobado.',
        options: ['estudio', 'habría estudiado', 'hubiera estudiado'],
        answers: ['hubiera estudiado'],
        explanation:
          'This counterfactual si-clause takes the pluperfect subjunctive. The conditional perfect belongs in the result pattern taught here.',
      },
    ],
    production: {
      prompt:
        'Describe a past plan that did not work out. State what really happened, then write a si sentence imagining a different past condition and result.',
      checklist: [
        'My actual and imagined events are distinguishable.',
        'My condition uses hubiera or hubiese plus a participle.',
        'My result describes the imagined past; habría or a suitable hubiera form is possible.',
      ],
      example:
        'No llevé un paraguas y me mojé. Si hubiera llevado uno, no me habría mojado.',
    },
  },
  {
    id: 'C1-04.cuyo',
    version: 1,
    moduleId: 'C1-04',
    level: 'C1',
    title: 'Connect possession with cuyo',
    objective:
      'Join facts with a possessive relative while preserving agreement and reference.',
    prerequisites: ['A1-04', 'B2-06'],
    prerequisiteNote:
      'Distinguish the antecedent from the noun inside a relative clause. Review gender and number agreement.',
    explanation:
      'Cuyo links an antecedent to a possessed or associated noun inside a relative clause. Its ending agrees with that following noun: cuyo informe, cuya propuesta, cuyos informes, cuyas propuestas. The antecedent’s gender does not determine the ending.',
    pattern: 'antecedent + cuyo/cuya/cuyos/cuyas + associated noun',
    examples: [
      {
        spanish: 'La arquitecta cuyos planos revisamos viene mañana.',
        english: 'The architect whose plans we reviewed is coming tomorrow.',
      },
      {
        spanish: 'El museo, cuya entrada es gratuita, cierra los lunes.',
        english: 'The museum, whose admission is free, closes on Mondays.',
      },
      {
        spanish: 'Conocí a un autor de cuya obra habíamos hablado.',
        english: 'I met an author whose work we had discussed.',
      },
    ],
    contrast:
      'La arquitecta cuyos planos… uses cuyos because planos is masculine plural. Que su is not the standard substitute in a formal possessive relative. A separate sentence with su may instead be a clear conversational reformulation.',
    variation:
      'Cuyo is especially useful in formal prose. Use a required preposition before it: hablar de la obra → de cuya obra. Do not add a definite article between cuyo and its noun.',
    source: {
      title: 'RAE–ASALE · cuyo, cuya',
      url: 'https://www.rae.es/dpd/cuyo',
      section: 'Possessive relation, agreement, and placement',
    },
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Identify the agreement controller.',
        prompt: 'La editora cuyos libros leí… Why is cuyos masculine plural?',
        options: [
          'It agrees with editora',
          'It agrees with libros',
          'It refers to several editors',
        ],
        answers: ['It agrees with libros'],
        explanation:
          'The associated noun libros determines the relative adjective’s gender and number.',
      },
      {
        id: 'form-feminine',
        kind: 'formation',
        instruction: 'Supply the appropriate form of cuyo.',
        prompt:
          'El investigador ___ propuestas aprobaron presentó el proyecto.',
        answers: ['cuyas'],
        explanation:
          'Propuestas is feminine plural, so the required form is cuyas.',
      },
      {
        id: 'form-preposition',
        kind: 'formation',
        instruction:
          'Complete the preposition and possessive relative. The phrase is confiar en el criterio.',
        prompt: 'Es una médica ___ criterio confío.',
        answers: ['en cuyo'],
        explanation:
          'En is required by confiar en. Cuyo agrees with criterio, not médica.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'Combine the facts in a formal possessive relative: la escuela tiene un patio; el patio fue renovado.',
        prompt: 'Visitamos la escuela ___ patio fue renovado.',
        options: ['cuya', 'cuyo el', 'cuyo'],
        answers: ['cuyo'],
        explanation:
          'Patio is masculine singular; use cuyo without an intervening article.',
      },
    ],
    production: {
      prompt:
        'Write a short formal description of an organization or professional. Include a possessive relative with cuyo and then paraphrase that sentence without cuyo.',
      checklist: [
        'Cuyo agrees with the associated noun.',
        'Any required preposition is retained.',
        'The paraphrase preserves the same person, thing, and relationship.',
      ],
      example:
        'La empresa cuyas oficinas visitamos ampliará su equipo. Visitamos las oficinas de esa empresa; la empresa ampliará su equipo.',
    },
  },
  {
    id: 'C2-03.open-concession',
    version: 1,
    moduleId: 'C2-03',
    level: 'C2',
    title: 'Keep a claim true across alternatives',
    objective:
      'Interpret and form repeated-subjunctive concessions without treating them as literal repetition.',
    prerequisites: ['B2-08', 'C1-03'],
    prerequisiteNote:
      'Review subjunctive morphology and the distinction between a condition and an obstacle that does not change an outcome.',
    explanation:
      'Patterns such as diga lo que diga or pase lo que pase leave alternatives open while keeping the main claim in force. Repeating the subjunctive verb frames the possible variation; the main clause says what remains true across it.',
    pattern:
      'subjunctive + relative expression + repeated subjunctive → unchanged outcome',
    examples: [
      {
        spanish: 'Pase lo que pase, mantendremos el acuerdo.',
        english: 'Whatever happens, we will keep the agreement.',
      },
      {
        spanish: 'Digan lo que digan, revisaré las pruebas.',
        english: 'Whatever they say, I will review the evidence.',
      },
      {
        spanish: 'Vayas donde vayas, necesitarás identificarte.',
        english: 'Wherever you go, you will need to identify yourself.',
      },
    ],
    contrast:
      'Si dicen eso, revisaré las pruebas makes that statement a condition for review. Digan lo que digan, revisaré las pruebas commits to review regardless of what they say. The pattern alone does not establish an ironic tone.',
    variation:
      'Choose the relative expression for the intended variable: lo que for what happens or is said, donde for location. Subject and time reference still matter; not every verb can simply be inserted into one fixed formula.',
    source: pcic(
      'c1-c2',
      '15.3.9: concessive clauses; repeated subjunctive constructions',
    ),
    reviewStatus: 'draft',
    exercises: [
      {
        id: 'recognize',
        kind: 'recognition',
        instruction: 'Interpret the speaker’s commitment.',
        prompt:
          'Digan lo que digan, publicaré los resultados. What is held constant?',
        options: [
          'Everyone will agree',
          'The decision to publish',
          'The words others will use',
        ],
        answers: ['The decision to publish'],
        explanation:
          'The other people’s statements vary; the commitment to publish remains.',
      },
      {
        id: 'form-person',
        kind: 'formation',
        instruction:
          'Use decir with ellos in this open concession. Supply both missing verb forms, separated by a space.',
        prompt: '___ lo que ___, revisaremos la propuesta.',
        answers: ['digan digan'],
        explanation:
          'Both verbs take the present subjunctive for ellos: digan lo que digan.',
      },
      {
        id: 'form-place',
        kind: 'formation',
        instruction:
          'Use ir with tú. Supply both missing verb forms, separated by a space.',
        prompt: '___ donde ___, necesitarás identificarte.',
        answers: ['vayas vayas'],
        explanation:
          'Vayas donde vayas opens the range of destinations while the identification requirement remains.',
      },
      {
        id: 'choose',
        kind: 'choice',
        instruction:
          'The agreement will remain in force regardless of future events. Choose the matching opening.',
        prompt: '___, mantendremos el acuerdo.',
        options: ['Si pasa eso', 'Pase lo que pase', 'Porque pasó eso'],
        answers: ['Pase lo que pase'],
        explanation:
          'The concession allows any eventuality. The alternatives introduce a specific condition or a cause instead.',
      },
    ],
    production: {
      prompt:
        'Write a brief response to someone raising several possible objections to a decision. Use a repeated-subjunctive concession, then paraphrase it explicitly and explain what varies and what stays fixed.',
      checklist: [
        'The repeated subjunctive forms agree with their subject.',
        'The relative expression matches the alternatives.',
        'My paraphrase preserves the commitment without adding an unsupported ironic or dismissive tone.',
      ],
      example:
        'Digan lo que digan, examinaré el informe. Lo examinaré independientemente de las opiniones que expresen. Cambian las opiniones posibles; se mantiene mi decisión de examinarlo.',
    },
  },
  ...PAST_RULES,
];

export function normalizeGrammarAnswer(answer: string) {
  // Preserve accents: they can distinguish grammatical forms.
  return answer
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es');
}
export function checkGrammarAnswer(exercise: RuleExercise, answer: string) {
  return exercise.answers.some(
    (accepted) =>
      normalizeGrammarAnswer(accepted) === normalizeGrammarAnswer(answer),
  );
}

export const EVIDENCE_LABELS: Record<EvidenceKind, string> = {
  recognition: 'Recognition',
  formation: 'Form',
  choice: 'Meaning in context',
};
