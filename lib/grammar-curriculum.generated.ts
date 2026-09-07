// Generated from docs/grammar-curriculum-plan.md. Run node scripts/generate-grammar-curriculum.mjs.
import type { CEFRLevel } from './cefr';
export type GrammarModule = {
  id: string;
  level: CEFRLevel;
  title: string;
  scope: string;
  objective: string;
  whenToUse: string;
  systemIds: string[];
};
export const GRAMMAR_SYSTEMS = [
  {
    id: 'G01',
    title: 'Sentence foundations',
    scope:
      'Word classes versus functions; subject and predicate; omitted subjects; person and agreement; neutral and marked word order; statements, questions, exclamations, directives; negation',
  },
  {
    id: 'G02',
    title: 'Nouns and noun phrases',
    scope:
      'Common/proper; count/mass; concrete/abstract; individual/collective; gender, number, exceptions; noun complements; nominalization and ellipsis',
  },
  {
    id: 'G03',
    title: 'Articles and determiners',
    scope:
      'Definite/indefinite/zero article; reference and specificity; demonstratives; possessives; numerals; distributives and quantifiers; agreement and ordering',
  },
  {
    id: 'G04',
    title: 'Adjectives and comparison',
    scope:
      'Qualifying/relational; agreement; position and meaning; apocope; comparative and superlative; attributive and predicative functions',
  },
  {
    id: 'G05',
    title: 'Pronouns and reference',
    scope:
      'Subject and prepositional forms; direct/indirect objects; clitics; doubling; reflexive/reciprocal; possessive/demonstrative/indefinite; interrogative and relative reference',
  },
  {
    id: 'G06',
    title: 'Copulas and existence',
    scope:
      'Ser, estar, haber; identity, properties, state, location, events, existence; predicative complements; change-of-state verbs',
  },
  {
    id: 'G07',
    title: 'Indicative tense and aspect',
    scope:
      'Present, past, future, conditional; simple and compound forms; viewpoint and temporal relations; lexical aspect; non-temporal uses',
  },
  {
    id: 'G08',
    title: 'Subjunctive and mood choice',
    scope:
      'Morphology; complement clauses; assertion, desire, evaluation, doubt; relative and adverbial clauses; time relations; mood alternations',
  },
  {
    id: 'G09',
    title: 'Commands and directives',
    scope:
      'Affirmative and negative commands; address forms; clitic placement; requests, instructions, invitations, prohibitions; directive alternatives',
  },
  {
    id: 'G10',
    title: 'Nonfinite forms and verb combinations',
    scope:
      'Infinitives, gerunds, participles; verbal versus adjectival uses; auxiliaries; modal/aspectual periphrases; causative and perception constructions',
  },
  {
    id: 'G11',
    title: 'Adverbs, prepositions, and government',
    scope:
      'Place/time/manner/degree; scope; prepositional phrases; required complements; personal a; por/para; duration; idiomatic combinations',
  },
  {
    id: 'G12',
    title: 'Coordination and subordination',
    scope:
      'Addition, alternatives, contrast; noun, relative, and adverbial clauses; temporal, locative, modal, causal, purpose, condition, concession, consequence, comparison',
  },
  {
    id: 'G13',
    title: 'Voice, valency, and se',
    scope:
      'Transitive/intransitive patterns; active/passive; impersonal predicates; reflexive, reciprocal, pronominal, middle/anticausative, passive and impersonal se; affected participants',
  },
  {
    id: 'G14',
    title: 'Grammar in discourse',
    scope:
      'Reporting; tense sequence; anaphora; topic/focus; information packaging; ellipsis; cohesion; stance, politeness, emphasis, register, and grammatical variation',
  },
  {
    id: 'G15',
    title: 'Written-form and morphology support',
    scope:
      'Stress and accents where they distinguish grammar; spelling changes in inflection; contractions; word formation; punctuation that marks clause structure or meaning',
  },
];
export const GRAMMAR_MODULES: GrammarModule[] = [
  {
    id: 'A1-01',
    level: 'A1',
    title: 'Sentence building',
    scope:
      'Subject, verb, object/complement; singular/plural persons; basic subject–verb agreement; ordinary subject omission; no English-style do-support',
    objective: 'Introduce oneself and ask another person a basic question',
    whenToUse:
      'Use this when introducing yourself, saying what someone does, or asking a simple question. It helps you put the person, action, and other information together in a short Spanish sentence.',
    systemIds: ['G01'],
  },
  {
    id: 'A1-02',
    level: 'A1',
    title: 'Noun gender and number',
    scope:
      'Common masculine/feminine patterns; learn nouns with articles; regular plurals; frequent exceptions; grammatical gender versus a person’s gender',
    objective:
      'Describe one object and several objects with consistent agreement',
    whenToUse:
      'Use this when naming objects or talking about one thing versus several. Knowing a noun’s gender and plural form helps you choose matching articles and descriptions, such as a book or several small houses.',
    systemIds: ['G02', 'G03'],
  },
  {
    id: 'A1-03',
    level: 'A1',
    title: 'Articles',
    scope:
      'El/la/los/las; un/una/unos/unas; basic reference; al/del; introductory omission with unmodified professions after ser',
    objective: 'Identify an object, then refer to it again',
    whenToUse:
      'Use this when introducing something new or referring to something your listener already knows. Articles help distinguish “a restaurant” from “the restaurant” and make phrases about places and professions sound natural.',
    systemIds: ['G03', 'G15'],
  },
  {
    id: 'A1-04',
    level: 'A1',
    title: 'Adjectives',
    scope:
      'Gender/number agreement; common invariable-gender adjectives; ordinary post-noun position; muy versus mucho in frequent frames',
    objective: 'Describe a person and an object',
    whenToUse:
      'Use this when describing people, places, and things: a small room, a friendly person, or two red bags. Match the description to the noun and say how strong a quality is.',
    systemIds: ['G04'],
  },
  {
    id: 'A1-05',
    level: 'A1',
    title: 'Demonstratives and possession',
    scope:
      'Este/ese/aquel families in concrete reference; mi/tu/su/nuestro; agreement with the possessed noun; de + possessor',
    objective: 'Identify whose belongings are being discussed',
    whenToUse:
      'Use this when pointing something out or explaining whose it is. You can distinguish this bag from that one and say “my keys,” “our house,” or “Ana’s phone.”',
    systemIds: ['G03', 'G05'],
  },
  {
    id: 'A1-06',
    level: 'A1',
    title: 'Quantity and number',
    scope:
      'Cardinal numbers; basic agreement with uno/un/una; mucho/poco; todo in common frames; age, price, dates and time expressions',
    objective: 'State quantities and distinguish one from several',
    whenToUse:
      'Use this when shopping, giving your age, arranging a time, or saying how much you need. Numbers and quantity words let you discuss prices, dates, and amounts such as one ticket or a little water.',
    systemIds: ['G03'],
  },
  {
    id: 'A1-07',
    level: 'A1',
    title: 'People and pronouns',
    scope:
      'Yo/tú/él/ella/nosotros; usted/ustedes; recognition of vosotros and vos; explicit versus omitted subject; basic prepositional forms in useful expressions',
    objective: 'Keep the addressee and verb person consistent',
    whenToUse:
      'Use this when choosing how to address someone and making clear who you are talking about. It helps you keep “I,” “you,” and “they” consistent with the verb and recognize different regional ways of saying “you.”',
    systemIds: ['G01', 'G05'],
  },
  {
    id: 'A1-08',
    level: 'A1',
    title: 'Present indicative',
    scope:
      'Regular -ar/-er/-ir patterns; common irregulars and stem changes; ser, estar, tener, ir, hacer, querer, poder and other frequent verbs; habitual and current reference',
    objective: 'Describe a simple routine without a supplied conjugation',
    whenToUse:
      'Use this when describing your routine, saying what you want, or explaining what you do. Present-tense verbs let you talk about familiar activities such as working, eating, living somewhere, or going to class.',
    systemIds: ['G07'],
  },
  {
    id: 'A1-09',
    level: 'A1',
    title: 'Ser, estar, hay, tener',
    scope:
      'Identity, origin, profession and basic characteristics; location and state, including familiar participial adjectives; existence with hay; age/possession and frequent tener expressions',
    objective: 'Distinguish existence from location in a room description',
    whenToUse:
      'Use this when introducing yourself, describing a room, or saying how someone feels. Choose the construction that fits identity, location, existence, age, or possession—for example, “there is a café” versus “the café is here.”',
    systemIds: ['G06'],
  },
  {
    id: 'A1-10',
    level: 'A1',
    title: 'Preferences and everyday routines',
    scope:
      'Gustar with singular/plural nouns and infinitives; me/te/le as experiencers; frequent reflexive/pronominal routines as supported patterns',
    objective: 'Express likes and describe getting ready in the morning',
    whenToUse:
      'Use this when talking about what you like and how you get ready each day. You can say that you like a food or activity and describe routines such as getting up, washing, and getting dressed.',
    systemIds: ['G05', 'G13'],
  },
  {
    id: 'A1-11',
    level: 'A1',
    title: 'Questions and negation',
    scope:
      'Yes/no and information questions; qué/cuál/quién/dónde/cómo/cuándo/cuánto/por qué; no before the verb; porque in replies; también/tampoco in simple exchanges',
    objective: 'Ask for missing information and negate a statement',
    whenToUse:
      'Use this when you need information, want to say something is not true, or agree with a negative statement. You can ask where something is, explain why, or say that you do not want it either.',
    systemIds: ['G01', 'G05'],
  },
  {
    id: 'A1-12',
    level: 'A1',
    title: 'Prepositions and adverbs',
    scope:
      'Basic a/de/en/con/sin/para; destination/origin/location; aquí/allí; common time and frequency expressions; common spatial phrases',
    objective: 'Say where something is and where someone is going',
    whenToUse:
      'Use this when giving a simple location, destination, or direction, or saying when something happens. These small words connect ideas such as being at home, going to school, and meeting after work.',
    systemIds: ['G11'],
  },
  {
    id: 'A1-13',
    level: 'A1',
    title: 'Infinitives and simple links',
    scope:
      'Querer/poder/necesitar + infinitive; useful obligation and intention formulas; y/o/pero; porque + clause; para + infinitive; supported simple que-relative descriptions',
    objective: 'Connect a need, intended action, and reason',
    whenToUse:
      'Use this when explaining what you want or need to do and giving a simple reason or purpose. You can connect short ideas, such as wanting to eat because you are hungry or studying to learn Spanish.',
    systemIds: ['G10', 'G12'],
  },
  {
    id: 'A1-14',
    level: 'A1',
    title: 'Grammatical writing support',
    scope:
      'Opening question/exclamation marks; capitals at sentence starts; accent distinctions such as él/el and tú/tu; personal names and complete short sentences',
    objective:
      'Write a short introduction that preserves person and sentence boundaries',
    whenToUse:
      'Use this when writing a short introduction, question, or message. Sentence boundaries, question marks, and meaningful accents help a reader distinguish words such as “you” and “your.”',
    systemIds: ['G15'],
  },
  {
    id: 'A2-01',
    level: 'A2',
    title: 'Noun-phrase expansion',
    scope:
      'Count/mass contrasts in practical use; frequent irregular genders/plurals; definite versus indefinite reference; basic generic article use; common zero-article patterns; feminine el agua with feminine adjective agreement',
    objective:
      'Ask for amounts and describe categories without copying English articles',
    whenToUse:
      'Use this when ordering food, asking for an amount, or describing a category of things. It helps you distinguish an item from a substance, choose articles naturally, and keep agreement in phrases such as “cold water.”',
    systemIds: ['G02', 'G03'],
  },
  {
    id: 'A2-02',
    level: 'A2',
    title: 'Determiners and quantifiers',
    scope:
      'Possessive forms such as mío/tuyo; neutral esto/eso/aquello; alguno/ninguno; algo/nada/alguien/nadie in useful frames; otro, cada, demasiado, bastante; numeral and determiner agreement; frequent ordinals',
    objective:
      'Express absence, alternatives, and sufficient or excessive quantity',
    whenToUse:
      'Use this when explaining what belongs to you, what is missing, or whether there is enough. You can talk about another option, each person, too many things, or nobody being available.',
    systemIds: ['G03', 'G05'],
  },
  {
    id: 'A2-03',
    level: 'A2',
    title: 'Comparison',
    scope:
      'Más/menos…que; tan…como; tanto…como; mejor/peor/mayor/menor in frequent meanings; relative superlative',
    objective: 'Compare two places and choose one with a reason',
    whenToUse:
      'Use this when choosing between restaurants, comparing apartments, or describing similarities. Say that one option is cheaper, as convenient as another, or the best of a group.',
    systemIds: ['G04'],
  },
  {
    id: 'A2-04',
    level: 'A2',
    title: 'Present-system consolidation',
    scope:
      'Frequent irregulars and spelling changes; reflexive routines across persons; present used for scheduled events; progressive estar + gerund; ordinary present versus current activity',
    objective: 'Describe what normally happens and what is happening now',
    whenToUse:
      'Use this when distinguishing a normal routine from something happening right now. You can explain that you usually work at home but are working in the office today, or mention a scheduled event.',
    systemIds: ['G07', 'G10', 'G13'],
  },
  {
    id: 'A2-05',
    level: 'A2',
    title: 'Preterite formation and events',
    scope:
      'Pretérito perfecto simple/indefinido; regular endings; common strong and irregular forms; accent contrasts; bounded completed events and sequences',
    objective: 'Report a short sequence of completed actions',
    whenToUse:
      'Use this when reporting completed actions and the steps of a past event. Describe what you bought, where you went, and what happened next, presenting each event as a completed whole.',
    systemIds: ['G07', 'G15'],
  },
  {
    id: 'A2-06',
    level: 'A2',
    title: 'Imperfect formation and background',
    scope:
      '-aba/-ía; ser/ir/ver; past descriptions, age/time/weather, habits; introductory distinction from completed events',
    objective: 'Describe childhood circumstances and a repeated routine',
    whenToUse:
      'Use this when describing childhood, an old home, or a past routine. The imperfect gives background—what life was like or what used to happen—without focusing on the situation’s beginning or end.',
    systemIds: ['G07'],
  },
  {
    id: 'A2-07',
    level: 'A2',
    title: 'Present perfect',
    scope:
      'Haber + regular/irregular participle; invariant participle in compound tenses; experience and past events linked to the present; regional perfect/preterite alternatives',
    objective:
      'Report an experience and understand both common regional renderings',
    whenToUse:
      'Use this when discussing experiences or past events connected to the present conversation. You can say you have visited a place or finished a task, while recognizing that speakers in different regions may choose a different past tense.',
    systemIds: ['G07', 'G10'],
  },
  {
    id: 'A2-08',
    level: 'A2',
    title: 'Plans, obligation, and ability',
    scope:
      'Ir a + infinitive; tener que/hay que; poder/saber + infinitive; common deber uses; me gustaría as a useful courtesy frame, without assuming full conditional control',
    objective: 'Explain a plan, requirement, and ability',
    whenToUse:
      'Use this when making plans, explaining responsibilities, or saying what you can do. Distinguish an intention, a requirement, and an ability, such as going to travel, having to work, and knowing how to swim.',
    systemIds: ['G10'],
  },
  {
    id: 'A2-09',
    level: 'A2',
    title: 'Direct objects',
    scope:
      'Lo/la/los/las; placement before finite verbs and attachment to infinitives or gerunds where permitted; personal a with frequent human objects; reference resolution',
    objective: 'Replace repeated object nouns without changing the referent',
    whenToUse:
      'Use this when referring back to something instead of repeating its name. After mentioning a ticket or some keys, you can say you have it, want to buy it, or cannot find them.',
    systemIds: ['G05', 'G11'],
  },
  {
    id: 'A2-10',
    level: 'A2',
    title: 'Indirect objects and experiencers',
    scope:
      'Me/te/le/nos/os/les; a + recipient; common doubling; gustar/encantar/doler and agreement with the grammatical subject',
    objective: 'Explain what hurts or interests someone; identify a recipient',
    whenToUse:
      'Use this when saying who receives something or who feels an effect. Explain that you gave someone a present, that something interests them, or that their head hurts.',
    systemIds: ['G05', 'G13'],
  },
  {
    id: 'A2-11',
    level: 'A2',
    title: 'Affirmative instructions',
    scope:
      'Affirmative command patterns for familiar and polite address; common irregulars; one attached pronoun; local vos/vosotros forms where applicable',
    objective:
      'Give a short route or set of instructions with consistent address',
    whenToUse:
      'Use this when giving someone a route, a recipe step, or a practical instruction. Choose forms that fit how you address the person, such as telling a friend to come in or asking a customer to wait.',
    systemIds: ['G09'],
  },
  {
    id: 'A2-12',
    level: 'A2',
    title: 'Place, duration, and prepositions',
    scope:
      'Desde/hasta; desde hace/hace…que; antes de/después de + infinitive; basic por versus para; frequent governed verb combinations; formation and use of common -mente adverbs',
    objective:
      'Say how long a situation has lasted and what happens before another action',
    whenToUse:
      'Use this when explaining where a journey begins and ends, how long you have lived somewhere, or what happens before another activity. It also helps distinguish common reasons, destinations, and purposes.',
    systemIds: ['G11'],
  },
  {
    id: 'A2-13',
    level: 'A2',
    title: 'Basic connected clauses',
    scope:
      'Restrictive que/donde; present factual/habitual cuando; real si + present with simple results; por eso/entonces; coordination and negative concord',
    objective:
      'Connect a short description, reason, result, and practical condition',
    whenToUse:
      'Use this when combining short sentences into a connected description or plan. Identify the person you mean, explain a result, or say what happens if a familiar condition is met.',
    systemIds: ['G01', 'G12'],
  },
  {
    id: 'A2-14',
    level: 'A2',
    title: 'State, existence, and change',
    scope:
      'Expanded ser/estar; event location with ser; hay versus está/están; impersonal weather and elapsed-time expressions; common result-state adjectives',
    objective: 'Explain where an event is and how a situation now stands',
    whenToUse:
      'Use this when explaining where an event takes place, what exists somewhere, or how a situation now stands. You can locate a concert, describe the weather, or say that a shop is closed.',
    systemIds: ['G06', 'G13'],
  },
  {
    id: 'A2-15',
    level: 'A2',
    title: 'Inflection and written clarity',
    scope:
      'Spelling changes in common verb forms; general written-stress rules, diphthong/hiatus support, and stress in past endings; basic accents with attached pronouns; punctuation in short connected texts',
    objective:
      'Distinguish hablo/habló and preserve agreement in a short message',
    whenToUse:
      'Use this when writing about past events or adding pronouns to instructions. Correct spelling and accents preserve distinctions such as “I speak” versus “he or she spoke” and make a connected message easier to read.',
    systemIds: ['G15'],
  },
  {
    id: 'B1-01',
    level: 'B1',
    title: 'Past-time contrasts',
    scope:
      'Preterite/imperfect as viewpoints; foreground/background; habitual versus bounded repetition; state verbs and meaning shifts; perfect/preterite with regional context',
    objective: 'Tell the same event as background and as a completed whole',
    whenToUse:
      'Use this when telling a story and deciding what counts as background versus an event that moves it forward. You can describe what was happening, what happened next, and how a different tense changes the viewpoint.',
    systemIds: ['G07'],
  },
  {
    id: 'B1-02',
    level: 'B1',
    title: 'Earlier past',
    scope:
      'Pluperfect indicative; participle system; anteriority to a past reference point; ya/todavía/no…aún without mechanical trigger rules',
    objective: 'Explain what had happened before arriving',
    whenToUse:
      'Use this when explaining what had happened before another past event. For example, describe arriving at a station after the train had left or discovering that someone had already finished a task.',
    systemIds: ['G07', 'G10'],
  },
  {
    id: 'B1-03',
    level: 'B1',
    title: 'Future simple',
    scope:
      'Regular/irregular stems; predictions and promises; contrast with ir a and scheduled present; introductory probability uses',
    objective:
      'Make a prediction and explain the intended degree of commitment',
    whenToUse:
      'Use this when making predictions, promises, or statements about what will happen. You also begin to use the future to suggest what is probably true now, rather than only to locate an event in the future.',
    systemIds: ['G07'],
  },
  {
    id: 'B1-04',
    level: 'B1',
    title: 'Conditional simple',
    scope:
      'Forms and irregular stems; advice, wishes and polite requests; initial future-from-past recognition; distinguish politeness from literal past time',
    objective: 'Give advice and make a tactful request',
    whenToUse:
      'Use this when giving advice, expressing a wish, or making a tactful request. You can say what you would do, what you would like, or what someone said would happen later.',
    systemIds: ['G07', 'G14'],
  },
  {
    id: 'B1-05',
    level: 'B1',
    title: 'Present subjunctive formation',
    scope:
      'Regular and irregular forms; stem/spelling changes; distinction between mood and time; present/future reference',
    objective:
      'Form an appropriate verb after a supplied communicative intention',
    whenToUse:
      'Use this when you need the correct verb form to express a wish, recommendation, or other meaning that calls for the present subjunctive. These forms can refer to a present situation or a future action.',
    systemIds: ['G08'],
  },
  {
    id: 'B1-06',
    level: 'B1',
    title: 'Common mood environments',
    scope:
      'Wishes, requests, influence, emotion, impersonal evaluation, doubt and negated belief; infinitive versus finite clause and subject reference; useful ojalá patterns',
    objective: 'Recommend an action to another person and express a reaction',
    whenToUse:
      'Use this when recommending that someone do something, reacting to an event, or expressing doubt or a wish. It helps you choose between saying what you want to do and what you want another person to do.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'B1-07',
    level: 'B1',
    title: 'Commands and pronouns',
    scope:
      'Negative commands; present-subjunctive relationship; reflexive commands; pronoun pairs; affirmative enclisis/negative proclisis; stress and accent repair',
    objective: 'Give and withdraw an instruction using pronouns',
    whenToUse:
      'Use this when giving or withdrawing an instruction involving people or objects already mentioned. You can say “give it to me” or “don’t tell them,” placing the pronouns correctly and keeping the intended addressee clear.',
    systemIds: ['G09', 'G05'],
  },
  {
    id: 'B1-08',
    level: 'B1',
    title: 'Combined objects',
    scope:
      'Indirect-before-direct sequence; le/les → se before lo/la/los/las; reference ambiguity; placement with permitted verb combinations; introductory doubling contrasts',
    objective:
      'Pass an object to a recipient and refer back to both accurately',
    whenToUse:
      'Use this when a message involves both a thing and its recipient. Instead of repeating “the book” and “María,” you can say that you gave it to her, while making clear whom the pronouns refer to.',
    systemIds: ['G05'],
  },
  {
    id: 'B1-09',
    level: 'B1',
    title: 'Aspectual and modal combinations',
    scope:
      'Soler; volver a; dejar de; empezar a; acabar de; seguir + gerund; common obligation/possibility contrasts; distinguish verb complements from periphrases',
    objective:
      'Explain a repeated, interrupted, recently completed, or continuing activity',
    whenToUse:
      'Use this when describing the stage of an activity: starting, stopping, continuing, repeating, or having just finished. These verb combinations also help you explain what someone can, should, or has to do.',
    systemIds: ['G10'],
  },
  {
    id: 'B1-10',
    level: 'B1',
    title: 'Conditional, temporal, and purpose clauses',
    scope:
      'Real si with present and future/command results; future-oriented temporal subjunctive in frequent frames; antes de que; para versus para que',
    objective: 'Make a plan with a condition, deadline, and purpose',
    whenToUse:
      'Use this when arranging plans with a condition, a deadline, or a purpose. You can explain what you will do if something happens, when you finish, or so that another person can take part.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'B1-11',
    level: 'B1',
    title: 'Relative clauses and indirect questions',
    scope:
      'Que/quien/donde; prepositions in common relatives; lo que; indirect qué/cómo/cuándo and si; introduce specificity contrasts in supported contexts',
    objective: 'Describe an unidentified item and report what someone asked',
    whenToUse:
      'Use this when identifying the person or thing you mean, describing something you are looking for, or reporting a question. Connect details naturally instead of repeating nouns or quoting every question directly.',
    systemIds: ['G05', 'G12'],
  },
  {
    id: 'B1-12',
    level: 'B1',
    title: 'Cause, consequence, and concession',
    scope:
      'Porque/como/ya que; por eso/así que; introductory factual aunque; pero versus sino; tan/tanto…que; expanded comparison',
    objective: 'Give a reason, acknowledge an obstacle, and state the outcome',
    whenToUse:
      'Use this when explaining a decision, acknowledging a difficulty, or correcting an alternative. You can link a cause to its result and distinguish “but” from a correction such as “not this, but that.”',
    systemIds: ['G12'],
  },
  {
    id: 'B1-13',
    level: 'B1',
    title: 'Impersonality and pronominal meanings',
    scope:
      'Impersonal haber/hacer; common impersonal and passive-reflexive se patterns; reflexive versus reciprocal; frequent ir/irse and quedar/quedarse contrasts',
    objective:
      'Explain a general practice and distinguish an event from an intentional action',
    whenToUse:
      'Use this when explaining what people generally do, describing an event without naming an actor, or distinguishing actions such as leaving from simply going somewhere. The meaning depends on the construction; se does not always mean “oneself.”',
    systemIds: ['G13'],
  },
  {
    id: 'B1-14',
    level: 'B1',
    title: 'Nominal and adjectival refinement',
    scope:
      'Buen/mal/gran; relative/absolute superlative; gender-sensitive meanings; reference with definite/indefinite/zero articles; possessive ambiguity and clarifying de phrases; fractions and common multiplicative/partitive quantity phrases',
    objective: 'Rewrite an ambiguous description so the referents are clear',
    whenToUse:
      'Use this when a description needs to be more precise: whose object it is, how good something is, or what portion you mean. It helps you remove ambiguity and use common shortened adjective forms naturally.',
    systemIds: ['G02', 'G03', 'G04'],
  },
  {
    id: 'B1-15',
    level: 'B1',
    title: 'Reporting and cohesion',
    scope:
      'Dijo que and common changes of person/place/time; present reporting; past narration links; reference chains; supported report of questions and instructions',
    objective:
      'Relay a short message accurately without copying the original speaker’s viewpoint',
    whenToUse:
      'Use this when passing on someone’s message or recounting a short conversation. Keep people, places, times, and references consistent so the listener can follow who said what and what happened next.',
    systemIds: ['G14'],
  },
  {
    id: 'B1-16',
    level: 'B1',
    title: 'Government and written structure',
    scope:
      'High-frequency verb/adjective + preposition patterns; por/para beyond translation equivalents; personal a refinement; accents in indirect questions; si/sí and qué/que; paragraph links',
    objective:
      'Write an explanation whose clauses and references remain easy to follow',
    whenToUse:
      'Use this when writing a connected explanation or choosing the small linking words a verb or adjective requires. Correct prepositions, accents, and paragraph links make your intended relationships easier to follow.',
    systemIds: ['G11', 'G15'],
  },
  {
    id: 'B2-01',
    level: 'B2',
    title: 'Integrated indicative system',
    scope:
      'All common simple/compound indicative forms; lexical aspect and narrative viewpoint; future perfect and conditional perfect; probability and future-from-past',
    objective:
      'Reconstruct a multi-stage timeline and express a justified conjecture',
    whenToUse:
      'Use this when explaining a sequence of events, making predictions, or describing what was expected to happen. Bring the indicative tenses together to show what had already happened, what will be finished by a deadline, or what probably happened.',
    systemIds: ['G07'],
  },
  {
    id: 'B2-02',
    level: 'B2',
    title: 'Imperfect subjunctive',
    scope:
      '-ra/-se paradigms; irregulars; past governing contexts; present/future hypothetical reference; courtesy uses',
    objective: 'Distinguish grammatical form from the time being imagined',
    whenToUse:
      'Use this when reporting a past wish or request, imagining an unlikely situation, or speaking tactfully. The imperfect subjunctive can describe a present or future possibility as well as fit a past reporting context.',
    systemIds: ['G08'],
  },
  {
    id: 'B2-03',
    level: 'B2',
    title: 'Perfect subjunctive forms',
    scope:
      'Haya + participle; hubiera/hubiese + participle; anteriority and completion; integration with present/past governing contexts',
    objective:
      'Contrast a desired action with a reaction to an already completed action',
    whenToUse:
      'Use this when a wish, doubt, or reaction concerns an action that is already completed relative to another point in time. Distinguish hoping someone arrives from hoping they have arrived, or wishing a past event had been different.',
    systemIds: ['G08', 'G10'],
  },
  {
    id: 'B2-04',
    level: 'B2',
    title: 'Conditional systems',
    scope:
      'Real/open, hypothetical present/future, counterfactual past; conditional perfect results; introductory mixed-time conditions; unless/provided-that alternatives',
    objective: 'Explain an unreal past and its possible present consequence',
    whenToUse:
      'Use this when exploring possible outcomes, imagining a different past, or explaining how a past decision affects the present. Make clear whether a condition is open, hypothetical, or contrary to what actually happened.',
    systemIds: ['G07', 'G08', 'G12'],
  },
  {
    id: 'B2-05',
    level: 'B2',
    title: 'Noun-clause mood selection',
    scope:
      'Assertion versus nonassertion; certainty, doubt, negation, evaluation and reported requests; subordinate subjects; stance-sensitive alternations',
    objective:
      'Choose mood to preserve the speaker’s intended claim rather than a trigger list',
    whenToUse:
      'Use this when expressing a belief, denying a claim, evaluating a situation, or reporting a request. Mood choice helps preserve whether you are asserting information, questioning it, or presenting it through someone’s wishes or judgment.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'B2-06',
    level: 'B2',
    title: 'Relative-clause mood and structure',
    scope:
      'Identified versus sought/denied referents; restrictive/nonrestrictive; preposition + relative; el que/el cual/quien; lo que/lo cual',
    objective: 'Specify exactly which people or objects a claim applies to',
    whenToUse:
      'Use this when identifying a specific person or thing, searching for one that meets a requirement, or adding information about it. The construction helps distinguish a known translator from any translator who could do the job.',
    systemIds: ['G05', 'G08', 'G12'],
  },
  {
    id: 'B2-07',
    level: 'B2',
    title: 'Adverbial-clause systems',
    scope:
      'Temporal, place, manner, purpose, condition, concession, cause, consequence, comparison; cuando/mientras/hasta que, donde/adonde, como/según/sin que; construction-specific mood constraints',
    objective:
      'Link the same proposition to different logical relations without changing facts',
    whenToUse:
      'Use this when explaining when, where, how, why, or under what circumstances something happens. Build connected plans and arguments whose clauses make the intended time, purpose, condition, or consequence clear.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'B2-08',
    level: 'B2',
    title: 'Concession and contrast',
    scope:
      'Aunque + indicative/subjunctive; known versus hypothetical or backgrounded information; a pesar de (que); por mucho que; sino/sino que',
    objective:
      'Distinguish “although this is so” from “even if this is so” in a supplied context',
    whenToUse:
      'Use this when acknowledging an obstacle while maintaining your main point. You can distinguish discussing an actual difficulty from allowing for a possible one, or treating known information as background rather than asserting it again.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'B2-09',
    level: 'B2',
    title: 'Reported speech and tense sequence',
    scope:
      'Statements/questions/requests; shifts in person and deixis; anteriority/simultaneity/posteriority; reporting still-valid information without automatic backshift',
    objective:
      'Relay a past conversation while preserving what is current and what was only true then',
    whenToUse:
      'Use this when relaying a conversation, meeting, or request after the event. Adjust the speaker’s perspective while preserving what happened earlier, what was expected later, and which information is still true now.',
    systemIds: ['G07', 'G14'],
  },
  {
    id: 'B2-10',
    level: 'B2',
    title: 'Passive, impersonal, and middle constructions',
    scope:
      'Ser + agreeing participle; por-agent; estar + result state; passive-reflexive versus impersonal se; anticausative/pronominal contrasts',
    objective: 'Reframe an event with the agent prominent, omitted, or unknown',
    whenToUse:
      'Use this when the event or its result matters more than naming the person responsible. Describe how something is made, what happened to a document, or a general procedure while distinguishing an action from its resulting state.',
    systemIds: ['G06', 'G13'],
  },
  {
    id: 'B2-11',
    level: 'B2',
    title: 'Clitics, affected participants, and variation',
    scope:
      'Doubling and placement restrictions; tonic reinforcement; affected possessor/experiencer; se me cayó; introduce leísmo and distinguish accepted usage from unsupported generalization',
    objective:
      'Explain who was affected without falsely making that person the agent',
    whenToUse:
      'Use this when explaining who was affected by an event, especially accidents, experiences, or possession. You can describe dropping something or having something happen to you, while recognizing legitimate regional pronoun patterns.',
    systemIds: ['G05', 'G13'],
  },
  {
    id: 'B2-12',
    level: 'B2',
    title: 'Copulas and change of state',
    scope:
      'Ser/estar + meaning-sensitive adjectives; ponerse/quedarse/volverse/hacerse/llegar a ser; event location and result states revisited',
    objective:
      'Describe a temporary reaction, lasting transformation, and acquired role',
    whenToUse:
      'Use this when describing how a person or situation changes. Distinguish becoming nervous, ending up alone, developing a lasting characteristic, or acquiring a professional role instead of translating every change with one verb.',
    systemIds: ['G06'],
  },
  {
    id: 'B2-13',
    level: 'B2',
    title: 'Nonfinite syntax and periphrases',
    scope:
      'Infinitive clauses; perfect infinitive; gerund time/subject relations; participles; llevar/ir/venir + gerund; epistemic possibility/inference versus deontic permission/obligation; perception/causative patterns',
    objective:
      'Reformulate a sentence without losing its subject or temporal relation',
    whenToUse:
      'Use this when connecting actions more compactly or showing how they develop over time. Describe an activity that keeps going, has been continuing for a period, or changes gradually, while keeping the actor and timing clear.',
    systemIds: ['G10'],
  },
  {
    id: 'B2-14',
    level: 'B2',
    title: 'Determination, agreement, and scope',
    scope:
      'Specific/generic reference; article omission; neutral lo; quantifier scope; cualquier/cualquiera, ambos, demás; más de versus más que in quantity/comparison; adjective-position meaning; collectives and more complex agreement; noun/adjective complements',
    objective: 'Explain a meaning difference caused by position or scope',
    whenToUse:
      'Use this when small wording choices change which people, things, or quantities you mean. Clarify whether a statement is general or specific, how much is included, and whether adjective position changes the description.',
    systemIds: ['G02', 'G03', 'G04'],
  },
  {
    id: 'B2-15',
    level: 'B2',
    title: 'Focus, negation, and information order',
    scope:
      'Topic fronting and resumptive clitics; common focus frames; negative concord; contrastive negation; information-bearing word order; ellipsis in coordination',
    objective:
      'Correct an assumption while emphasizing only the relevant information',
    whenToUse:
      'Use this when correcting an assumption or drawing attention to a particular person, action, or contrast. Reorder information and use pronouns or negation to make the important part of your message stand out clearly.',
    systemIds: ['G01', 'G05', 'G14'],
  },
  {
    id: 'B2-16',
    level: 'B2',
    title: 'Prepositional accuracy and cohesive writing',
    scope:
      'Required prepositions before que; queísmo/dequeísmo in frequent patterns; connectors and punctuation; sino/si no, porque/por qué/porqué, aun/aún; reporting sources; parallel structures',
    objective:
      'Edit a reasoned account for clause connection and reference, not just verb endings',
    whenToUse:
      'Use this when writing an explanation, argument, or report that needs clear links between ideas. Choose required prepositions and connectors, distinguish similar written forms, and make sources and contrasting claims easy to follow.',
    systemIds: ['G11', 'G14', 'G15'],
  },
  {
    id: 'C1-01',
    level: 'C1',
    title: 'Mood as interpretation',
    scope:
      'Alternations under negation, perception, communication, evaluation and concession; presupposed versus asserted content; denial of an explanation versus denial of an event',
    objective: 'Explain how changing mood changes the speaker’s position',
    whenToUse:
      'Use this when expressing a careful position on someone’s claim or on an explanation for an event. Changing mood can alter what you assert, accept as background, question, or reject, even when the basic event stays the same.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'C1-02',
    level: 'C1',
    title: 'Temporal and aspectual perspective',
    scope:
      'Narrative/historical present; imperfect of politeness, intention, surprise and distancing; layered anteriority; modal future/conditional; consistent reference points',
    objective:
      'Retell an event from a different viewpoint while preserving chronology',
    whenToUse:
      'Use this when retelling events from a particular viewpoint or using tense to convey politeness, surprise, or distance. Keep the chronology clear while shifting how close, immediate, or tentative the account feels.',
    systemIds: ['G07', 'G14'],
  },
  {
    id: 'C1-03',
    level: 'C1',
    title: 'Advanced conditions and concessions',
    scope:
      'Mixed temporal relations; de + infinitive/perfect infinitive; como si; a no ser que/con tal de que; concessive degrees and open alternatives',
    objective:
      'Express a qualified exception or counterfactual without an ambiguous timeline',
    whenToUse:
      'Use this when qualifying an argument with exceptions or imagining a past event with a present consequence. Express what would hold under particular conditions, what could prevent it, and which obstacles would not change your conclusion.',
    systemIds: ['G08', 'G12'],
  },
  {
    id: 'C1-04',
    level: 'C1',
    title: 'Relative systems and possession',
    scope:
      'Cuyo agreement with the possessed noun; prepositional relatives; free relatives including quien and cuanto families; whole-clause reference; restrictive/nonrestrictive interpretation; avoid ambiguity in long antecedents',
    objective: 'Compress linked facts into a precise relative construction',
    whenToUse:
      'Use this when combining several facts about people, possessions, or ideas into precise sentences. Relative constructions help identify the right referent, show a relationship with cuyo, and avoid ambiguity in longer descriptions.',
    systemIds: ['G04', 'G05', 'G12'],
  },
  {
    id: 'C1-05',
    level: 'C1',
    title: 'Information packaging',
    scope:
      'Topic versus contrastive focus; cleft/pseudocleft structures; resumptive pronouns; left/right dislocation; emphasis and the limits of flexible word order',
    objective:
      'Give three grammatical versions of one message with different focal information',
    whenToUse:
      'Use this when your listener already knows part of the story and you need to emphasize what is new or disputed. Present the same facts with attention on the person, the action, or the thing being corrected.',
    systemIds: ['G01', 'G14'],
  },
  {
    id: 'C1-06',
    level: 'C1',
    title: 'Nominalization and abstract reference',
    scope:
      'Infinitival and deverbal nominalization; dense noun phrases; neutral lo and reference with ello; el de/la de ellipsis; modification and ambiguous attachment',
    objective:
      'Turn a spoken explanation into concise formal prose without obscuring agency',
    whenToUse:
      'Use this when turning a spoken explanation into a formal report or discussing actions as abstract ideas. Build compact noun phrases while keeping clear who is responsible and what each modifier describes.',
    systemIds: ['G02', 'G03'],
  },
  {
    id: 'C1-07',
    level: 'C1',
    title: 'Agreement and determination edge cases',
    scope:
      'Partitives/collectives and coordinated subjects; title/apposition agreement; semantic gender; article use with proper names and abstract/generic nouns; demonstrative reference in discourse',
    objective:
      'Edit complex agreement while recognizing documented alternatives',
    whenToUse:
      'Use this when editing sentences with groups, proportions, coordinated subjects, or complex references. Choose agreement and articles that fit the intended meaning, while recognizing cases where more than one form is accepted.',
    systemIds: ['G02', 'G03'],
  },
  {
    id: 'C1-08',
    level: 'C1',
    title: 'Adjectives, degree, and predication',
    scope:
      'Relational versus qualifying readings; prenominal evaluation; predicative complements; irregular degree forms; adjectival/adverbial uses',
    objective:
      'Distinguish a property, evaluation, and state accompanying an action',
    whenToUse:
      'Use this when a description needs to distinguish a category from an opinion or a quality from a state during an action. Adjective choice and position help express evaluation, degree, and more precise relationships.',
    systemIds: ['G04'],
  },
  {
    id: 'C1-09',
    level: 'C1',
    title: 'Nonfinite compression',
    scope:
      'Absolute participle and gerund clauses; perfect infinitives/gerunds; subject control; temporal, causal and concessive readings; limits on dangling or misleading modifiers',
    objective:
      'Compress clauses, then expand them again with the original meaning intact',
    whenToUse:
      'Use this when shortening a report or linking actions without repeating full clauses. Infinitive, gerund, and participle constructions can convey timing or cause, provided the reader can still identify who performs each action.',
    systemIds: ['G10'],
  },
  {
    id: 'C1-10',
    level: 'C1',
    title: 'Voice, valency, and participant structure',
    scope:
      'Causative/anticausative alternations; passive choice by genre; pronominal lexical changes; datives of involvement; impersonal agency',
    objective:
      'Change the information focus without incorrectly changing who did what',
    whenToUse:
      'Use this when choosing whether to foreground an actor, an affected person, or an event itself. Describe responsibility and involvement accurately when changing between active, passive, impersonal, and pronominal constructions.',
    systemIds: ['G13'],
  },
  {
    id: 'C1-11',
    level: 'C1',
    title: 'Government and complementation',
    scope:
      'Noun/adjective/verb complements; finite versus nonfinite alternatives; queísmo/dequeísmo and accepted competing patterns; coordination of differently governed complements',
    objective:
      'Repair genuinely defective complementation without overcorrecting valid variation',
    whenToUse:
      'Use this when a complex sentence combines words that require different complements or prepositions. Keep the links between verbs, nouns, adjectives, and their clauses correct without replacing a valid regional or stylistic alternative unnecessarily.',
    systemIds: ['G11', 'G12'],
  },
  {
    id: 'C1-12',
    level: 'C1',
    title: 'Attribution and reported stance',
    scope:
      'Extended reported discourse; attribution and evidential distance; perspective shifts; indirect questions embedded in complex argument; introduction to free indirect discourse in reading',
    objective: 'Distinguish the writer’s claim from the claim being reported',
    whenToUse:
      'Use this when reporting an extended discussion, summarizing sources, or separating someone else’s claim from your own position. Track whose viewpoint is being represented and how strongly the writer commits to the reported information.',
    systemIds: ['G14'],
  },
  {
    id: 'C1-13',
    level: 'C1',
    title: 'Scope, cohesion, and ellipsis',
    scope:
      'Negation and quantifier scope; focus particles; connector contrasts; recoverable omitted material; parallelism; cohesive reference across paragraphs',
    objective: 'Remove ambiguity in a multi-paragraph explanation',
    whenToUse:
      'Use this when a longer explanation could leave readers unsure what is denied, quantified, or referred to. Control linking expressions and omitted information so the argument remains clear across sentences and paragraphs.',
    systemIds: ['G01', 'G03', 'G14'],
  },
  {
    id: 'C1-14',
    level: 'C1',
    title: 'Register and pragmatic grammar',
    scope:
      'Requests and mitigating tense; directive force; grammatical emphasis; colloquial versus formal syntax; regional person/clitic/tense choices; word formation with evaluative force',
    objective:
      'Adapt one message for a friend, colleague, and formal recipient',
    whenToUse:
      'Use this when adapting the same message for a friend, colleague, or formal recipient. Adjust requests, emphasis, and sentence structure to the relationship and setting while recognizing regional ways of expressing the same intention.',
    systemIds: ['G09', 'G14', 'G15'],
  },
  {
    id: 'C2-01',
    level: 'C2',
    title: 'Fine mood alternations',
    scope:
      'Lexically sensitive indicative/subjunctive changes; assertion, accommodation and distancing; mood under scope ambiguity; meanings not captured by a simple certainty/doubt rule',
    objective: 'Explain and reproduce a subtle shift of stance in context',
    whenToUse:
      'Use this when a small change in mood subtly changes your stance toward a claim. In complex argument or close reading, distinguish what a speaker presents as their own assertion, accepts for discussion, or keeps at a distance.',
    systemIds: ['G08'],
  },
  {
    id: 'C2-02',
    level: 'C2',
    title: 'Pragmatic tense and aspect',
    scope:
      'Rhetorical future/conditional; surprise, rejection and conjecture; narrative imperfect; reportative conditional; nonliteral tense substitution with register constraints',
    objective: 'Distinguish literal time from a speaker’s rhetorical purpose',
    whenToUse:
      'Use this when tense expresses more than time, such as disbelief, surprise, conjecture, or distance from a report. Interpret the speaker’s rhetorical purpose and choose a form suited to the context and register.',
    systemIds: ['G07', 'G14'],
  },
  {
    id: 'C2-03',
    level: 'C2',
    title: 'Open and elliptical clause patterns',
    scope:
      'Repeated-subjunctive concessions; unrestricted relatives; conditions/concessions without canonical connectors; recoverable ellipsis; multiple plausible analyses',
    objective:
      'Expand a compressed construction and identify its implied relationship',
    whenToUse:
      'Use this when keeping a conclusion valid across open alternatives or understanding a compressed condition or concession. You can express “whatever happens” and recover relationships that a speaker leaves partly unstated.',
    systemIds: ['G08', 'G12', 'G14'],
  },
  {
    id: 'C2-04',
    level: 'C2',
    title: 'Marked order and expressive syntax',
    scope:
      'Stylistic inversion; fronting with and without clitic resumption under different information structures; fragments; repetition; deliberate parallelism and nonparallelism',
    objective:
      'Reformulate for emphasis while separating marked grammar from error',
    whenToUse:
      'Use this when shaping a speech, literary passage, or emphatic response through unusual word order, fragments, or repetition. Make deliberate stylistic choices while distinguishing an expressive construction from an unintended grammatical error.',
    systemIds: ['G01', 'G14'],
  },
  {
    id: 'C2-05',
    level: 'C2',
    title: 'Advanced reference and scope',
    scope:
      'Ambiguous anaphora, quantifier/negation interactions, reference to propositions, complex embedding, pragmatic interpretation of determiners',
    objective:
      'Identify more than one legitimate reading and rewrite to select one',
    whenToUse:
      'Use this when a dense passage supports more than one interpretation of who, what, or how much is involved. Identify competing readings and rewrite the reference, negation, or quantity expression to select the intended one.',
    systemIds: ['G03', 'G05', 'G14'],
  },
  {
    id: 'C2-06',
    level: 'C2',
    title: 'Nominal and adjectival nuance',
    scope:
      'Expressive determiner use; noun-class shifts; subtle adjective placement; productive prefixes/suffixes and evaluative morphology; complex and lexicalized agreement; marked distributives such as sendos as needed',
    objective: 'Preserve connotation and register when editing a dense passage',
    whenToUse:
      'Use this when editing a description whose connotations matter as much as its literal meaning. Fine choices in articles, adjective position, word formation, and agreement can preserve evaluation, tone, and a particular sense of a noun.',
    systemIds: ['G02', 'G03', 'G04', 'G15'],
  },
  {
    id: 'C2-07',
    level: 'C2',
    title: 'Valency, clitics, and regional syntax',
    scope:
      'Fine differences in argument realization, clitic presence, affected participants and pronominal verbs; documented pan-Hispanic variants; social and stylistic distribution',
    objective:
      'Describe a regional option accurately without presenting it as universally interchangeable',
    whenToUse:
      'Use this when interpreting or adapting Spanish across regions, social settings, and styles. Understand how pronouns and verb patterns assign roles or involvement, and decide whether a documented regional form fits the intended audience.',
    systemIds: ['G05', 'G11', 'G13'],
  },
  {
    id: 'C2-08',
    level: 'C2',
    title: 'Nonfinite and formal compression',
    scope:
      'Closely integrated infinitive/gerund/participle constructions; nominal versus verbal readings; complex periphrastic combinations; interpretation of implicit subjects',
    objective:
      'Produce concise formal prose that retains explicit logical relations',
    whenToUse:
      'Use this when producing concise formal prose with several connected actions or abstract ideas. Compress the wording while preserving the implied subjects, sequence of events, and logical relationships that a fuller version makes explicit.',
    systemIds: ['G10'],
  },
  {
    id: 'C2-09',
    level: 'C2',
    title: 'Voice, reporting, and rhetorical agency',
    scope:
      'Fine control of active/passive/impersonal choice; free indirect discourse; reported language and responsibility; layered quotation and distancing',
    objective:
      'Track whose words, thoughts, and commitments a complex passage represents',
    whenToUse:
      'Use this when analyzing or writing accounts with several voices, quoted claims, or an unclear source of responsibility. Distinguish the narrator’s position from a speaker’s words or thoughts and control how agency is presented.',
    systemIds: ['G13', 'G14'],
  },
  {
    id: 'C2-10',
    level: 'C2',
    title: 'Grammar of interpersonal meaning',
    scope:
      'Irony and echo; indirect directives; exclamative and interrogative force; discourse-particle interaction; emphatic and concessive command uses',
    objective:
      'Respond appropriately to a grammatical sentence whose literal reading is misleading',
    whenToUse:
      'Use this when the intended message differs from the literal sentence, as in irony, an echoed objection, or an indirect request. Interpret the relationship and tone before deciding how to respond or reformulate the message.',
    systemIds: ['G09', 'G14'],
  },
  {
    id: 'C2-11',
    level: 'C2',
    title: 'Specialist and historical recognition',
    scope:
      'Pretérito anterior; future subjunctive simple/compound; fossilized legal/administrative formulas; literary -ra uses; archaic pronoun placement in selected texts',
    objective:
      'Recognize and paraphrase into contemporary Spanish; production only for a relevant specialist goal',
    whenToUse:
      'Use this when reading older literature, legal formulas, or specialist documents containing uncommon verb forms or pronoun patterns. Recognize their meaning and paraphrase them in contemporary Spanish; use them actively only when the specialist task calls for it.',
    systemIds: ['G07', 'G08', 'G15'],
  },
  {
    id: 'C2-12',
    level: 'C2',
    title: 'Integrated editing and reformulation',
    scope:
      'Accuracy under cognitive load; eliminate ambiguity; preserve intended stylistic effects; distinguish error, optional improvement, regional variant, and deliberate deviation',
    objective:
      'Edit a demanding text and justify only the changes that are warranted',
    whenToUse:
      'Use this when reviewing demanding writing for accuracy, clarity, and a consistent voice. Resolve unintended ambiguity while preserving meaningful stylistic effects, accepted regional usage, and the author’s intended degree of emphasis.',
    systemIds: ['G14', 'G15'],
  },
];
