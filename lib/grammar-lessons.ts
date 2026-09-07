import type { CEFRLevel } from './cefr';
import { GRAMMAR_CONTENT, type GrammarQuestion } from './level-content';

export type GrammarRule = {
  title: string;
  explanation: string;
  spanish: string;
  english: string;
};
export type GrammarLesson = {
  id: string;
  title: string;
  category: string;
  description: string;
  rules: GrammarRule[];
  reminder: string;
  questions: (GrammarQuestion & { context?: string })[];
};

const rule = (
  title: string,
  explanation: string,
  spanish: string,
  english: string,
): GrammarRule => ({ title, explanation, spanish, english });
const question = (
  sentence: string,
  options: string[],
  answer: number,
  explanation: string,
  context?: string,
): GrammarLesson['questions'][number] => ({
  sentence,
  options,
  answer,
  explanation,
  context,
});

const starterRules: Record<CEFRLevel, GrammarRule[]> = {
  A1: [
    rule(
      'Ser: identity and origin',
      'Use ser to say who someone is or where they are from.',
      'Soy de México.',
      'I am from Mexico.',
    ),
    rule(
      'Estar: state and location',
      'Use estar for how someone feels and where people or things are.',
      'Estamos en casa.',
      'We are at home.',
    ),
    rule(
      'Tener: age and possession',
      'Use tener for age, possessions, and expressions such as tener hambre.',
      'Tengo treinta años.',
      'I am thirty years old.',
    ),
  ],
  A2: [
    rule(
      'A completed event',
      'Use the preterite to present an action as a completed whole.',
      'Ayer compré pan.',
      'Yesterday I bought bread.',
    ),
    rule(
      'A sequence of actions',
      'Use the preterite for the completed steps in a story.',
      'Cenamos y después vimos una película.',
      'We had dinner and then watched a film.',
    ),
    rule(
      'Some verbs change their stem',
      'Ir and ser share the preterite forms fui, fuiste, fue, fuimos, fuisteis, fueron.',
      'El sábado fui al mercado.',
      'On Saturday I went to the market.',
    ),
  ],
  B1: [
    rule(
      'Set the scene',
      'The imperfect presents background, recurring habits, or an action already in progress.',
      'De niño, vivía cerca del mar.',
      'As a child, I lived near the sea.',
    ),
    rule(
      'Move the story forward',
      'The preterite presents an event as a completed whole.',
      'Ayer fui al mercado.',
      'Yesterday I went to the market.',
    ),
    rule(
      'Combine background and event',
      'Use the imperfect for the ongoing activity and the preterite for the event that interrupts it.',
      'Cenábamos cuando sonó el teléfono.',
      'We were having dinner when the phone rang.',
    ),
  ],
  B2: [
    rule(
      'Imagine a different present',
      'Pair si + imperfect subjunctive with the conditional for an imagined condition and result.',
      'Si tuviera tiempo, viajaría más.',
      'If I had time, I would travel more.',
    ),
    rule(
      'Refer to a future event',
      'After en cuanto, an event that has not happened yet takes the subjunctive.',
      'En cuanto llegue, te llamaré.',
      'As soon as I arrive, I will call you.',
    ),
    rule(
      'Express a completed possibility',
      'Puede que takes the subjunctive. Use haya + participle for a possibly completed action.',
      'Puede que hayan salido.',
      'They may have gone out.',
    ),
    rule(
      'Allow for an imagined obstacle',
      'Aunque with the imperfect subjunctive can introduce a hypothetical concession.',
      'Aunque lloviera, saldríamos.',
      'Even if it rained, we would go out.',
    ),
  ],
  C1: [
    rule(
      'Concede without changing the outcome',
      'Por mucho que + subjunctive can present effort as unable to change the result.',
      'Por mucho que insistas, no iré.',
      'However much you insist, I will not go.',
    ),
    rule(
      'Reject an interpretation',
      'No es que + subjunctive rejects a proposed explanation.',
      'No es que sea difícil; es que lleva tiempo.',
      'It is not that it is difficult; it is that it takes time.',
    ),
    rule(
      'Compress an unreal past condition',
      'De haber + participle can replace a condition with si hubiera. The result can use the conditional perfect.',
      'De haberlo sabido, habría venido.',
      'Had I known, I would have come.',
    ),
    rule(
      'Set the objection aside',
      'Sea como sea is a fixed concessive expression used before a conclusion.',
      'Sea como sea, hay que decidir.',
      'Be that as it may, a decision is needed.',
    ),
  ],
  C2: [
    rule(
      'Make a formal concession',
      'Si bien can introduce a qualification, including a shortened adjective phrase.',
      'El método, si bien útil, tiene límites.',
      'The method, while useful, has limits.',
    ),
    rule(
      'Refer to a prior action',
      'Haber + participle puts an infinitive action before another reference point.',
      'No por haber llegado antes tenía prioridad.',
      'Arriving earlier did not in itself give them priority.',
    ),
    rule(
      'Choose a formal fixed expression',
      'Huelga decir introduces information presented as obvious. It is more formal than a simple assertion.',
      'Huelga decir que el plazo importa.',
      'It goes without saying that the deadline matters.',
    ),
    rule(
      'Choose the concessive connector',
      'Aun cuando introduces a concession. The subjunctive can place its content outside the main assertion.',
      'Aun cuando discrepara, escuchó con atención.',
      'Even though he may have disagreed, he listened carefully.',
    ),
  ],
};

