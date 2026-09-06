import type { CEFRLevel } from './cefr';

export type ConversationContent = {
  prompt: string;
  promptEnglish: string;
  instruction: string;
  warmupTitle: string;
  warmup: { spanish: string; english: string }[];
  lessonTitle: string;
  lessonPoints: string[];
};

export const CONVERSATION_CONTENT: Record<CEFRLevel, ConversationContent> = {
  A1: {
    prompt: '¿Cómo te llamas?', promptEnglish: 'What is your name?',
    instruction: 'Listen and build a short introduction.', warmupTitle: 'Build a short answer',
    warmup: [
      { spanish: 'Me llamo Kurt.', english: 'My name is Kurt.' },
      { spanish: 'Soy de Nueva York.', english: 'I am from New York.' },
      { spanish: 'Vivo en Costa Rica.', english: 'I live in Costa Rica.' },
    ],
    lessonTitle: 'Introduce yourself',
    lessonPoints: ['Say your name', 'Say where you are from', 'Add where you live'],
  },
  A2: {
    prompt: '¿Qué haces los fines de semana?', promptEnglish: 'What do you do on weekends?',
    instruction: 'Listen and describe a familiar routine.', warmupTitle: 'Connect familiar details',
    warmup: [
      { spanish: 'Normalmente descanso en casa.', english: 'I normally rest at home.' },
      { spanish: 'A veces salgo con amigos.', english: 'Sometimes I go out with friends.' },
      { spanish: 'Los domingos preparo la comida.', english: 'On Sundays I prepare food.' },
    ],
    lessonTitle: 'Talk about your routine',
    lessonPoints: ['Use frequency words', 'Connect two activities', 'Ask a simple follow-up'],
  },
  B1: {
    prompt: '¿Qué planes tienes hoy?', promptEnglish: 'What plans do you have today?',
    instruction: 'Listen and add a reason or condition.', warmupTitle: 'Hear the shape of the answer',
    warmup: [
      { spanish: 'Depende del tiempo.', english: 'It depends on the weather.' },
      { spanish: 'Si hace buen tiempo, saldré a caminar.', english: 'If the weather is good, I’ll go for a walk.' },
      { spanish: 'Después quiero cenar con unos amigos.', english: 'Afterwards I want to have dinner with some friends.' },
    ],
    lessonTitle: 'Make plans naturally',
    lessonPoints: ['Listen for the key detail', 'Give a reason or condition', 'Add one detail of your own'],
  },
  B2: {
    prompt: '¿Qué harías si cambiaran tus planes?', promptEnglish: 'What would you do if your plans changed?',
    instruction: 'Respond naturally and develop the idea.', warmupTitle: 'Add conditions and alternatives',
    warmup: [
      { spanish: 'Si cambiaran los planes, aprovecharía para descansar.', english: 'If the plans changed, I would take the opportunity to rest.' },
      { spanish: 'De todas formas, preferiría salir un rato.', english: 'In any case, I would prefer to go out for a while.' },
      { spanish: 'Todo dependería de la hora.', english: 'Everything would depend on the time.' },
    ],
    lessonTitle: 'Discuss alternatives',
    lessonPoints: ['Use a hypothetical condition', 'Compare alternatives', 'Respond without translating literally'],
  },
  C1: {
    prompt: '¿Hasta qué punto conviene planificar el tiempo libre?', promptEnglish: 'To what extent is it useful to plan free time?',
    instruction: 'Develop a nuanced position and qualify it.', warmupTitle: 'Qualify a point of view',
    warmup: [
      { spanish: 'Hasta cierto punto, planificar ayuda a desconectar.', english: 'To a certain extent, planning helps you switch off.' },
      { spanish: 'Ahora bien, llenar cada momento puede resultar contraproducente.', english: 'That said, filling every moment can be counterproductive.' },
      { spanish: 'Lo ideal sería dejar margen para la improvisación.', english: 'Ideally, one would leave room for spontaneity.' },
    ],
    lessonTitle: 'Qualify an opinion',
    lessonPoints: ['Frame a nuanced position', 'Use contrasting connectors', 'Adjust register and emphasis'],
  },
  C2: {
    prompt: '¿Cómo condiciona el lenguaje nuestra forma de anticipar el futuro?', promptEnglish: 'How does language shape the way we anticipate the future?',
    instruction: 'Explore implication, stance, and subtle shifts in register.', warmupTitle: 'Control implication and stance',
    warmup: [
      { spanish: 'No es tanto que el lenguaje determine lo que pensamos, sino que matiza cómo lo formulamos.', english: 'It is not so much that language determines what we think, but that it nuances how we formulate it.' },
      { spanish: 'Según se plantee, una posibilidad puede sonar a promesa o a mera conjetura.', english: 'Depending on how it is framed, a possibility can sound like a promise or mere conjecture.' },
      { spanish: 'Ese matiz, por nimio que parezca, condiciona la interpretación.', english: 'That nuance, however slight it may seem, shapes the interpretation.' },
    ],
    lessonTitle: 'Control stance and implication',
    lessonPoints: ['Distinguish assertion from implication', 'Shift register deliberately', 'Reformulate without losing nuance'],
  },
};

