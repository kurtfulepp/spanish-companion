# Spanish grammar curriculum and experience plan

**Project:** KurtES / Spanish Companion\
**Scope:** A1, A2, B1, B2, C1, C2\
**Status:** Owner-adopted curriculum and build standard for the whole app; prepared for teacher review, not independently teacher-approved\
**Prepared:** 7 September 2026

## 1. What this plan establishes

The product owner adopted this complete plan on 7 September 2026 as the educational foundation for all KurtES learning areas. The [educational rubric](educational-rubric.md) defines its application across Vocabulary, Grammar, Conversation, assessment, guided lessons, and generated practice. Adoption establishes the product standard; it does not mark planned modules as implemented or independently reviewed.

Build Grammar around a cumulative map of grammatical systems, rules, and uses. A learner should be able to answer three questions: **What do I need at my level? What can I already use? What should I practice next?**

The plan contains 87 planned teaching modules, a complete inventory of the principal verb forms, the major word and sentence categories, recurring contrasts, assessment requirements, and a staged implementation plan. A module is a curriculum container, not a single lesson or a four-question quiz. Each module must be divided into separately assessable rule objectives.

“Complete” here means coverage of the key systems of contemporary Spanish through C2, with a place for significant exceptions, regional alternatives, and specialist recognition. It does not mean enumerating every lexical restriction, historical construction, or disputed analysis in an academic reference grammar. Those belong in the linked reference layer.

The existing 18 lessons are an interaction prototype and a small content sample. They must not be described as complete coverage of any level.

| Level | Planned modules | Main progression                                                        |
| ----- | ---------------- | ----------------------------------------------------------------------- |
| A1    | 14               | Build basic phrases, statements and questions                           |
| A2    | 15               | Expand everyday exchanges, instructions and past reference              |
| B1    | 16               | Connect narration, plans, recommendations and common complex clauses    |
| B2    | 16               | Integrate modern tense/mood systems, complex clauses and perspective    |
| C1    | 14               | Control stance, information structure and register in extended language |
| C2    | 12               | Sustain precision, interpret nuance, and reformulate demanding language |

## 2. Academic basis and interpretation of levels

Use three complementary authorities:

| Authority                                                          | What it establishes                                               | What it does not establish                                        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------- |
| Council of Europe, CEFR                                            | Communicative proficiency and the quality of language control     | A universal Spanish grammar checklist or a grammar-quiz pass mark |
| Instituto Cervantes, Plan curricular (PCIC)                        | Spanish-specific level inventories and a basis for sequencing     | A ready-made course that can be copied directly into an app       |
| RAE–ASALE, reference grammar and Diccionario panhispánico de dudas | Forms, constructions, accepted usage, restrictions, and variation | The level at which every learner must first encounter a form      |