const reminders: Record<CEFRLevel, string> = {
  A1: 'Ser and estar are not simply permanent versus temporary. Learn the use: origin, identity, state, or location.',
  A2: 'A time word alone does not force a tense. These questions ask you to report completed events.',
  B1: 'The speaker’s view of an action matters. A completed event and an ongoing background can refer to the same day.',
  B2: 'In this imagined-condition pattern, use si tuviera, not si tendría.',
  C1: 'Concessive connectors do not all require the subjunctive. The meaning and the status of the information matter.',
  C2: 'More than one structure can be grammatical. Follow the stated time frame and intended register in each question.',
};

function starter(level: CEFRLevel): GrammarLesson {
  const content = GRAMMAR_CONTENT[level];
  return {
    id: `${level.toLowerCase()}-core`,
    title: content.title,
    category: {
      A1: 'Essential verbs',
      A2: 'Past tense',
      B1: 'Telling a story',
      B2: 'Mood and conditions',
      C1: 'Argument and stance',
      C2: 'Style and precision',
    }[level],
    description: content.description,
    rules: starterRules[level],
    reminder: reminders[level],
    questions: content.questions.map((item, index) => ({
      ...item,
      sentence:
        level === 'C2' && index === 0
          ? '___ discrepara, su intervención resultó útil.'
          : item.sentence,
      context:
        level === 'A2'
          ? 'Report a completed event.'
          : level === 'B1'
            ? [
                'Report a completed trip yesterday.',
                'Describe a recurring habit, without a bounded total.',
                'The phone rang once, interrupting dinner.',
                'Describe an ongoing childhood habit.',
              ][index]
            : level === 'B2' && index === 3
              ? 'Treat the price as an imagined possibility, not an established fact.'
              : level === 'C2' && index === 1
                ? 'Refer explicitly to a completed prior action with a perfect infinitive.'
                : level === 'C1' && index === 2
                  ? 'Use the conditional perfect for an unreal past result.'
                  : level === 'A1' && index === 1
                    ? 'Describe how you feel today.'
                    : undefined,
      explanation:
        level === 'C1' && index === 0
          ? 'Here, por mucho que presents future attempts as unable to change the outcome, so use expliques.'
          : item.explanation,
    })),
  };
}