export type GrammarQuestion = { sentence: string; options: string[]; answer: number; explanation: string };
export type GrammarContent = {
  eyebrow: string;
  title: string;
  description: string;
  whyTitle: string;
  why: string;
  questions: GrammarQuestion[];
  upcoming: { title: string; detail: string }[];
};

export const GRAMMAR_CONTENT: Record<CEFRLevel, GrammarContent> = {
  A1: {
    eyebrow: 'Grammar · Present tense', title: 'Ser, estar, or tener?',
    description: 'Choose the basic verb that completes each everyday sentence.',
    whyTitle: 'Build accurate basics', why: 'These three verbs carry identity, state, location, age, and possession.',
    questions: [
      { sentence: 'Yo ___ de Estados Unidos.', options: ['soy', 'estoy', 'tengo'], answer: 0, explanation: 'Use ser for origin: soy de Estados Unidos.' },
      { sentence: 'Hoy ___ cansado.', options: ['soy', 'estoy', 'tengo'], answer: 1, explanation: 'Use estar for a temporary state: estoy cansado.' },
      { sentence: 'Ella ___ treinta años.', options: ['es', 'está', 'tiene'], answer: 2, explanation: 'Spanish uses tener to express age.' },
      { sentence: 'Nosotros ___ en casa.', options: ['somos', 'estamos', 'tenemos'], answer: 1, explanation: 'Use estar for location: estamos en casa.' },
    ],
    upcoming: [{ title: 'Regular present tense', detail: 'Hablar, comer, and vivir' }, { title: 'Noun agreement', detail: 'Gender and number' }],
  },
  A2: {
    eyebrow: 'Grammar · Everyday past', title: 'What happened?',
    description: 'Choose the form for completed actions in familiar situations.',
    whyTitle: 'Describe recent events', why: 'The preterite lets you report completed actions and tell someone what happened.',
    questions: [
      { sentence: 'Ayer ___ al mercado.', options: ['fui', 'iba', 'voy'], answer: 0, explanation: 'Ayer marks a completed trip, so use fui.' },
      { sentence: 'Anoche ___ pasta.', options: ['cené', 'cenaba', 'ceno'], answer: 0, explanation: 'A completed meal last night uses the preterite: cené.' },
      { sentence: 'El sábado mis amigos me ___.', options: ['llamaron', 'llamaban', 'llaman'], answer: 0, explanation: 'A completed call on Saturday uses llamaron.' },
      { sentence: 'Después ___ una película.', options: ['vimos', 'veíamos', 'vemos'], answer: 0, explanation: 'Después continues a sequence of completed actions: vimos.' },
    ],
    upcoming: [{ title: 'Imperfect routines', detail: 'What you used to do' }, { title: 'Direct objects', detail: 'Lo, la, los, and las' }],
  },
  B1: {
    eyebrow: 'Grammar · Past choices', title: 'Preterite or imperfect?',
    description: 'Choose the form that matches the story. You’ll get the reason after every answer.',
    whyTitle: 'Tell a clearer story', why: 'Use the imperfect for the scene and recurring habits. Use the preterite for the event that moved the story forward.',
    questions: [
      { sentence: 'Ayer ___ al mercado antes de cenar.', options: ['iba', 'fui', 'he ido'], answer: 1, explanation: '“Ayer” and the completed trip point to the preterite: fui.' },
      { sentence: 'Cuando vivía en Madrid, ___ al trabajo todos los días.', options: ['caminé', 'caminaba', 'he caminado'], answer: 1, explanation: 'A repeated background habit uses the imperfect: caminaba.' },
      { sentence: 'Mientras cenábamos, ___ el teléfono.', options: ['sonó', 'sonaba', 'ha sonado'], answer: 0, explanation: 'The call is a completed event that interrupted the background action: sonó.' },
      { sentence: 'De niño, siempre ___ los veranos con mis abuelos.', options: ['pasé', 'pasaba', 'he pasado'], answer: 1, explanation: '“Siempre” describes a recurring childhood routine, so use pasaba.' },
    ],
    upcoming: [{ title: 'Present subjunctive', detail: 'Wishes and recommendations' }, { title: 'Object pronouns', detail: 'Placement and combinations' }],
  },
  B2: {
    eyebrow: 'Grammar · Hypotheticals', title: 'Conditions and consequences',
    description: 'Match hypothetical conditions with natural consequences.',
    whyTitle: 'Discuss possibilities precisely', why: 'Control of conditional patterns helps distinguish likely plans from imagined alternatives.',
    questions: [
      { sentence: 'Si tuviera más tiempo, ___ otro idioma.', options: ['aprendo', 'aprenderé', 'aprendería'], answer: 2, explanation: 'An unreal present condition uses imperfect subjunctive plus conditional.' },
      { sentence: 'En cuanto ___ la respuesta, te avisaré.', options: ['sabré', 'sepa', 'sabría'], answer: 1, explanation: 'A future event after en cuanto takes the present subjunctive: sepa.' },
      { sentence: 'Puede que ellos ya ___.', options: ['llegaron', 'hayan llegado', 'llegarían'], answer: 1, explanation: 'Puede que triggers the subjunctive; the completed possibility uses hayan llegado.' },
      { sentence: 'Aunque ___ caro, lo compraría.', options: ['fuera', 'será', 'es'], answer: 0, explanation: 'The hypothetical concession pairs aunque fuera with the conditional.' },
    ],
    upcoming: [{ title: 'Reported speech', detail: 'Shift tense and perspective' }, { title: 'Advanced connectors', detail: 'Concession and contrast' }],
  },
  C1: {
    eyebrow: 'Grammar · Nuance', title: 'Frame and qualify an argument',
    description: 'Choose structures that preserve stance, concession, and emphasis.',
    whyTitle: 'Control the reader’s interpretation', why: 'Advanced grammar changes how strongly a claim is presented, not only whether it is correct.',
    questions: [
      { sentence: 'Por mucho que lo ___, no cambiará de opinión.', options: ['explicas', 'expliques', 'explicarás'], answer: 1, explanation: 'Por mucho que introduces a concessive idea and takes the subjunctive.' },
      { sentence: 'No es que no me ___; es que necesito más datos.', options: ['interesa', 'interese', 'interesará'], answer: 1, explanation: 'No es que rejects a possible interpretation and normally takes the subjunctive.' },
      { sentence: 'De haberlo sabido, te ___.', options: ['avisaba', 'habría avisado', 'avisaré'], answer: 1, explanation: 'De haberlo sabido expresses an unreal past condition, followed by the conditional perfect.' },
      { sentence: 'Sea como ___, tendremos que decidir hoy.', options: ['es', 'sea', 'será'], answer: 1, explanation: 'Sea como sea is a fixed concessive construction.' },
    ],
    upcoming: [{ title: 'Information structure', detail: 'Focus and emphasis' }, { title: 'Register shifts', detail: 'Formal and conversational syntax' }],
  },
  C2: {
    eyebrow: 'Grammar · Precision', title: 'Control implication and register',
    description: 'Distinguish structures whose differences are grammatical, pragmatic, and stylistic.',
    whyTitle: 'Make deliberate choices', why: 'At C2, grammar is also a tool for controlling implication, rhythm, distance, and voice.',
    questions: [
      { sentence: '___ que discrepara, su intervención resultó útil.', options: ['Aun', 'Aun cuando', 'Con que'], answer: 1, explanation: 'Aun cuando introduces a concession; discrepara presents it with interpretive distance.' },
      { sentence: 'No por ___ antes habría sido más convincente.', options: ['hablar', 'haber hablado', 'habría hablado'], answer: 1, explanation: 'No por haber hablado antes nominalizes the prior action without asserting a different outcome.' },
      { sentence: 'La propuesta, ___ viable, exige cautela.', options: ['si bien', 'por más', 'con tal de'], answer: 0, explanation: 'Si bien introduces a concise formal concession.' },
      { sentence: 'Huelga ___ que el acuerdo sigue sujeto a revisión.', options: ['decir', 'diga', 'dicho'], answer: 0, explanation: 'Huelga decir is a formal fixed expression meaning that something goes without saying.' },
    ],
    upcoming: [{ title: 'Marked word order', detail: 'Rhythm, focus, and literary effect' }, { title: 'Pragmatic particles', detail: 'Stance and interpersonal meaning' }],
  },
};