The CEFR is language-independent; language-specific reference descriptions supply the detail. A learner’s grammatical range and accuracy are only part of a proficiency profile. [Council of Europe: reference level descriptions](https://www.coe.int/en/web/common-european-framework-reference-languages/reference-level-descriptions), [qualitative aspects of spoken language](https://www.coe.int/en/web/common-european-framework-reference-languages/table-3-cefr-3.3-common-reference-levels-qualitative-aspects-of-spoken-language-use).

PCIC requires curricular adaptation. Its grammar inventory sometimes systematizes uses that learners have already encountered as communicative formulas. Its columns are cumulative: material absent from a later column has not ceased to matter. Its original reference variety is principally central/northern peninsular Spanish, with other varieties documented. KurtES should deliberately support a broader pan-Hispanic learning experience. [PCIC general introduction](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/introduccion.htm).

**The modules below are the owner's adopted KurtES teaching plan informed by those references. Module boundaries, practice tasks, prerequisite paths, and product states are product decisions rather than official Cervantes requirements.** The plan is organized for teaching and implementation rather than reproducing the PCIC inventory. Exact item citations and any intentional level deviations must be recorded during rule authoring.

### Four distinct expectations

| Expectation       | What “know it” means                                     | Evidence                                              |
| ----------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| Recognize         | Interpret the form in an appropriate context             | Identify who acted, when, or what the speaker implies |
| Form              | Produce the required morphology or construction          | Supply a verb form, agreement, or pronoun sequence    |
| Choose            | Select a construction for an intended meaning            | Distinguish two grammatical alternatives in context   |
| Use independently | Produce it without a supplied answer and retain it later | An original response plus a later, unseen task        |

A fifth dimension, **register and variety**, accompanies these expectations. It is not a ladder on which one region’s Spanish is more advanced than another’s.

All levels include continued control of earlier material. A fixed expression can appear before its full grammatical analysis. General command of a rule should never be inferred from repeating that expression.

## 3. Stable grammar taxonomy

These are the persistent systems behind the interface. They should remain stable even when modules or lesson titles change.

| ID  | System                                | Required rule families                                                                                                                                                                 |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G01 | Sentence foundations                  | Word classes versus functions; subject and predicate; omitted subjects; person and agreement; neutral and marked word order; statements, questions, exclamations, directives; negation |
| G02 | Nouns and noun phrases                | Common/proper; count/mass; concrete/abstract; individual/collective; gender, number, exceptions; noun complements; nominalization and ellipsis                                         |
| G03 | Articles and determiners              | Definite/indefinite/zero article; reference and specificity; demonstratives; possessives; numerals; distributives and quantifiers; agreement and ordering                              |
| G04 | Adjectives and comparison             | Qualifying/relational; agreement; position and meaning; apocope; comparative and superlative; attributive and predicative functions                                                    |
| G05 | Pronouns and reference                | Subject and prepositional forms; direct/indirect objects; clitics; doubling; reflexive/reciprocal; possessive/demonstrative/indefinite; interrogative and relative reference           |
| G06 | Copulas and existence                 | Ser, estar, haber; identity, properties, state, location, events, existence; predicative complements; change-of-state verbs                                                            |
| G07 | Indicative tense and aspect           | Present, past, future, conditional; simple and compound forms; viewpoint and temporal relations; lexical aspect; non-temporal uses                                                     |
| G08 | Subjunctive and mood choice           | Morphology; complement clauses; assertion, desire, evaluation, doubt; relative and adverbial clauses; time relations; mood alternations                                                |
| G09 | Commands and directives               | Affirmative and negative commands; address forms; clitic placement; requests, instructions, invitations, prohibitions; directive alternatives                                          |
| G10 | Nonfinite forms and verb combinations | Infinitives, gerunds, participles; verbal versus adjectival uses; auxiliaries; modal/aspectual periphrases; causative and perception constructions                                     |
| G11 | Adverbs, prepositions, and government | Place/time/manner/degree; scope; prepositional phrases; required complements; personal a; por/para; duration; idiomatic combinations                                                   |
| G12 | Coordination and subordination        | Addition, alternatives, contrast; noun, relative, and adverbial clauses; temporal, locative, modal, causal, purpose, condition, concession, consequence, comparison                    |
| G13 | Voice, valency, and se                | Transitive/intransitive patterns; active/passive; impersonal predicates; reflexive, reciprocal, pronominal, middle/anticausative, passive and impersonal se; affected participants     |
| G14 | Grammar in discourse                  | Reporting; tense sequence; anaphora; topic/focus; information packaging; ellipsis; cohesion; stance, politeness, emphasis, register, and grammatical variation                         |
| G15 | Written-form and morphology support   | Stress and accents where they distinguish grammar; spelling changes in inflection; contractions; word formation; punctuation that marks clause structure or meaning                    |

G15 supports grammar; a complete pronunciation or spelling course remains a separate responsibility. Word formation is included where it changes grammatical behavior or aids systematic recognition; it is not a substitute for vocabulary learning.

The taxonomy provides coverage checks against word classes, phrases, verb systems, and sentence constructions. Academic descriptions can categorize individual constructions differently; internal cross-tags should preserve those relationships. [RAE–ASALE: reference grammar contents](https://www.rae.es/sites/default/files/Indice_de_contenidos_Manual_Nueva_gramatica_de_la_lengua_espanola.pdf).

## 4. A1 — Construct basic personal and everyday sentences

**Exit expectation:** Understand and produce short, familiar statements and questions about identity, people, possessions, places, preferences, and routines. Production is limited and may require support. Errors do not mean the learner has failed A1 as a whole.

| Module                                  | Rules and types to teach                                                                                                                                                                 | Evidence of learning                                                     | When you use it |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --- |
| A1-01 Sentence building                 | Subject, verb, object/complement; singular/plural persons; basic subject–verb agreement; ordinary subject omission; no English-style do-support                                          | Introduce oneself and ask another person a basic question                | Use this when introducing yourself, saying what someone does, or asking a simple question. It helps you put the person, action, and other information together in a short Spanish sentence. |
| A1-02 Noun gender and number            | Common masculine/feminine patterns; learn nouns with articles; regular plurals; frequent exceptions; grammatical gender versus a person’s gender                                         | Describe one object and several objects with consistent agreement        | Use this when naming objects or talking about one thing versus several. Knowing a noun’s gender and plural form helps you choose matching articles and descriptions, such as a book or several small houses. |
| A1-03 Articles                          | El/la/los/las; un/una/unos/unas; basic reference; al/del; introductory omission with unmodified professions after ser                                                                    | Identify an object, then refer to it again                               | Use this when introducing something new or referring to something your listener already knows. Articles help distinguish “a restaurant” from “the restaurant” and make phrases about places and professions sound natural. |
| A1-04 Adjectives                        | Gender/number agreement; common invariable-gender adjectives; ordinary post-noun position; muy versus mucho in frequent frames                                                           | Describe a person and an object                                          | Use this when describing people, places, and things: a small room, a friendly person, or two red bags. Match the description to the noun and say how strong a quality is. |
| A1-05 Demonstratives and possession     | Este/ese/aquel families in concrete reference; mi/tu/su/nuestro; agreement with the possessed noun; de + possessor                                                                       | Identify whose belongings are being discussed                            | Use this when pointing something out or explaining whose it is. You can distinguish this bag from that one and say “my keys,” “our house,” or “Ana’s phone.” |
| A1-06 Quantity and number               | Cardinal numbers; basic agreement with uno/un/una; mucho/poco; todo in common frames; age, price, dates and time expressions                                                             | State quantities and distinguish one from several                        | Use this when shopping, giving your age, arranging a time, or saying how much you need. Numbers and quantity words let you discuss prices, dates, and amounts such as one ticket or a little water. |
| A1-07 People and pronouns               | Yo/tú/él/ella/nosotros; usted/ustedes; recognition of vosotros and vos; explicit versus omitted subject; basic prepositional forms in useful expressions                                 | Keep the addressee and verb person consistent                            | Use this when choosing how to address someone and making clear who you are talking about. It helps you keep “I,” “you,” and “they” consistent with the verb and recognize different regional ways of saying “you.” |
| A1-08 Present indicative                | Regular -ar/-er/-ir patterns; common irregulars and stem changes; ser, estar, tener, ir, hacer, querer, poder and other frequent verbs; habitual and current reference                   | Describe a simple routine without a supplied conjugation                 | Use this when describing your routine, saying what you want, or explaining what you do. Present-tense verbs let you talk about familiar activities such as working, eating, living somewhere, or going to class. |
| A1-09 Ser, estar, hay, tener            | Identity, origin, profession and basic characteristics; location and state, including familiar participial adjectives; existence with hay; age/possession and frequent tener expressions | Distinguish existence from location in a room description                | Use this when introducing yourself, describing a room, or saying how someone feels. Choose the construction that fits identity, location, existence, age, or possession—for example, “there is a café” versus “the café is here.” |
| A1-10 Preferences and everyday routines | Gustar with singular/plural nouns and infinitives; me/te/le as experiencers; frequent reflexive/pronominal routines as supported patterns                                                | Express likes and describe getting ready in the morning                  | Use this when talking about what you like and how you get ready each day. You can say that you like a food or activity and describe routines such as getting up, washing, and getting dressed. |
| A1-11 Questions and negation            | Yes/no and information questions; qué/cuál/quién/dónde/cómo/cuándo/cuánto/por qué; no before the verb; porque in replies; también/tampoco in simple exchanges                            | Ask for missing information and negate a statement                       | Use this when you need information, want to say something is not true, or agree with a negative statement. You can ask where something is, explain why, or say that you do not want it either. |
| A1-12 Prepositions and adverbs          | Basic a/de/en/con/sin/para; destination/origin/location; aquí/allí; common time and frequency expressions; common spatial phrases                                                        | Say where something is and where someone is going                        | Use this when giving a simple location, destination, or direction, or saying when something happens. These small words connect ideas such as being at home, going to school, and meeting after work. |
| A1-13 Infinitives and simple links      | Querer/poder/necesitar + infinitive; useful obligation and intention formulas; y/o/pero; porque + clause; para + infinitive; supported simple que-relative descriptions                  | Connect a need, intended action, and reason                              | Use this when explaining what you want or need to do and giving a simple reason or purpose. You can connect short ideas, such as wanting to eat because you are hungry or studying to learn Spanish. |
| A1-14 Grammatical writing support       | Opening question/exclamation marks; capitals at sentence starts; accent distinctions such as él/el and tú/tu; personal names and complete short sentences                                | Write a short introduction that preserves person and sentence boundaries | Use this when writing a short introduction, question, or message. Sentence boundaries, question marks, and meaningful accents help a reader distinguish words such as “you” and “your.” |

**Cumulative task:** Write and say a short personal introduction, describe a room, and ask a partner three relevant questions. Assess the grammar targets separately from vocabulary gaps.

**Level boundary:** Do not require productive past-tense narration or a generalized subjunctive system. Greetings and courtesy formulas can be available without pretending the learner has mastered their underlying mood.

## 5. A2 — Expand everyday exchanges and introduce past-time systems

**Exit expectation:** Handle routine exchanges, give basic instructions, describe past circumstances, and report completed events in short connected language.

| Module                                   | Rules and types to teach                                                                                                                                                                                                     | Evidence of learning                                                       | When you use it |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --- |
| A2-01 Noun-phrase expansion              | Count/mass contrasts in practical use; frequent irregular genders/plurals; definite versus indefinite reference; basic generic article use; common zero-article patterns; feminine el agua with feminine adjective agreement | Ask for amounts and describe categories without copying English articles   | Use this when ordering food, asking for an amount, or describing a category of things. It helps you distinguish an item from a substance, choose articles naturally, and keep agreement in phrases such as “cold water.” |
| A2-02 Determiners and quantifiers        | Possessive forms such as mío/tuyo; neutral esto/eso/aquello; alguno/ninguno; algo/nada/alguien/nadie in useful frames; otro, cada, demasiado, bastante; numeral and determiner agreement; frequent ordinals                  | Express absence, alternatives, and sufficient or excessive quantity        | Use this when explaining what belongs to you, what is missing, or whether there is enough. You can talk about another option, each person, too many things, or nobody being available. |
| A2-03 Comparison                         | Más/menos…que; tan…como; tanto…como; mejor/peor/mayor/menor in frequent meanings; relative superlative                                                                                                                       | Compare two places and choose one with a reason                            | Use this when choosing between restaurants, comparing apartments, or describing similarities. Say that one option is cheaper, as convenient as another, or the best of a group. |
| A2-04 Present-system consolidation       | Frequent irregulars and spelling changes; reflexive routines across persons; present used for scheduled events; progressive estar + gerund; ordinary present versus current activity                                         | Describe what normally happens and what is happening now                   | Use this when distinguishing a normal routine from something happening right now. You can explain that you usually work at home but are working in the office today, or mention a scheduled event. |
| A2-05 Preterite formation and events     | Pretérito perfecto simple/indefinido; regular endings; common strong and irregular forms; accent contrasts; bounded completed events and sequences                                                                           | Report a short sequence of completed actions                               | Use this when reporting completed actions and the steps of a past event. Describe what you bought, where you went, and what happened next, presenting each event as a completed whole. |
| A2-06 Imperfect formation and background | -aba/-ía; ser/ir/ver; past descriptions, age/time/weather, habits; introductory distinction from completed events                                                                                                            | Describe childhood circumstances and a repeated routine                    | Use this when describing childhood, an old home, or a past routine. The imperfect gives background—what life was like or what used to happen—without focusing on the situation’s beginning or end. |
| A2-07 Present perfect                    | Haber + regular/irregular participle; invariant participle in compound tenses; experience and past events linked to the present; regional perfect/preterite alternatives                                                     | Report an experience and understand both common regional renderings        | Use this when discussing experiences or past events connected to the present conversation. You can say you have visited a place or finished a task, while recognizing that speakers in different regions may choose a different past tense. |
| A2-08 Plans, obligation, and ability     | Ir a + infinitive; tener que/hay que; poder/saber + infinitive; common deber uses; me gustaría as a useful courtesy frame, without assuming full conditional control                                                         | Explain a plan, requirement, and ability                                   | Use this when making plans, explaining responsibilities, or saying what you can do. Distinguish an intention, a requirement, and an ability, such as going to travel, having to work, and knowing how to swim. |
| A2-09 Direct objects                     | Lo/la/los/las; placement before finite verbs and attachment to infinitives or gerunds where permitted; personal a with frequent human objects; reference resolution                                                          | Replace repeated object nouns without changing the referent                | Use this when referring back to something instead of repeating its name. After mentioning a ticket or some keys, you can say you have it, want to buy it, or cannot find them. |
| A2-10 Indirect objects and experiencers  | Me/te/le/nos/os/les; a + recipient; common doubling; gustar/encantar/doler and agreement with the grammatical subject                                                                                                        | Explain what hurts or interests someone; identify a recipient              | Use this when saying who receives something or who feels an effect. Explain that you gave someone a present, that something interests them, or that their head hurts. |
| A2-11 Affirmative instructions           | Affirmative command patterns for familiar and polite address; common irregulars; one attached pronoun; local vos/vosotros forms where applicable                                                                             | Give a short route or set of instructions with consistent address          | Use this when giving someone a route, a recipe step, or a practical instruction. Choose forms that fit how you address the person, such as telling a friend to come in or asking a customer to wait. |
| A2-12 Place, duration, and prepositions  | Desde/hasta; desde hace/hace…que; antes de/después de + infinitive; basic por versus para; frequent governed verb combinations; formation and use of common -mente adverbs                                                   | Say how long a situation has lasted and what happens before another action | Use this when explaining where a journey begins and ends, how long you have lived somewhere, or what happens before another activity. It also helps distinguish common reasons, destinations, and purposes. |
| A2-13 Basic connected clauses            | Restrictive que/donde; present factual/habitual cuando; real si + present with simple results; por eso/entonces; coordination and negative concord                                                                           | Connect a short description, reason, result, and practical condition       | Use this when combining short sentences into a connected description or plan. Identify the person you mean, explain a result, or say what happens if a familiar condition is met. |
| A2-14 State, existence, and change       | Expanded ser/estar; event location with ser; hay versus está/están; impersonal weather and elapsed-time expressions; common result-state adjectives                                                                          | Explain where an event is and how a situation now stands                   | Use this when explaining where an event takes place, what exists somewhere, or how a situation now stands. You can locate a concert, describe the weather, or say that a shop is closed. |
| A2-15 Inflection and written clarity     | Spelling changes in common verb forms; general written-stress rules, diphthong/hiatus support, and stress in past endings; basic accents with attached pronouns; punctuation in short connected texts                        | Distinguish hablo/habló and preserve agreement in a short message          | Use this when writing about past events or adding pronouns to instructions. Correct spelling and accents preserve distinctions such as “I speak” versus “he or she spoke” and make a connected message easier to read. |

**Cumulative task:** Describe a usual weekend, narrate a particular weekend, explain an experience, and give instructions for the next visit.

**Boundary checks against PCIC:** The A1–A2 grammar inventory places systematic imperfect, preterite, present-perfect, and affirmative-command work in A2. It does not introduce a general subjunctive tense system there. This plan keeps full future/conditional paradigms for B1, while allowing useful earlier formulas. [PCIC A1–A2, grammar §§9.1–9.3](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm).

## 6. B1 — Connect events, intentions, explanations, and recommendations

**Exit expectation:** Sustain a comprehensible narrative or explanation, manage common time relationships, and express wishes, recommendations, and practical conditions. Control is improving; occasional systematic errors remain plausible.

| Module                                           | Rules and types to teach                                                                                                                                                                                                                  | Evidence of learning                                                              | When you use it |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --- |
| B1-01 Past-time contrasts                        | Preterite/imperfect as viewpoints; foreground/background; habitual versus bounded repetition; state verbs and meaning shifts; perfect/preterite with regional context                                                                     | Tell the same event as background and as a completed whole                        | Use this when telling a story and deciding what counts as background versus an event that moves it forward. You can describe what was happening, what happened next, and how a different tense changes the viewpoint. |
| B1-02 Earlier past                               | Pluperfect indicative; participle system; anteriority to a past reference point; ya/todavía/no…aún without mechanical trigger rules                                                                                                       | Explain what had happened before arriving                                         | Use this when explaining what had happened before another past event. For example, describe arriving at a station after the train had left or discovering that someone had already finished a task. |
| B1-03 Future simple                              | Regular/irregular stems; predictions and promises; contrast with ir a and scheduled present; introductory probability uses                                                                                                                | Make a prediction and explain the intended degree of commitment                   | Use this when making predictions, promises, or statements about what will happen. You also begin to use the future to suggest what is probably true now, rather than only to locate an event in the future. |
| B1-04 Conditional simple                         | Forms and irregular stems; advice, wishes and polite requests; initial future-from-past recognition; distinguish politeness from literal past time                                                                                        | Give advice and make a tactful request                                            | Use this when giving advice, expressing a wish, or making a tactful request. You can say what you would do, what you would like, or what someone said would happen later. |
| B1-05 Present subjunctive formation              | Regular and irregular forms; stem/spelling changes; distinction between mood and time; present/future reference                                                                                                                           | Form an appropriate verb after a supplied communicative intention                 | Use this when you need the correct verb form to express a wish, recommendation, or other meaning that calls for the present subjunctive. These forms can refer to a present situation or a future action. |
| B1-06 Common mood environments                   | Wishes, requests, influence, emotion, impersonal evaluation, doubt and negated belief; infinitive versus finite clause and subject reference; useful ojalá patterns                                                                       | Recommend an action to another person and express a reaction                      | Use this when recommending that someone do something, reacting to an event, or expressing doubt or a wish. It helps you choose between saying what you want to do and what you want another person to do. |
| B1-07 Commands and pronouns                      | Negative commands; present-subjunctive relationship; reflexive commands; pronoun pairs; affirmative enclisis/negative proclisis; stress and accent repair                                                                                 | Give and withdraw an instruction using pronouns                                   | Use this when giving or withdrawing an instruction involving people or objects already mentioned. You can say “give it to me” or “don’t tell them,” placing the pronouns correctly and keeping the intended addressee clear. |
| B1-08 Combined objects                           | Indirect-before-direct sequence; le/les → se before lo/la/los/las; reference ambiguity; placement with permitted verb combinations; introductory doubling contrasts                                                                       | Pass an object to a recipient and refer back to both accurately                   | Use this when a message involves both a thing and its recipient. Instead of repeating “the book” and “María,” you can say that you gave it to her, while making clear whom the pronouns refer to. |
| B1-09 Aspectual and modal combinations           | Soler; volver a; dejar de; empezar a; acabar de; seguir + gerund; common obligation/possibility contrasts; distinguish verb complements from periphrases                                                                                  | Explain a repeated, interrupted, recently completed, or continuing activity       | Use this when describing the stage of an activity: starting, stopping, continuing, repeating, or having just finished. These verb combinations also help you explain what someone can, should, or has to do. |
| B1-10 Conditional, temporal, and purpose clauses | Real si with present and future/command results; future-oriented temporal subjunctive in frequent frames; antes de que; para versus para que                                                                                              | Make a plan with a condition, deadline, and purpose                               | Use this when arranging plans with a condition, a deadline, or a purpose. You can explain what you will do if something happens, when you finish, or so that another person can take part. |
| B1-11 Relative clauses and indirect questions    | Que/quien/donde; prepositions in common relatives; lo que; indirect qué/cómo/cuándo and si; introduce specificity contrasts in supported contexts                                                                                         | Describe an unidentified item and report what someone asked                       | Use this when identifying the person or thing you mean, describing something you are looking for, or reporting a question. Connect details naturally instead of repeating nouns or quoting every question directly. |
| B1-12 Cause, consequence, and concession         | Porque/como/ya que; por eso/así que; introductory factual aunque; pero versus sino; tan/tanto…que; expanded comparison                                                                                                                    | Give a reason, acknowledge an obstacle, and state the outcome                     | Use this when explaining a decision, acknowledging a difficulty, or correcting an alternative. You can link a cause to its result and distinguish “but” from a correction such as “not this, but that.” |
| B1-13 Impersonality and pronominal meanings      | Impersonal haber/hacer; common impersonal and passive-reflexive se patterns; reflexive versus reciprocal; frequent ir/irse and quedar/quedarse contrasts                                                                                  | Explain a general practice and distinguish an event from an intentional action    | Use this when explaining what people generally do, describing an event without naming an actor, or distinguishing actions such as leaving from simply going somewhere. The meaning depends on the construction; se does not always mean “oneself.” |
| B1-14 Nominal and adjectival refinement          | Buen/mal/gran; relative/absolute superlative; gender-sensitive meanings; reference with definite/indefinite/zero articles; possessive ambiguity and clarifying de phrases; fractions and common multiplicative/partitive quantity phrases | Rewrite an ambiguous description so the referents are clear                       | Use this when a description needs to be more precise: whose object it is, how good something is, or what portion you mean. It helps you remove ambiguity and use common shortened adjective forms naturally. |
| B1-15 Reporting and cohesion                     | Dijo que and common changes of person/place/time; present reporting; past narration links; reference chains; supported report of questions and instructions                                                                               | Relay a short message accurately without copying the original speaker’s viewpoint | Use this when passing on someone’s message or recounting a short conversation. Keep people, places, times, and references consistent so the listener can follow who said what and what happened next. |
| B1-16 Government and written structure           | High-frequency verb/adjective + preposition patterns; por/para beyond translation equivalents; personal a refinement; accents in indirect questions; si/sí and qué/que; paragraph links                                                   | Write an explanation whose clauses and references remain easy to follow           | Use this when writing a connected explanation or choosing the small linking words a verb or adjective requires. Correct prepositions, accents, and paragraph links make your intended relationships easier to follow. |

**Cumulative task:** Tell a short past story, explain what preceded it, recommend a response, and relay the result to someone else.

## 7. B2 — Control complex clauses and the modern tense–mood system

**Exit expectation:** Explain, narrate, and argue with a range of complex structures. Distinguish intended meanings, maintain temporal relationships, and correct most consequential errors.

| Module                                              | Rules and types to teach                                                                                                                                                                                                                                     | Evidence of learning                                                                   | When you use it |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | --- |
| B2-01 Integrated indicative system                  | All common simple/compound indicative forms; lexical aspect and narrative viewpoint; future perfect and conditional perfect; probability and future-from-past                                                                                                | Reconstruct a multi-stage timeline and express a justified conjecture                  | Use this when explaining a sequence of events, making predictions, or describing what was expected to happen. Bring the indicative tenses together to show what had already happened, what will be finished by a deadline, or what probably happened. |
| B2-02 Imperfect subjunctive                         | -ra/-se paradigms; irregulars; past governing contexts; present/future hypothetical reference; courtesy uses                                                                                                                                                 | Distinguish grammatical form from the time being imagined                              | Use this when reporting a past wish or request, imagining an unlikely situation, or speaking tactfully. The imperfect subjunctive can describe a present or future possibility as well as fit a past reporting context. |
| B2-03 Perfect subjunctive forms                     | Haya + participle; hubiera/hubiese + participle; anteriority and completion; integration with present/past governing contexts                                                                                                                                | Contrast a desired action with a reaction to an already completed action               | Use this when a wish, doubt, or reaction concerns an action that is already completed relative to another point in time. Distinguish hoping someone arrives from hoping they have arrived, or wishing a past event had been different. |
| B2-04 Conditional systems                           | Real/open, hypothetical present/future, counterfactual past; conditional perfect results; introductory mixed-time conditions; unless/provided-that alternatives                                                                                              | Explain an unreal past and its possible present consequence                            | Use this when exploring possible outcomes, imagining a different past, or explaining how a past decision affects the present. Make clear whether a condition is open, hypothetical, or contrary to what actually happened. |
| B2-05 Noun-clause mood selection                    | Assertion versus nonassertion; certainty, doubt, negation, evaluation and reported requests; subordinate subjects; stance-sensitive alternations                                                                                                             | Choose mood to preserve the speaker’s intended claim rather than a trigger list        | Use this when expressing a belief, denying a claim, evaluating a situation, or reporting a request. Mood choice helps preserve whether you are asserting information, questioning it, or presenting it through someone’s wishes or judgment. |
| B2-06 Relative-clause mood and structure            | Identified versus sought/denied referents; restrictive/nonrestrictive; preposition + relative; el que/el cual/quien; lo que/lo cual                                                                                                                          | Specify exactly which people or objects a claim applies to                             | Use this when identifying a specific person or thing, searching for one that meets a requirement, or adding information about it. The construction helps distinguish a known translator from any translator who could do the job. |
| B2-07 Adverbial-clause systems                      | Temporal, place, manner, purpose, condition, concession, cause, consequence, comparison; cuando/mientras/hasta que, donde/adonde, como/según/sin que; construction-specific mood constraints                                                                 | Link the same proposition to different logical relations without changing facts        | Use this when explaining when, where, how, why, or under what circumstances something happens. Build connected plans and arguments whose clauses make the intended time, purpose, condition, or consequence clear. |
| B2-08 Concession and contrast                       | Aunque + indicative/subjunctive; known versus hypothetical or backgrounded information; a pesar de (que); por mucho que; sino/sino que                                                                                                                       | Distinguish “although this is so” from “even if this is so” in a supplied context      | Use this when acknowledging an obstacle while maintaining your main point. You can distinguish discussing an actual difficulty from allowing for a possible one, or treating known information as background rather than asserting it again. |
| B2-09 Reported speech and tense sequence            | Statements/questions/requests; shifts in person and deixis; anteriority/simultaneity/posteriority; reporting still-valid information without automatic backshift                                                                                             | Relay a past conversation while preserving what is current and what was only true then | Use this when relaying a conversation, meeting, or request after the event. Adjust the speaker’s perspective while preserving what happened earlier, what was expected later, and which information is still true now. |
| B2-10 Passive, impersonal, and middle constructions | Ser + agreeing participle; por-agent; estar + result state; passive-reflexive versus impersonal se; anticausative/pronominal contrasts                                                                                                                       | Reframe an event with the agent prominent, omitted, or unknown                         | Use this when the event or its result matters more than naming the person responsible. Describe how something is made, what happened to a document, or a general procedure while distinguishing an action from its resulting state. |
| B2-11 Clitics, affected participants, and variation | Doubling and placement restrictions; tonic reinforcement; affected possessor/experiencer; se me cayó; introduce leísmo and distinguish accepted usage from unsupported generalization                                                                        | Explain who was affected without falsely making that person the agent                  | Use this when explaining who was affected by an event, especially accidents, experiences, or possession. You can describe dropping something or having something happen to you, while recognizing legitimate regional pronoun patterns. |
| B2-12 Copulas and change of state                   | Ser/estar + meaning-sensitive adjectives; ponerse/quedarse/volverse/hacerse/llegar a ser; event location and result states revisited                                                                                                                         | Describe a temporary reaction, lasting transformation, and acquired role               | Use this when describing how a person or situation changes. Distinguish becoming nervous, ending up alone, developing a lasting characteristic, or acquiring a professional role instead of translating every change with one verb. |
| B2-13 Nonfinite syntax and periphrases              | Infinitive clauses; perfect infinitive; gerund time/subject relations; participles; llevar/ir/venir + gerund; epistemic possibility/inference versus deontic permission/obligation; perception/causative patterns                                            | Reformulate a sentence without losing its subject or temporal relation                 | Use this when connecting actions more compactly or showing how they develop over time. Describe an activity that keeps going, has been continuing for a period, or changes gradually, while keeping the actor and timing clear. |
| B2-14 Determination, agreement, and scope           | Specific/generic reference; article omission; neutral lo; quantifier scope; cualquier/cualquiera, ambos, demás; más de versus más que in quantity/comparison; adjective-position meaning; collectives and more complex agreement; noun/adjective complements | Explain a meaning difference caused by position or scope                               | Use this when small wording choices change which people, things, or quantities you mean. Clarify whether a statement is general or specific, how much is included, and whether adjective position changes the description. |
| B2-15 Focus, negation, and information order        | Topic fronting and resumptive clitics; common focus frames; negative concord; contrastive negation; information-bearing word order; ellipsis in coordination                                                                                                 | Correct an assumption while emphasizing only the relevant information                  | Use this when correcting an assumption or drawing attention to a particular person, action, or contrast. Reorder information and use pronouns or negation to make the important part of your message stand out clearly. |
| B2-16 Prepositional accuracy and cohesive writing   | Required prepositions before que; queísmo/dequeísmo in frequent patterns; connectors and punctuation; sino/si no, porque/por qué/porqué, aun/aún; reporting sources; parallel structures                                                                     | Edit a reasoned account for clause connection and reference, not just verb endings     | Use this when writing an explanation, argument, or report that needs clear links between ideas. Choose required prepositions and connectors, distinguish similar written forms, and make sources and contrasting claims easy to follow. |

**Cumulative task:** Present a position, report another person’s argument, acknowledge an objection, explain a hypothetical alternative, and justify the preferred outcome.

**Boundary checks against PCIC:** In the B1 column, the inventory develops future simple, conditional simple, pluperfect indicative, present subjunctive, and negative commands. The B2 column develops imperfect/perfect/pluperfect subjunctive and future/conditional perfect, including unreal conditions and more elaborate tense relations. The plan introduces some practical frames before their later systematic treatment. [PCIC B1–B2, grammar §§9.1–9.3 and 15](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_b1-b2.htm).

## 8. C1 — Use grammar to control stance, information, and register

**Exit expectation:** Maintain accurate, flexible complex language in extended communication. Errors should be uncommon; choices should fit purpose and register. Complexity alone is not quality.

| Module                                          | Rules and types to teach                                                                                                                                                                                                    | Evidence of learning                                                              | When you use it |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --- |
| C1-01 Mood as interpretation                    | Alternations under negation, perception, communication, evaluation and concession; presupposed versus asserted content; denial of an explanation versus denial of an event                                                  | Explain how changing mood changes the speaker’s position                          | Use this when expressing a careful position on someone’s claim or on an explanation for an event. Changing mood can alter what you assert, accept as background, question, or reject, even when the basic event stays the same. |
| C1-02 Temporal and aspectual perspective        | Narrative/historical present; imperfect of politeness, intention, surprise and distancing; layered anteriority; modal future/conditional; consistent reference points                                                       | Retell an event from a different viewpoint while preserving chronology            | Use this when retelling events from a particular viewpoint or using tense to convey politeness, surprise, or distance. Keep the chronology clear while shifting how close, immediate, or tentative the account feels. |
| C1-03 Advanced conditions and concessions       | Mixed temporal relations; de + infinitive/perfect infinitive; como si; a no ser que/con tal de que; concessive degrees and open alternatives                                                                                | Express a qualified exception or counterfactual without an ambiguous timeline     | Use this when qualifying an argument with exceptions or imagining a past event with a present consequence. Express what would hold under particular conditions, what could prevent it, and which obstacles would not change your conclusion. |
| C1-04 Relative systems and possession           | Cuyo agreement with the possessed noun; prepositional relatives; free relatives including quien and cuanto families; whole-clause reference; restrictive/nonrestrictive interpretation; avoid ambiguity in long antecedents | Compress linked facts into a precise relative construction                        | Use this when combining several facts about people, possessions, or ideas into precise sentences. Relative constructions help identify the right referent, show a relationship with cuyo, and avoid ambiguity in longer descriptions. |
| C1-05 Information packaging                     | Topic versus contrastive focus; cleft/pseudocleft structures; resumptive pronouns; left/right dislocation; emphasis and the limits of flexible word order                                                                   | Give three grammatical versions of one message with different focal information   | Use this when your listener already knows part of the story and you need to emphasize what is new or disputed. Present the same facts with attention on the person, the action, or the thing being corrected. |
| C1-06 Nominalization and abstract reference     | Infinitival and deverbal nominalization; dense noun phrases; neutral lo and reference with ello; el de/la de ellipsis; modification and ambiguous attachment                                                                | Turn a spoken explanation into concise formal prose without obscuring agency      | Use this when turning a spoken explanation into a formal report or discussing actions as abstract ideas. Build compact noun phrases while keeping clear who is responsible and what each modifier describes. |
| C1-07 Agreement and determination edge cases    | Partitives/collectives and coordinated subjects; title/apposition agreement; semantic gender; article use with proper names and abstract/generic nouns; demonstrative reference in discourse                                | Edit complex agreement while recognizing documented alternatives                  | Use this when editing sentences with groups, proportions, coordinated subjects, or complex references. Choose agreement and articles that fit the intended meaning, while recognizing cases where more than one form is accepted. |
| C1-08 Adjectives, degree, and predication       | Relational versus qualifying readings; prenominal evaluation; predicative complements; irregular degree forms; adjectival/adverbial uses                                                                                    | Distinguish a property, evaluation, and state accompanying an action              | Use this when a description needs to distinguish a category from an opinion or a quality from a state during an action. Adjective choice and position help express evaluation, degree, and more precise relationships. |
| C1-09 Nonfinite compression                     | Absolute participle and gerund clauses; perfect infinitives/gerunds; subject control; temporal, causal and concessive readings; limits on dangling or misleading modifiers                                                  | Compress clauses, then expand them again with the original meaning intact         | Use this when shortening a report or linking actions without repeating full clauses. Infinitive, gerund, and participle constructions can convey timing or cause, provided the reader can still identify who performs each action. |
| C1-10 Voice, valency, and participant structure | Causative/anticausative alternations; passive choice by genre; pronominal lexical changes; datives of involvement; impersonal agency                                                                                        | Change the information focus without incorrectly changing who did what            | Use this when choosing whether to foreground an actor, an affected person, or an event itself. Describe responsibility and involvement accurately when changing between active, passive, impersonal, and pronominal constructions. |
| C1-11 Government and complementation            | Noun/adjective/verb complements; finite versus nonfinite alternatives; queísmo/dequeísmo and accepted competing patterns; coordination of differently governed complements                                                  | Repair genuinely defective complementation without overcorrecting valid variation | Use this when a complex sentence combines words that require different complements or prepositions. Keep the links between verbs, nouns, adjectives, and their clauses correct without replacing a valid regional or stylistic alternative unnecessarily. |
| C1-12 Attribution and reported stance           | Extended reported discourse; attribution and evidential distance; perspective shifts; indirect questions embedded in complex argument; introduction to free indirect discourse in reading                                   | Distinguish the writer’s claim from the claim being reported                      | Use this when reporting an extended discussion, summarizing sources, or separating someone else’s claim from your own position. Track whose viewpoint is being represented and how strongly the writer commits to the reported information. |
| C1-13 Scope, cohesion, and ellipsis             | Negation and quantifier scope; focus particles; connector contrasts; recoverable omitted material; parallelism; cohesive reference across paragraphs                                                                        | Remove ambiguity in a multi-paragraph explanation                                 | Use this when a longer explanation could leave readers unsure what is denied, quantified, or referred to. Control linking expressions and omitted information so the argument remains clear across sentences and paragraphs. |
| C1-14 Register and pragmatic grammar            | Requests and mitigating tense; directive force; grammatical emphasis; colloquial versus formal syntax; regional person/clitic/tense choices; word formation with evaluative force                                           | Adapt one message for a friend, colleague, and formal recipient                   | Use this when adapting the same message for a friend, colleague, or formal recipient. Adjust requests, emphasis, and sentence structure to the relationship and setting while recognizing regional ways of expressing the same intention. |

**Cumulative task:** Reformulate an argument for two audiences, accurately attribute a source, and defend the grammatical choices that alter emphasis or commitment.

**Boundary:** Do not reduce C1 to unusual verb endings or vocabulary. Most modern morphology is already available; the new work is reliable integration and interpretive control.

## 9. C2 — Sustain precision and deliberate grammatical choice

**Exit expectation:** Preserve very high control during demanding communication and reformulation. Interpret subtle implication, rhetorical choice, variation and ambiguity. Native-like identity, accent, or knowledge of every regional form is not required.

| Module                                        | Rules and types to teach                                                                                                                                                                                           | Evidence of learning                                                                               | When you use it |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --- |
| C2-01 Fine mood alternations                  | Lexically sensitive indicative/subjunctive changes; assertion, accommodation and distancing; mood under scope ambiguity; meanings not captured by a simple certainty/doubt rule                                    | Explain and reproduce a subtle shift of stance in context                                          | Use this when a small change in mood subtly changes your stance toward a claim. In complex argument or close reading, distinguish what a speaker presents as their own assertion, accepts for discussion, or keeps at a distance. |
| C2-02 Pragmatic tense and aspect              | Rhetorical future/conditional; surprise, rejection and conjecture; narrative imperfect; reportative conditional; nonliteral tense substitution with register constraints                                           | Distinguish literal time from a speaker’s rhetorical purpose                                       | Use this when tense expresses more than time, such as disbelief, surprise, conjecture, or distance from a report. Interpret the speaker’s rhetorical purpose and choose a form suited to the context and register. |
| C2-03 Open and elliptical clause patterns     | Repeated-subjunctive concessions; unrestricted relatives; conditions/concessions without canonical connectors; recoverable ellipsis; multiple plausible analyses                                                   | Expand a compressed construction and identify its implied relationship                             | Use this when keeping a conclusion valid across open alternatives or understanding a compressed condition or concession. You can express “whatever happens” and recover relationships that a speaker leaves partly unstated. |
| C2-04 Marked order and expressive syntax      | Stylistic inversion; fronting with and without clitic resumption under different information structures; fragments; repetition; deliberate parallelism and nonparallelism                                          | Reformulate for emphasis while separating marked grammar from error                                | Use this when shaping a speech, literary passage, or emphatic response through unusual word order, fragments, or repetition. Make deliberate stylistic choices while distinguishing an expressive construction from an unintended grammatical error. |
| C2-05 Advanced reference and scope            | Ambiguous anaphora, quantifier/negation interactions, reference to propositions, complex embedding, pragmatic interpretation of determiners                                                                        | Identify more than one legitimate reading and rewrite to select one                                | Use this when a dense passage supports more than one interpretation of who, what, or how much is involved. Identify competing readings and rewrite the reference, negation, or quantity expression to select the intended one. |
| C2-06 Nominal and adjectival nuance           | Expressive determiner use; noun-class shifts; subtle adjective placement; productive prefixes/suffixes and evaluative morphology; complex and lexicalized agreement; marked distributives such as sendos as needed | Preserve connotation and register when editing a dense passage                                     | Use this when editing a description whose connotations matter as much as its literal meaning. Fine choices in articles, adjective position, word formation, and agreement can preserve evaluation, tone, and a particular sense of a noun. |
| C2-07 Valency, clitics, and regional syntax   | Fine differences in argument realization, clitic presence, affected participants and pronominal verbs; documented pan-Hispanic variants; social and stylistic distribution                                         | Describe a regional option accurately without presenting it as universally interchangeable         | Use this when interpreting or adapting Spanish across regions, social settings, and styles. Understand how pronouns and verb patterns assign roles or involvement, and decide whether a documented regional form fits the intended audience. |
| C2-08 Nonfinite and formal compression        | Closely integrated infinitive/gerund/participle constructions; nominal versus verbal readings; complex periphrastic combinations; interpretation of implicit subjects                                              | Produce concise formal prose that retains explicit logical relations                               | Use this when producing concise formal prose with several connected actions or abstract ideas. Compress the wording while preserving the implied subjects, sequence of events, and logical relationships that a fuller version makes explicit. |
| C2-09 Voice, reporting, and rhetorical agency | Fine control of active/passive/impersonal choice; free indirect discourse; reported language and responsibility; layered quotation and distancing                                                                  | Track whose words, thoughts, and commitments a complex passage represents                          | Use this when analyzing or writing accounts with several voices, quoted claims, or an unclear source of responsibility. Distinguish the narrator’s position from a speaker’s words or thoughts and control how agency is presented. |
| C2-10 Grammar of interpersonal meaning        | Irony and echo; indirect directives; exclamative and interrogative force; discourse-particle interaction; emphatic and concessive command uses                                                                     | Respond appropriately to a grammatical sentence whose literal reading is misleading                | Use this when the intended message differs from the literal sentence, as in irony, an echoed objection, or an indirect request. Interpret the relationship and tone before deciding how to respond or reformulate the message. |
| C2-11 Specialist and historical recognition   | Pretérito anterior; future subjunctive simple/compound; fossilized legal/administrative formulas; literary -ra uses; archaic pronoun placement in selected texts                                                   | Recognize and paraphrase into contemporary Spanish; production only for a relevant specialist goal | Use this when reading older literature, legal formulas, or specialist documents containing uncommon verb forms or pronoun patterns. Recognize their meaning and paraphrase them in contemporary Spanish; use them actively only when the specialist task calls for it. |
| C2-12 Integrated editing and reformulation    | Accuracy under cognitive load; eliminate ambiguity; preserve intended stylistic effects; distinguish error, optional improvement, regional variant, and deliberate deviation                                       | Edit a demanding text and justify only the changes that are warranted                              | Use this when reviewing demanding writing for accuracy, clarity, and a consistent voice. Resolve unintended ambiguity while preserving meaningful stylistic effects, accepted regional usage, and the author’s intended degree of emphasis. |

**Cumulative task:** Interpret an ambiguous passage, produce two intended readings, reformulate it for another register, and explain which grammatical changes affect meaning.

**Boundary checks against PCIC:** Advanced inventories continue earlier systems rather than replacing them with a separate “advanced grammar.” Cuyo is explicitly developed at C1; C2 includes the pretérito anterior and future subjunctive, with literary or specialized contexts. Our default recognition-first treatment of rare forms is a deliberate product choice. [PCIC C1–C2, grammar §§2.1.3 and 9](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_c1-c2.htm).

## 10. Complete verb-form coverage register

The level column gives the planned start of systematic work, not the first possible exposure. Subsequent levels retain and extend it. The conditional is grouped with indicative forms here; alternative classroom terminology should be searchable.

| Form or construction                               | Model                                           | Systematic treatment              | Later development                                                      |
| -------------------------------------------------- | ----------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Present indicative                                 | hablo                                           | A1                                | A2 habitual/scheduled; B1–C2 aspect, narrative and pragmatic uses      |
| Preterite / pretérito perfecto simple / indefinido | hablé                                           | A2                                | B1–C2 viewpoint, lexical aspect, narrative and regional contrasts      |
| Imperfect indicative                               | hablaba                                         | A2                                | B1 narrative contrast; B2–C2 non-temporal and rhetorical uses          |
| Present perfect indicative / perfecto compuesto    | he hablado                                      | A2                                | B1–C2 reference period, discourse relevance and regional distribution  |
| Pluperfect indicative                              | había hablado                                   | B1                                | B2–C2 nested time relations and pragmatic uses                         |
| Future simple                                      | hablaré                                         | B1                                | B2 probability; C1–C2 stance, directives and rhetoric                  |
| Conditional simple                                 | hablaría                                        | B1                                | B2 hypotheses and reporting; C1–C2 register and stance                 |
| Future perfect                                     | habré hablado                                   | B2                                | Anteriority, inference and rhetorical uses                             |
| Conditional perfect                                | habría hablado                                  | B2                                | Counterfactual results, past-future relations and reportative readings |
| Pretérito anterior                                 | hube hablado                                    | C2 recognition                    | Literary/specialist reading; no everyday-production requirement        |
| Present subjunctive                                | hable                                           | B1                                | B2 full clause interactions; C1–C2 fine mood interpretation            |
| Imperfect subjunctive                              | hablara / hablase                               | B2                                | C1–C2 register, nonliteral uses and restricted alternations            |
| Perfect subjunctive                                | haya hablado                                    | B2                                | Completion/anteriority and stance-sensitive contrasts                  |
| Pluperfect subjunctive                             | hubiera / hubiese hablado                       | B2                                | Counterfactuality, anteriority and register-sensitive alternatives     |
| Future subjunctive                                 | hablare                                         | C2 recognition                    | Legal/historical or fixed-expression contexts                          |
| Future perfect subjunctive                         | hubiere hablado                                 | C2 recognition                    | Legal/historical interpretation                                        |
| Affirmative commands                               | habla / hable / hablad / hablen; regional hablá | A2                                | B1 multiple pronouns; B2–C2 pragmatic force and alternatives           |
| Negative commands                                  | no hables / no hable…                           | B1                                | B2–C2 indirectness and register; formulas may occur earlier            |
| Simple/perfect infinitive                          | hablar / haber hablado                          | A1 simple; B2 perfect             | C1–C2 clause compression and interpretation                            |
| Simple/compound gerund                             | hablando / habiendo hablado                     | A2 simple; C1 compound            | Earlier progressive work; later independent-clause relations           |
| Participle                                         | hablado; escrito                                | A2 systematic                     | Compound tense, passive, adjective and absolute-clause distinctions    |
| Periphrastic constructions                         | voy a hablar; sigo hablando                     | Useful frames A1–A2; system B1–B2 | C1–C2 aspectual and modal nuance                                       |

Conjugation coverage includes person/number, chosen address variety, stem changes, spelling changes, irregular stems, participles, defective verbs where useful, and stress. **Estar + gerund and ir a + infinitive are constructions, not extra morphological tenses.** The imperative is not a full six-person paradigm parallel to indicative tenses. Formal commands and negative directives share subjunctive forms. [RAE–ASALE: Spanish conjugation](https://www.rae.es/buen-uso-espa%C3%B1ol/conjugaci%C3%B3n-espa%C3%B1ola).

## 11. Contrasts that require their own learning objectives

Do not hide these inside generic conjugation or translation exercises.

| Contrast                                | First working scope → later control | Teaching requirement                                                                                                         |
| --------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Ser / estar / hay                       | A1 → C2                             | Use type, referential status, event versus entity location, adjective meaning; avoid permanent/temporary as a universal rule |
| Preterite / imperfect                   | A2 → C2                             | Viewpoint and discourse context; repeated actions can be bounded; long actions can be preterite                              |
| Perfect / preterite                     | A2 → C2                             | Regional and discourse context; today is not a universal tense trigger                                                       |
| Indicative / subjunctive / infinitive   | Useful frames A1 → systematic B1–C2 | Construction, reference, stance and subjects; not “real versus unreal” alone                                                 |
| Direct / indirect object                | A2 → C2                             | Grammatical role, not just whether a person is involved; personal a does not make an object indirect                         |
| Reflexive / other se constructions      | A1 frames → A2–C2                   | Identify the construction before explaining the pronoun; do not call every se reflexive                                      |
| Por / para                              | A1 frames → A2–C2                   | Purpose, cause, destination, recipient, route, exchange, distribution and fixed government                                   |
| Saber / conocer; saber / poder          | A1–A2 → B1+                         | Knowledge, familiarity, learned ability and possibility; government and complements                                          |
| Gustar-type / ordinary transitive verbs | A1 → B2                             | Grammatical subject versus experiencer and agreement                                                                         |
| Definite / indefinite / zero article    | A1 → C2                             | Reference, genericity, countability, predication and idiom                                                                   |
| Adjective before / after noun           | A1 default → B1–C2                  | Distinguish ordinary position, changed meaning, evaluation and relational restrictions                                       |
| Tan / tanto / muy / mucho               | A1–A2 → B2+                         | Grammatical category, agreement and scope                                                                                    |
| Pero / sino / sino que                  | A1 pero → B1–C2                     | Contrast versus corrective replacement; clausal versus nonclausal continuation                                               |
| Que / de que / other preposition + que  | B1 → C2                             | Required complements; legitimate alternatives; distinguish queísmo from dequeísmo                                            |
| Restrictive / nonrestrictive relative   | A2 que → B2–C2                      | Changed referent set and meaning; comma use follows the intended structure                                                   |
| Active / passive / impersonal / middle  | B1 → C2                             | Preserve participants and agreement when changing presentation                                                               |
| Reported statement / request / question | B1 → C2                             | Preserve speech act and viewpoint; no mechanical backshift rule                                                              |

Three especially important reference checks: distinguish passive-reflexive agreement from impersonal se; retain the singular in standard impersonal haber; and do not delete a preposition before que when the governing expression requires it. [RAE: se](https://www.rae.es/dpd/se), [haber](https://www.rae.es/dpd/haber), [dequeísmo](https://www.rae.es/dpd/deque%C3%ADsmo).

## 12. Variation, exceptions, and claims a teacher should challenge

The default production target should be a consistent contemporary variety selected for the learner; receptive exposure should broaden over time. Offer clearly identified tú/usted/vos and vosotros/ustedes paths. Teach the chosen local paradigm early rather than postponing vos until an “advanced dialect” lesson. Voseo is not uniform across all regions. [RAE: voseo](https://www.rae.es/dpd/voseo).

Every relevant rule needs explicit metadata for geography, register, frequency, and whether an option is accepted, context-dependent, colloquial, archaic, or unsuitable for the target task. Documented leísmo cannot be reduced to “le is always wrong as a direct object”; nor can one accepted use justify every substitution. [RAE: leísmo](https://www.rae.es/dpd/le%C3%ADsmo).

Teacher-review checklist:

1. **No false absolutes:** Test simplifications against counterexamples before publishing them.
2. **No one-to-one translation rules:** English “for,” “was,” and “would” do not select Spanish constructions reliably.
3. **No mood trigger list masquerading as explanation:** Explain the construction and intended interpretation. Some environments admit alternatives. [RAE: indicative and subjunctive](https://www.rae.es/libro-estilo-lengua-espa%C3%B1ola/el-modo-indicativo-o-subjuntivo).
4. **No universal no-conditional-after-si slogan:** The standard hypothetical-condition pattern differs from an indirect question introduced by si. Include the distinction when the learner encounters both. [RAE: si](https://www.rae.es/dpd/si).
5. **No blanket subject-agreement shortcuts:** Some collective and partitive constructions permit more than one agreement pattern. [RAE: concordancia](https://www.rae.es/dpd/concordancia).
6. **No unqualified gerund bans:** Judge subject reference, temporal relation, construction and current guidance; distinguish genuine problems from permitted uses. [RAE: gerundio](https://www.rae.es/dpd/gerundio).
7. **No context-free unique answer when alternatives are grammatical:** Specify the intended meaning or accept multiple answers and explain their differences.
8. **No conflation of grammaticality and style:** Label an awkward but grammatical answer differently from a grammatical error.
9. **No grammar score presented as a CEFR certificate:** Broader communicative assessment is separate.
10. **No rare-form quota at C2:** Specialist recognition must not crowd out precision, fluent control and reformulation.
11. **No deceptive completion label:** Completing four familiar questions establishes practice completion, not independent mastery.
12. **No inaccessible metalanguage:** Define terms and pair every rule with an interpretable example. Analytical terminology is available for teachers and interested learners, but not the primary obstacle in beginner tasks.

## 13. What a publishable rule record must contain

The learning unit is **one construction or contrast at one intended scope**, not a broad title such as “subjunctive.”

| Field                  | Requirement                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Identity               | Stable rule ID, system, module, searchable Spanish/English terminology and aliases                                                 |
| Scope                  | What this rule explains; what it explicitly leaves for another rule                                                                |
| Level                  | First exposure, systematic-teaching level, expected productive level, later refinement; explanation for deliberate PCIC departures |
| Dependencies           | Specific prerequisite rule IDs; helpful prerequisites distinct from mandatory ones                                                 |
| Learning objective     | Observable meaning/form/use outcome with one clear success criterion                                                               |
| Explanation            | Plain-language rule, formation pattern, conditions, meaning, restrictions and exceptions                                           |
| Examples               | Original, natural contextualized examples; translations or glosses when useful; referents and time frame clear                     |
| Contrasts              | A near-neighbor construction, a meaningful minimal pair, and why the difference matters                                            |
| Misconceptions         | Common learner error, likely reasoning behind it, and targeted feedback                                                            |
| Variation              | Accepted answers by region/register; equivalent forms; recognition-only variants                                                   |
| Practice specification | Item types, target dimensions, distractor rationale, difficulty controls and feedback                                              |
| Transfer task          | A speaking or writing task requiring the rule without a supplied answer                                                            |
| Sources                | Exact PCIC level/section and item description; exact descriptive reference; access/version date                                    |
| Review                 | Author, teacher reviewer, linguistic review notes, approval state and revision history                                             |
| Progress               | Versioned rule identity; separate form, interpretation and production evidence; dates and hints used                               |

Initial source checking must be completed at rule level before the product claims exhaustive PCIC alignment. A broad link to an inventory page is useful for planning but insufficient as a published rule’s only audit trail. Every inventory category must map to a rule, a prerequisite already covered, a cross-linked area, or an explicitly justified recognition/specialist item.

### Example: a properly scoped B1 rule

**ID:** `G07.past-viewpoint.background-event.B1`\
**Objective:** Present an ongoing background action and a single intervening event.\
**Prerequisites:** A2 preterite morphology, A2 imperfect morphology, subject agreement.\
**Context:** Lucía was already cooking when a visitor arrived once.\
**Example:** _Lucía cocinaba cuando llegó su hermano._\
**Rule:** Use the imperfect to view cooking from inside its progress; use the preterite to present the arrival as the event.\
**Contrast:** _Lucía cocinó mientras su hermano descansaba_ presents the cooking as a bounded whole against another background.\
**Misconception:** Mientras or cuando is not, by itself, a command to choose a particular tense.\
**Transfer:** Describe an activity interrupted by a single event in two original sentences.\
**Assessment:** Ask first about the intended event structure, then ask for language. An alternative reading must be evaluated against the supplied context rather than simply declared ungrammatical.

## 14. Learning experience architecture

### Entry and navigation

Use the exact active profile level as the starting scope. Show a concise overview of its systems and modules, with the distinction between new work, review, and missing prerequisites. Keep a second route into the same catalog through “Browse by grammar type.” These are two views of one curriculum, not two disconnected sets of lessons.

At B1, for example, the overview should expose **past narration, future and conditional, present subjunctive, commands, pronouns, clause links**, and the other B1 modules. A module page should reveal its small rule units and their dependencies.

A learner can revisit earlier work without changing their proficiency level. New modules stay matched to the active level. Do not silently show another level’s content as a fallback, and do not delete progress after a level change.

The curriculum level dropdown must list all six levels, including C1 and C2. Higher-level module requirements and rule explanations are available as explicitly labeled previews. Browsing those requirements does not change the active profile or create an out-of-level practice attempt. This visibility requirement was clarified by the owner on 7 September 2026 and adopted as the app-wide [Curriculum preview rule](educational-rubric.md#curriculum-preview-rule).

### Prerequisite paths to encode first

The module lists group scope; they are not a requirement to finish every row in numerical order. These dependencies determine the initial learning sequence. Teacher authoring should resolve them into atomic rule IDs.

| Path             | Dependency chain                                                                                                                | Consequence for the experience                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Noun reference   | Gender/number → articles and adjective agreement → demonstratives/possessives → reference and scope                             | Repair agreement or reference separately instead of restarting a whole level  |
| Past narration   | Present person endings → preterite and imperfect formation → viewpoint contrast → pluperfect → integrated narration             | A conjugation error and an aspect-choice error need different feedback        |
| Object reference | Sentence roles → direct/indirect pronouns → pronoun pairs → placement and doubling → advanced clitic choices                    | Check that the learner can identify the referent before drilling placement    |
| Commands         | Address forms + present morphology → affirmative commands → present subjunctive → negative commands → combined clitics          | Teach a small affirmative set before requiring the full mood system           |
| Compound forms   | Haber + participle → present perfect → pluperfect → future/conditional perfect and perfect subjunctives                         | Reuse participle knowledge; assess the auxiliary and time relation separately |
| Hypotheticals    | Present subjunctive + past morphology → imperfect subjunctive; conditional → hypothetical conditions → unreal past → mixed time | Do not introduce a mixed conditional as the first lesson in subjunctive       |
| Complex clauses  | Simple clause functions → que/relative/indirect-question distinctions → context-sensitive mood → discourse stance               | Diagnose the kind of clause before explaining its mood                        |
| Voice and se     | Subject/object and agreement → reflexive/pronominal patterns → passive/impersonal contrast → affected participants and agency   | Give distinct construction labels rather than one all-purpose se rule         |

### A complete rule-learning cycle

| Stage   | Learner action                                                 | Design purpose                                                                             |
| ------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Check   | Answer a few unseen questions or attempt a short response      | Detect a gap without assuming that unfamiliarity with terminology means lack of competence |
| Notice  | Compare two contextual examples                                | See the distinction in meaning before memorizing a label                                   |
| Learn   | Read the rule, pattern, boundary and important exception       | Understand why the construction works                                                      |
| Form    | Supply a form, agreement or pronoun order                      | Practice the mechanism                                                                     |
| Choose  | Select between plausible constructions for a specified meaning | Test interpretation, not recognition of a trigger word                                     |
| Use     | Produce an original sentence or short exchange                 | Test transfer beyond supplied answers                                                      |
| Review  | Inspect feedback and repair the response                       | Target the actual misconception                                                            |
| Revisit | Meet the same rule later with unfamiliar content               | Gather retention evidence                                                                  |

Keep the existing understated voice, warm surfaces, shared header and level picker. Module names can be practical while a secondary label supplies the grammatical term—for example, “Describe a past routine · Imperfect indicative.”

### Item types by purpose

- **Interpretation:** Select the matching situation, timeline, referent or intended implication.
- **Formation:** Conjugate, complete agreement, or assemble a pronoun sequence.
- **Contrast:** Choose between two grammatical alternatives with different meanings.
- **Correction:** Repair a specified error; allow “already acceptable” where appropriate.
- **Transformation:** Change person, time, voice, viewpoint or register while preserving specified facts.
- **Production:** Write or say an answer to a communicative prompt.
- **Advanced analysis:** Explain ambiguity, preserve an intentional stylistic effect, or justify a register choice.

Use several item types across a module. Sentence assembly should have keyboard controls and not require dragging. Listening/speaking activities need text alternatives. Avoid grading arbitrary word order when multiple orders satisfy the intended information structure.

### Account progress and feedback

The Home practice-hours metric records active exercises and writing in the rolling last 30 days, including supported earlier-level review. Rule browsing and higher-level previews do not count. Duration is activity data only and never establishes learning or changes the profile level; see [Practice time](practice-time.md).

Store progress against stable, versioned rule IDs and the signed-in learner. Keep distinct evidence for recognition, form, choice and production. A grammar module is not “mastered” merely because a learner saw its explanation or passed one repeatable quiz.

Suggested learner-facing states: **Not checked, Learning, Practiced, Due for review, Demonstrated in use.** A later error should reopen the relevant skill without erasing past attempts. Allow reassessment and an “answer may also be valid” feedback mechanism.

On a failed save, retain the response and allow retry. A profile-level change should switch the displayed catalog without reassigning old evidence. Grammar production tasks can connect to Vocabulary and Conversation through shared rule IDs and familiar topic vocabulary.

## 15. Assessment and content-quality specification

This is the owner-adopted product rubric. It has not been validated as an examination standard. Set numerical thresholds only after teacher review and learner trials.

| Dimension       | Evidence needed                                                                            |
| --------------- | ------------------------------------------------------------------------------------------ |
| Form            | Correct morphology and syntax on more than one lexical example                             |
| Meaning         | Correct interpretation and a defensible choice in contrasting contexts                     |
| Independent use | A new response with no answer bank; evaluate only targets the prompt actually elicits      |
| Retention       | An unseen task after a delay, not an immediate replay                                      |
| Range           | Evidence across the module’s rule families rather than many near-duplicates of one pattern |
| Appropriacy     | Suitable region, register and interpersonal force where the objective requires them        |

**Launch quality requirements:**

- Every rule has an independently checked answer specification and a linguistic reviewer. At least one reviewer should be an experienced teacher of Spanish as a foreign/additional language (ELE).
- Each multiple-choice item has a rationale for every option. A distractor cannot merely be “not the author’s preferred answer.”
- Production rubrics list acceptable variants and separate target grammar from unrelated vocabulary or stylistic feedback.
- An item’s vocabulary, length and cultural assumptions should not make it substantially harder than the grammar objective.
- Hints, copied/repeated items, attempts and assisted answers remain visible in progress evidence.
- Learner trials examine confusing items, distractor behavior and agreement between human raters; revise cutoffs rather than treating an arbitrary percentage as a CEFR boundary.
- Automated text assessment is calibrated against teacher-scored responses before affecting high-confidence progress labels. Low-confidence or contested judgments must be revisable.
- Rule changes version the content and identify which prior evidence still applies; do not silently invalidate an account’s learning history.
- Test all six levels, all supported address paths, empty prerequisites, save/retry behavior, accessibility and level changes.

A rule can be ready before its entire level is ready. The interface must show truthful module availability; unpublished placeholders must not look like usable lessons.

## 16. Build sequence and deliverables

| Phase                              | Deliverable                                                                                                                    | Completion condition                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1. Curriculum ledger               | Convert these modules into atomic rule records; assign sources, prerequisites, reception/production expectations and variation | All 15 systems covered; each rule has a level rationale; teacher has resolved placement and scope disputes |
| 2. Content and progress foundation | Shared catalog, versioned rule IDs, account-owned progress, review history and content approval states                         | Changing level preserves evidence; unauthorized access and cross-account leakage tests pass                |
| 3. Reusable learning flow          | The full Check → Learn → Form → Choose → Use → Review cycle; accessible reference and feedback                                 | One complete vertical slice works end to end, including ambiguous answers and failed-save recovery         |
| 4. Foundational release            | Complete A1 and A2 rule coverage plus later-level prerequisite remediation                                                     | Published coverage audit passes; no implication that an incomplete higher-level catalog is complete        |
| 5. Independent-use release         | B1 and B2, including full modern tense/mood contrasts and clause systems                                                       | Teacher-reviewed production tasks and contextual answer keys for all high-risk contrasts                   |
| 6. Advanced release                | C1 and C2 discourse, register, nuance, editing and specialist recognition                                                      | Advanced work assesses meaningful choice; rare forms do not dominate                                       |
| 7. Calibration and maintenance     | Learner trials, rater agreement, error reports, reference updates and content versioning                                       | Progress labels have evidence; disputed items can be corrected without losing learner records              |

**First vertical slice:** Develop one coherent past-time path—A2 preterite, A2 imperfect, B1 viewpoint contrast, B1 pluperfect, B2 integrated narration—using the existing past-tense prototype. Pair it with a small A1 noun/agreement slice to confirm the architecture handles grammar beyond verbs. These slices validate the system; they do not replace complete level coverage.

Do not estimate effort by counting the 87 module headings as 87 lessons. Size the work after atomic rules, item families, production tasks, content review and assessment tooling are defined. Do not promise CEFR advancement after a fixed number of app sessions.

## 17. How the existing prototype fits

| Existing material                                                         | Curriculum destination       | Required next work                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| A1 essential verbs, present tense, agreement                              | A1-02, A1-04, A1-08, A1-09   | Separate individual objectives; add remaining foundations and independent use                       |
| A2 completed events, imperfect, direct objects                            | A2-05, A2-06, A2-09          | Broaden form coverage; add perfect, commands, indirect objects and sentence links                   |
| B1 tense choice, wishes, pronoun pairs                                    | B1-01, B1-05/06, B1-08       | Add prerequisites, more contexts, future/conditional/pluperfect and transfer                        |
| B2 hypotheticals, reported speech, connectors                             | B2-04, B2-07/08, B2-09       | Split the mixed starter exercise into coherent rule targets; complete subjunctive and voice systems |
| C1 stance, focus, relatives                                               | C1-01/03, C1-04, C1-05       | Distinguish earlier introductions from C1 refinement; expand argument and register tasks            |
| C2 register, concessions, compression                                     | C2-01/03, C2-08/10           | Replace recall-heavy checks with ambiguity, reformulation and editing evidence                      |
| Four-question lessons with three choices per question; visit-only results | Early interaction proof only | Retain answer locking/retry behavior, add varied tasks and durable rule evidence                    |

Implementation update, 12 September 2026: the first connected practice path now links seven focused rules from present-person agreement to integrated past narration, with separate starting checks, contextual practice, ungraded writing, and a review bank. Eleven rule lessons are available in total. This is partial curriculum coverage; independent teacher review and validated retention assessment remain pending. See [Grammar learning](grammar-learning.md) for the exact rule inventory and evidence behavior.

## 18. Teacher handoff and implementation decision

The teacher receives this plan, the atomic-rule ledger when authored, source references, sample explanations, all acceptable-answer specifications, and a coverage report. Their review should be able to change a level placement or rule boundary without requiring a page redesign.

The immediate implementation decision is to keep the current page as the working prototype while replacing its small flat lesson list with this curriculum architecture in stages. The next content milestone is the reviewed rule ledger and the two vertical slices above. This document outlines the entire intended experience; it does not mark unwritten lessons, unreviewed rules, or untested assessment claims as complete.

## Module-to-system index

This index supplies the app’s grammar-type filters. A module may belong to several systems. Names, scope, and expected evidence remain in the level tables above. This is an implementation index, not a change to level expectations.

| Module | Systems |
| --- | --- |
| A1-01 | G01 |
| A1-02 | G02, G03 |
| A1-03 | G03, G15 |
| A1-04 | G04 |
| A1-05 | G03, G05 |
| A1-06 | G03 |
| A1-07 | G01, G05 |
| A1-08 | G07 |
| A1-09 | G06 |
| A1-10 | G05, G13 |
| A1-11 | G01, G05 |
| A1-12 | G11 |
| A1-13 | G10, G12 |
| A1-14 | G15 |
| A2-01 | G02, G03 |
| A2-02 | G03, G05 |
| A2-03 | G04 |
| A2-04 | G07, G10, G13 |
| A2-05 | G07, G15 |
| A2-06 | G07 |
| A2-07 | G07, G10 |
| A2-08 | G10 |
| A2-09 | G05, G11 |
| A2-10 | G05, G13 |
| A2-11 | G09 |
| A2-12 | G11 |
| A2-13 | G01, G12 |
| A2-14 | G06, G13 |
| A2-15 | G15 |
| B1-01 | G07 |
| B1-02 | G07, G10 |
| B1-03 | G07 |
| B1-04 | G07, G14 |
| B1-05 | G08 |
| B1-06 | G08, G12 |
| B1-07 | G09, G05 |
| B1-08 | G05 |
| B1-09 | G10 |
| B1-10 | G08, G12 |
| B1-11 | G05, G12 |
| B1-12 | G12 |
| B1-13 | G13 |
| B1-14 | G02, G03, G04 |
| B1-15 | G14 |
| B1-16 | G11, G15 |
| B2-01 | G07 |
| B2-02 | G08 |
| B2-03 | G08, G10 |
| B2-04 | G07, G08, G12 |
| B2-05 | G08, G12 |
| B2-06 | G05, G08, G12 |
| B2-07 | G08, G12 |
| B2-08 | G08, G12 |
| B2-09 | G07, G14 |
| B2-10 | G06, G13 |
| B2-11 | G05, G13 |
| B2-12 | G06 |
| B2-13 | G10 |
| B2-14 | G02, G03, G04 |
| B2-15 | G01, G05, G14 |
| B2-16 | G11, G14, G15 |
| C1-01 | G08, G12 |
| C1-02 | G07, G14 |
| C1-03 | G08, G12 |
| C1-04 | G04, G05, G12 |
| C1-05 | G01, G14 |
| C1-06 | G02, G03 |
| C1-07 | G02, G03 |
| C1-08 | G04 |
| C1-09 | G10 |
| C1-10 | G13 |
| C1-11 | G11, G12 |
| C1-12 | G14 |
| C1-13 | G01, G03, G14 |
| C1-14 | G09, G14, G15 |
| C2-01 | G08 |
| C2-02 | G07, G14 |
| C2-03 | G08, G12, G14 |
| C2-04 | G01, G14 |
| C2-05 | G03, G05, G14 |
| C2-06 | G02, G03, G04, G15 |
| C2-07 | G05, G11, G13 |
| C2-08 | G10 |
| C2-09 | G13, G14 |
| C2-10 | G09, G14 |
| C2-11 | G07, G08, G15 |
| C2-12 | G14, G15 |

## Assessed vocabulary knowledge

**Owner-adopted, 12 September 2026.** Vocabulary uses **Known / Needs practice**, determined from scored unassisted recall and contextual use. **Not assessed** is the absence of a usable result, including uncertainty, assistance, or a dispute; it is not a failing score. Self-ratings remain historical and never become assessed knowledge automatically. Accepted regional variants and equivalent expressions must be recognized, and feedback must isolate the target skill.

Known is scoped to the expression and assessment at the exact active profile level. It does not establish broad CEFR proficiency, mastery, listening, or pronunciation. Recheck with fresh content after a delay to gather retention evidence. Preserve prior attempts when results change. AI assessments must be identified as such and allow a challenge that removes the disputed result from knowledge and gap counts. The first implementation is provisional and has not received independent teacher calibration; it must not drive high-confidence mastery, placement, or automatic level advancement. See [Vocabulary assessment](vocabulary-assessment.md) for the implementation and validation limits.