export const GRAMMAR_LESSONS: Record<CEFRLevel, GrammarLesson[]> = {
  A1: [
    starter('A1'),
    {
      id: 'a1-present',
      title: 'Regular present tense',
      category: 'Everyday actions',
      description: 'Talk about what you do with hablar, comer, and vivir.',
      rules: [
        rule(
          'Start with the stem',
          'Remove -ar, -er, or -ir, then add the ending for the subject. The yo ending is -o for all three groups.',
          'Hablo español. Como pan. Vivo aquí.',
          'I speak Spanish. I eat bread. I live here.',
        ),
        rule(
          'Match the subject',
          'For tú, use -as with -ar verbs and -es with -er and -ir verbs.',
          'Tú hablas y ella escucha.',
          'You speak and she listens.',
        ),
        rule(
          'Use the plural endings',
          'For nosotros, use -amos, -emos, or -imos. For ellos, use -an or -en.',
          'Vivimos en Madrid. Ellos viven en Lima.',
          'We live in Madrid. They live in Lima.',
        ),
      ],
      reminder:
        'Spanish often leaves out the subject pronoun because the verb ending identifies it.',
      questions: [
        question(
          'Yo ___ español.',
          ['hablas', 'hablo', 'hablan'],
          1,
          'The yo form of hablar is hablo.',
        ),
        question(
          'Tú ___ fruta.',
          ['come', 'comemos', 'comes'],
          2,
          'The tú form of comer is comes.',
        ),
        question(
          'Nosotros ___ en Lima.',
          ['vivimos', 'viven', 'vivo'],
          0,
          'The nosotros ending for an -ir verb is -imos.',
        ),
        question(
          'Ellas ___ en un café.',
          ['trabajamos', 'trabajan', 'trabajas'],
          1,
          'The ellas ending for an -ar verb is -an.',
        ),
      ],
    },
    {
      id: 'a1-agreement',
      title: 'Gender and number',
      category: 'Building phrases',
      description: 'Match articles and adjectives to the nouns they describe.',
      rules: [
        rule(
          'Match the article',
          'Use el or un with masculine singular nouns; la or una with feminine singular nouns.',
          'Un libro y una mesa.',
          'A book and a table.',
        ),
        rule(
          'Match the adjective',
          'Adjectives ending in -o usually change to -a with feminine nouns. Many other adjectives keep the same gender form.',
          'El libro rojo. La mesa roja.',
          'The red book. The red table.',
        ),
        rule(
          'Make the whole phrase plural',
          'Articles and adjectives also agree in number. Words ending in an unstressed vowel usually add -s.',
          'Las mesas rojas.',
          'The red tables.',
        ),
      ],
      reminder:
        'Learn each noun with its article. Endings are useful clues, but there are exceptions such as el día.',
      questions: [
        question(
          '___ casa es pequeña.',
          ['El', 'Los', 'La'],
          2,
          'Casa is feminine and singular, so use la.',
        ),
        question(
          'Los libros son ___.',
          ['rojos', 'roja', 'rojo'],
          0,
          'Libros is masculine plural, so use rojos.',
        ),
        question(
          'Tengo dos mesas ___.',
          ['blanco', 'blancas', 'blanca'],
          1,
          'Mesas is feminine plural, so use blancas.',
        ),
        question(
          '___ días son largos.',
          ['Las', 'La', 'Los'],
          2,
          'Día is masculine despite ending in -a. Its plural article is los.',
        ),
      ],
    },
  ],
  A2: [
    starter('A2'),
    {
      id: 'a2-imperfect',
      title: 'Past routines',
      category: 'The imperfect',
      description: 'Describe what you used to do and what things were like.',
      rules: [
        rule(
          'Describe a habit',
          'Use the imperfect for recurring past activities without presenting a bounded total.',
          'Antes caminaba al trabajo.',
          'I used to walk to work.',
        ),
        rule(
          'Use -aba and -ía',
          'Regular -ar verbs use -aba endings. Regular -er and -ir verbs use -ía endings.',
          'Jugábamos fuera y comíamos tarde.',
          'We used to play outside and eat late.',
        ),
        rule(
          'Learn the three irregular verbs',
          'Ser, ir, and ver are irregular: era, iba, veía in the yo form.',
          'De niña, iba al parque.',
          'As a girl, I used to go to the park.',
        ),
      ],
      reminder:
        'The imperfect can describe a repeated action or an ongoing situation. It does not tell you when that situation ended.',
      questions: [
        question(
          'De niño, yo ___ al fútbol cada día.',
          ['jugaba', 'jugábamos', 'jugabas'],
          0,
          'Yo takes jugaba, with the regular -ar imperfect ending.',
        ),
        question(
          'Antes nosotros ___ cerca del mar.',
          ['vivía', 'vivían', 'vivíamos'],
          2,
          'Nosotros takes vivíamos. Keep the written accent on í.',
        ),
        question(
          'Mi escuela ___ pequeña.',
          ['eran', 'era', 'éramos'],
          1,
          'The singular subject mi escuela takes era.',
        ),
        question(
          'Mis abuelos ___ al mercado los lunes.',
          ['iban', 'iba', 'íbamos'],
          0,
          'Mis abuelos is plural: iban.',
        ),
      ],
    },
    {
      id: 'a2-direct-objects',
      title: 'Lo, la, los, and las',
      category: 'Object pronouns',
      description: 'Refer back to things without repeating their names.',
      rules: [
        rule(
          'Replace a direct object',
          'Use lo for a masculine singular thing and la for a feminine singular thing.',
          '¿El café? Lo preparo ahora.',
          'The coffee? I am making it now.',
        ),
        rule(
          'Keep number and gender',
          'Use los and las to refer to plural objects.',
          '¿Las llaves? Las tengo aquí.',
          'The keys? I have them here.',
        ),
        rule(
          'Put the pronoun before a conjugated verb',
          'In a simple statement, the object pronoun goes before the conjugated verb.',
          'La compro mañana.',
          'I am buying it tomorrow.',
        ),
      ],
      reminder:
        'With an infinitive, the pronoun can attach to the end: quiero comprarlo. This practice uses conjugated verbs.',
      questions: [
        question(
          'El pan está listo. ___ llevo a la mesa.',
          ['La', 'Lo', 'Los'],
          1,
          'Pan is masculine singular, so its direct object pronoun is lo.',
        ),
        question(
          '¿Las entradas? ___ tengo yo.',
          ['Los', 'La', 'Las'],
          2,
          'Entradas is feminine plural, so use las.',
        ),
        question(
          'La sopa está fría. ___ caliento.',
          ['La', 'Lo', 'Las'],
          0,
          'Sopa is feminine singular, so use la.',
        ),
        question(
          'Estos libros me interesan. ___ compro.',
          ['Lo', 'Los', 'Las'],
          1,
          'Libros is masculine plural, so use los.',
        ),
      ],
    },
  ],
  B1: [
    starter('B1'),
    {
      id: 'b1-subjunctive',
      title: 'Wishes and recommendations',
      category: 'Present subjunctive',
      description: 'Use the subjunctive when you want someone else to act.',
      rules: [
        rule(
          'A wish about another person',
          'Querer que introduces the subjunctive when the next clause has a different subject.',
          'Quiero que vengas mañana.',
          'I want you to come tomorrow.',
        ),
        rule(
          'A recommendation',
          'Recomendar que and aconsejar que introduce recommended actions with the subjunctive.',
          'Te recomiendo que descanses.',
          'I recommend that you rest.',
        ),
        rule(
          'A shared subject uses the infinitive',
          'When the same person wants to do the action, use an infinitive after querer.',
          'Quiero descansar.',
          'I want to rest.',
        ),
      ],
      reminder:
        'The word que alone does not trigger the subjunctive. Look at what the main clause expresses.',
      questions: [
        question(
          'Quiero que tú ___ conmigo.',
          ['vienes', 'vendrás', 'vengas'],
          2,
          'A wish about a different subject uses the subjunctive: vengas.',
        ),
        question(
          'Te recomiendo que ___ más agua.',
          ['bebas', 'bebes', 'beberás'],
          0,
          'A recommendation with que takes the subjunctive: bebas.',
        ),
        question(
          'Quiero ___ español cada día.',
          ['practique', 'practicar', 'practico'],
          1,
          'The subject of both actions is yo, so use the infinitive practicar.',
        ),
        question(
          'Esperamos que todo ___ bien.',
          ['sale', 'saldrá', 'salga'],
          2,
          'Esperar que expresses a hope here and takes salga.',
        ),
      ],
    },
    {
      id: 'b1-pronoun-pairs',
      title: 'Combining object pronouns',
      category: 'Sentence structure',
      description: 'Put the thing and its recipient into the same sentence.',
      rules: [
        rule(
          'Recipient first, thing second',
          'Place an indirect object pronoun before the direct object pronoun.',
          'Me lo envían hoy.',
          'They are sending it to me today.',
        ),
        rule(
          'Le and les become se',
          'Before lo, la, los, or las, use se instead of le or les.',
          'Le doy el libro. Se lo doy.',
          'I give her the book. I give it to her.',
        ),
        rule(
          'Keep the pair together',
          'Both pronouns go before the conjugated verb or attach together to an infinitive.',
          'Te lo voy a explicar. Voy a explicártelo.',
          'I am going to explain it to you.',
        ),
      ],
      reminder:
        'Se does not identify the recipient by itself. Add a phrase such as a Ana when the context is unclear.',
      questions: [
        question(
          'Doy las llaves a Ana. ___ doy.',
          ['Le las', 'Se las', 'Se lo'],
          1,
          'Le becomes se before las; las refers to the keys.',
        ),
        question(
          'Envío el informe a mis colegas. ___ envío.',
          ['Se lo', 'Les lo', 'Se los'],
          0,
          'Les becomes se before lo. Informe is singular, even though the recipients are plural.',
        ),
        question(
          '¿Me prestas la bicicleta? Sí, ___ presto.',
          ['te lo', 'se la', 'te la'],
          2,
          'Te refers to you; la refers to the bicycle.',
        ),
        question(
          'Voy a explicar el problema a ti. Voy a ___.',
          ['explicartelo', 'explicártelo', 'te lo explicar'],
          1,
          'Attach the pair to the infinitive and add the written accent: explicártelo.',
        ),
      ],
    },
  ],
  B2: [
    starter('B2'),
    {
      id: 'b2-reported-speech',
      title: 'Reporting what someone said',
      category: 'Reported speech',
      description:
        'Adjust pronouns, time references, and tense when retelling a message.',
      rules: [
        rule(
          'Move the viewpoint into the past',
          'A present statement can become imperfect when you report it from a past viewpoint.',
          '«Estoy cansada». Dijo que estaba cansada.',
          '“I am tired.” She said she was tired.',
        ),
        rule(
          'Express future from the past',
          'The conditional can report an action that was still in the future at the time of speaking.',
          '«Volveré». Dijo que volvería.',
          '“I will return.” She said she would return.',
        ),
        rule(
          'Report a request',
          'A past request with que takes the imperfect subjunctive.',
          '«Espera». Me pidió que esperara.',
          '“Wait.” She asked me to wait.',
        ),
      ],
      reminder:
        'Tense shifts depend on the reporting context. A statement that remains current can sometimes keep its original tense.',
      questions: [
        question(
          'Dijo que ___ cansada.',
          ['estaría', 'estaba', 'esté'],
          1,
          'Estaba reports her state at the time she spoke.',
          'Report «Estoy cansada» from a past viewpoint.',
        ),
        question(
          'Dijo que ___ al día siguiente.',
          ['volvería', 'volviera', 'había vuelto'],
          0,
          'Volvería expresses future relative to the past statement.',
          'Report «Volveré mañana» from a later day.',
        ),
        question(
          'Me pidió que la ___.',
          ['llamo', 'llamaré', 'llamara'],
          2,
          'A past request takes the imperfect subjunctive: llamara.',
          'Report the request «Llámame».',
        ),
        question(
          'Dijo que ya ___ el trabajo.',
          ['terminara', 'había terminado', 'terminaría'],
          1,
          'Había terminado locates the finished work before the past statement.',
          'Report «Ya he terminado el trabajo» from a past viewpoint.',
        ),
      ],
    },
    {
      id: 'b2-connectors',
      title: 'Contrast and concession',
      category: 'Connecting ideas',
      description: 'Distinguish an obstacle, a contrast, and a correction.',
      rules: [
        rule(
          'Concede a point',
          'Aunque introduces an obstacle that does not prevent the main result.',
          'Aunque llueve, salimos.',
          'Although it is raining, we are going out.',
        ),
        rule(
          'Connect contrasting statements',
          'Sin embargo links a statement to a contrasting one.',
          'Era caro; sin embargo, lo compramos.',
          'It was expensive; however, we bought it.',
        ),
        rule(
          'Correct a rejected idea',
          'Use sino after a negative to replace one idea with another. Use sino que before a conjugated clause.',
          'No vino Ana, sino Luis.',
          'It was Luis who came, not Ana.',
        ),
      ],
      reminder:
        'After a pesar de, use a noun or infinitive; add que before a clause with a conjugated verb.',
      questions: [
        question(
          'No pedí té, ___ café.',
          ['pero', 'aunque', 'sino'],
          2,
          'Sino replaces the rejected object té with café.',
        ),
        question(
          'Era difícil; ___, lo resolvimos.',
          ['sin embargo', 'sino', 'a pesar de'],
          0,
          'Sin embargo connects two contrasting statements.',
        ),
        question(
          'A pesar de ___ cansada, terminó el trabajo.',
          ['estaba', 'estar', 'está'],
          1,
          'Without que, a pesar de can take the infinitive estar.',
        ),
        question(
          'No solo llamó, ___ vino a verme.',
          ['aunque', 'sino', 'sino que también'],
          2,
          'No solo … sino que también adds a second conjugated action.',
        ),
      ],
    },
  ],
  C1: [
    starter('C1'),
    {
      id: 'c1-focus',
      title: 'Put the focus where it belongs',
      category: 'Information structure',
      description:
        'Highlight a person, an action, or a specific part of a message.',
      rules: [
        rule(
          'Focus on a thing or action',
          'Lo que … es frames one part of the sentence as the information to emphasize.',
          'Lo que necesito es tiempo.',
          'What I need is time.',
        ),
        rule(
          'Identify a person',
          'Use quien to connect an identified person with their role in the event.',
          'Fue Marta quien llamó.',
          'It was Marta who called.',
        ),
        rule(
          'Make an object the topic',
          'A direct object placed before the verb as a topic is commonly resumed by an object pronoun.',
          'Ese informe, lo terminé ayer.',
          'That report, I finished it yesterday.',
        ),
      ],
      reminder:
        'Choose emphasis to fit the context. A focused construction can sound corrective when a neutral sentence would not.',
      questions: [
        question(
          '___ necesito es una respuesta clara.',
          ['Lo que', 'El que', 'La que'],
          0,
          'Lo que introduces the unspecified thing that is needed.',
        ),
        question(
          'Fue Elena ___ resolvió el problema.',
          ['cuyo', 'quien', 'donde'],
          1,
          'Quien refers to the person Elena.',
        ),
        question(
          'Esas cartas, ___ guardo en casa.',
          ['lo', 'los', 'las'],
          2,
          'The topic esas cartas is resumed by the feminine plural las.',
        ),
        question(
          'Fue allí ___ nos conocimos.',
          ['quien', 'donde', 'cuyo'],
          1,
          'Donde links the focused location allí with the event.',
        ),
      ],
    },
    {
      id: 'c1-relative-clauses',
      title: 'More precise relative clauses',
      category: 'Complex sentences',
      description:
        'Connect ideas with possession, prepositions, and sentence-level reference.',
      rules: [
        rule(
          'Express possession with cuyo',
          'Cuyo agrees with the possessed noun that follows, not with the possessor.',
          'La autora cuyo libro leí vendrá hoy.',
          'The author whose book I read is coming today.',
        ),
        rule(
          'Keep the required preposition',
          'Carry the preposition required by the verb into the relative clause.',
          'La persona con quien trabajo vive cerca.',
          'The person I work with lives nearby.',
        ),
        rule(
          'Refer to a whole statement',
          'Lo cual can refer back to the content of an entire preceding clause.',
          'Llegó tarde, lo cual nos sorprendió.',
          'He arrived late, which surprised us.',
        ),
      ],
      reminder:
        'Cuyo already expresses possession. Do not add a second possessive such as su after it.',
      questions: [
        question(
          'La escritora ___ novelas leí dará una charla.',
          ['cuyo', 'cuyos', 'cuyas'],
          2,
          'Cuyas agrees with novelas, feminine plural.',
        ),
        question(
          'El asunto ___ me refiero es urgente.',
          ['al que', 'del que', 'con el que'],
          0,
          'Referirse takes a: el asunto al que me refiero.',
        ),
        question(
          'Cancelaron el tren, ___ alteró nuestros planes.',
          ['cuyo', 'lo cual', 'quien'],
          1,
          'Lo cual refers to the cancellation as a whole.',
        ),
        question(
          'La colega ___ colaboro está de viaje.',
          ['de quien', 'a quien', 'con quien'],
          2,
          'Colaborar con requires con in the relative clause.',
        ),
      ],
    },
  ],
  C2: [
    starter('C2'),
    {
      id: 'c2-concessive-patterns',
      title: 'Concession without conditions',
      category: 'Nuanced structures',
      description: 'Keep a conclusion independent of who acts or what happens.',
      rules: [
        rule(
          'Repeat a subjunctive around a relative',
          'Pase lo que pase presents any possible event as irrelevant to the main outcome.',
          'Pase lo que pase, mantendré mi decisión.',
          'Whatever happens, I will stand by my decision.',
        ),
        rule(
          'Leave the person unrestricted',
          'Sea quien sea refers to a person without restricting their identity.',
          'Sea quien sea, tendrá que esperar.',
          'Whoever it is, they will have to wait.',
        ),
        rule(
          'Concede an extreme degree',
          'Por + adjective + que with the subjunctive can concede a degree without changing the conclusion.',
          'Por leve que parezca, conviene revisarlo.',
          'However slight it may seem, it should be checked.',
        ),
      ],
      reminder:
        'These patterns leave a variable open while keeping the main claim in place. Match the tense to the intended time frame.',
      questions: [
        question(
          '___ lo que pase, seguiré adelante.',
          ['Pasa', 'Pasará', 'Pase'],
          2,
          'Pase lo que pase is the open concessive pattern for possible future events.',
        ),
        question(
          'Sea ___ sea, tendrá que identificarse.',
          ['quien', 'cuyo', 'donde'],
          0,
          'Quien leaves the identity of the person unrestricted.',
        ),
        question(
          'Por insignificante que ___, hay que registrarlo.',
          ['parecerá', 'parezca', 'parece'],
          1,
          'Here parezca concedes any possible appearance of insignificance.',
          'Concede a possible degree, rather than asserting how it appears.',
        ),
        question(
          'Dijera lo que ___, nadie le creía.',
          ['dirá', 'dice', 'dijera'],
          2,
          'The repeated imperfect subjunctive matches this open concession in a past narrative.',
        ),
      ],
    },
    {
      id: 'c2-formal-compression',
      title: 'Compress a formal sentence',
      category: 'Register and syntax',
      description:
        'Use participles and infinitives to express relations concisely.',
      rules: [
        rule(
          'Use an absolute participle',
          'A participle clause can present a completed circumstance. Its participle agrees with its own noun.',
          'Concluida la reunión, salimos.',
          'Once the meeting had ended, we left.',
        ),
        rule(
          'Locate an action before another',
          'Tras haber + participle marks completion before the action of the main clause.',
          'Tras haber revisado el texto, lo envió.',
          'After reviewing the text, she sent it.',
        ),
        rule(
          'Express a condition with de + infinitive',
          'In formal language, de + infinitive can introduce a condition.',
          'De ser necesario, ampliaremos el plazo.',
          'If necessary, we will extend the deadline.',
        ),
      ],
      reminder:
        'Keep the implied subject clear in infinitive clauses. Absolute participle clauses can have their own explicit subject.',
      questions: [
        question(
          '___ las dudas, se aprobó el texto.',
          ['Resueltas', 'Resuelto', 'Resuelta'],
          0,
          'The absolute participle agrees with las dudas: resueltas.',
        ),
        question(
          'Tras ___ revisado el informe, lo remitió.',
          ['habiendo', 'haber', 'había'],
          1,
          'Tras takes the perfect infinitive haber revisado in this construction.',
        ),
        question(
          'De ___ necesario, convocaremos otra reunión.',
          ['sea', 'será', 'ser'],
          2,
          'De ser necesario is a concise formal condition.',
        ),
        question(
          '___ el plazo, no se admitirán solicitudes.',
          ['Vencida', 'Vencido', 'Vencidas'],
          1,
          'Vencido agrees with the masculine singular el plazo.',
        ),
      ],
    },
  ],
};
