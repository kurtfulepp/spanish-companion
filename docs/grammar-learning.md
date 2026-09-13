# Grammar learning

Grammar implements the owner’s [educational rubric](educational-rubric.md) and [complete curriculum](grammar-curriculum-plan.md). The curriculum is the coverage standard; the available lessons are its first implementation slice.

## Curriculum browser

The runtime catalog contains all 87 modules and 15 grammatical systems. The browser opens at the exact profile level and lists all six levels. Earlier levels support practice review; higher levels expose their complete module outlines and read-only rule explanations, without changing the active profile or offering an unsavable attempt. Filters cover grammatical system, text, and available rule lessons. A missing profile level uses the shared level picker.

Each of the 87 modules shows a plain-language “when you use it” description directly beneath its title, including higher-level previews. The descriptions explain practical situations and are included in text search. Expanding a module reveals its grammar types, full rule scope, and observable objective. “Outline” means that rule lessons are still being developed. An available lesson covers one rule within its module, not the entire module or level. The 18 earlier sample lessons remain accessible under More practice; their results are explicitly visit-only and do not enter the rule ledger.

`docs/grammar-curriculum-plan.md` owns module names, practical use descriptions, scope, objectives, and the module-to-system index. Run `node scripts/generate-grammar-curriculum.mjs` after editing that document. The generated `lib/grammar-curriculum.generated.ts` must match it exactly; the parity test detects drift.

## Rule lessons

| Level | Rule | Scope and rationale |
| --- | --- | --- |
| A1 | A1-08.present-person | Regular present person agreement as a foundation for past conjugation; explicit subject and regional address notes. |
| A2 | A2-05.regular-preterite | Regular preterite person endings and meaningful written accents. |
| A2 | A2-05.irregular-preterite | Frequent ir/ser, tener, estar, and hacer forms, including contextual disambiguation of ir/ser. |
| B1 | B1-01.past-viewpoint | Imperfect background versus bounded preterite events, including bounded repetition and long events. |
| B2 | B2-01.past-narration | Integrates narrative viewpoint and anteriority. This is only the narrative portion of B2-01, not its entire indicative inventory. |
| A1 | A1-04.agreement | Gender/number agreement in familiar descriptions, including a common adjective with one gender form. Builds on noun gender and articles. |
| A2 | A2-06.imperfect | Regular imperfect forms, a frequent irregular, and past routines. Full past-viewpoint contrasts remain in B1. |
| B1 | B1-02.earlier-past | Pluperfect formation and anteriority to a past reference point, using previously introduced participles. |
| B2 | B2-04.past-counterfactual | Past condition and past result, accepting both -ra and -se in the condition. Mixed timelines remain outside this rule. |
| C1 | C1-04.cuyo | Possessive relative agreement, prepositions, reference, and formal reformulation. |
| C2 | C2-03.open-concession | Repeated-subjunctive constructions with explicit paraphrase and stance analysis. This refines a construction also present in the PCIC C1 inventory; it is not a claim that first exposure must wait until C2. |

These are authored drafts, version 1, awaiting independent teacher review. Each record has a source, prerequisite modules, explanatory examples, a meaning contrast, variation/restriction notes, accepted answers, and an original-writing task. References include the [PCIC A1–A2 inventory](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm), [B1–B2 inventory](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_b1-b2.htm), [C1–C2 inventory](https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_c1-c2.htm), and [RAE–ASALE on cuyo](https://www.rae.es/dpd/cuyo).

The four standalone lessons retain Learn → Practice → Write → Review. The seven path lessons use the extended sequence below. Four checks per lesson provide recognition, typed formation, and contextual-choice evidence. Answers lock after checking. Typed answers normalize whitespace, case, and Unicode composition while preserving meaningful accents. Form-specific instructions distinguish a requested construction from other grammatical alternatives.

Writing has no answer bank before submission. Learners use a self-review checklist and may compare an example after finishing. Writing is retained as submitted text, not automatically graded or certified independent accuracy. Repeating the same lesson is additional practice, not a fresh retention assessment. No score confers mastery or CEFR placement.

## Connected path: Tell a story in the past

**Implemented 12 September 2026.** Seven steps connect A1-08.present-person → A2-05.regular-preterite → A2-05.irregular-preterite → A2-06.imperfect → B1-01.past-viewpoint → B1-02.earlier-past → B2-01.past-narration. Five lessons are new; two existing version-1 lessons retain their original questions, keys, and evidence. The path is teaching guidance, not a hard prerequisite gate. Required background is documented on each rule; participles for B1-02, for example, remain in the wider curriculum.

Each path lesson includes two starting questions, a contrasting pair with explanation, the rule, four practice checks covering recognition/formation/meaning, original writing with a checklist, and review of the attempt. First answers lock after checking. Starting-check scores stay separate from main practice and are saved only with a completed attempt. There is no placement or mastery inference from either set. All content remains an authored draft; PCIC sources were consulted on 12 September 2026, and independent teacher review remains pending.

A separate review bank has three different questions and a new writing prompt per rule. It opens directly into practice before explanations. Subsequent uses repeat the same review bank and are explicitly further practice, not unseen retention assessment. Scores always use the submitted bank's denominator. The review is available after a saved attempt and suggested after three days; that interval is an initial product scheduling choice, not a calibrated educational threshold or a notification automation.

Recommendations use the latest saved evidence for the current rule version: first revisit an eligible step with errors (naming the affected dimension), then a review due after three days, then an untried current-level step, then an earlier foundation. Recommendations do not use writing as a grade. Unknown saved-progress state suppresses personal recommendations. Every eligible step remains selectable, including before its suggested prerequisite. A1 learners see later path steps as read-only previews; B2–C2 learners can practise/review all seven. The full A1–C2 curriculum remains available below the path.

`lib/grammar-past-content.ts` contains the five new rules and all seven supplemental check/notice/review specifications; `lib/grammar-learning-path.ts` owns sequencing and recommendation behavior. Other curriculum modules and broader exercise formats remain future coverage.

## Account progress

`POST /api/grammar` authenticates the account, reads its actual profile level, validates a complete versioned rule submission, and saves raw answers, writing, and self-review. It does not accept client-supplied scores or ownership. Attempt UUIDs make retries idempotent: the first immutable submission wins. Network/storage failures leave the attempt visible with a retry action and never report it saved.

`GET /api/grammar` returns the most recent attempt for each current rule version; repeated work on one rule cannot push another rule’s evidence out of a fixed-size history window. Scores are derived from the matching answer key. The existing answers JSON stores stable question IDs: the original practice group, the practice group plus the complete starting-check group, or the complete review group. Partial or mixed banks are rejected. The server derives lesson/review mode and separate starting scores; no schema change or migration is required. Old primary-only attempts remain valid. The UI displays the latest attempt per rule, with its bank identified; earlier main and review attempts remain in the database. Historical versions remain in the database; this first UI displays current-version evidence only. Account and profile-level changes remount the workspace and reload saved evidence. Leaving a lesson before saving ends its unfinished in-memory attempt.

The Supabase migration `20260907180000_create_grammar_rule_attempts.sql` creates append-only account-owned evidence. RLS permits own reads and own inserts at the current or earlier profile level, denies cross-account access, and preserves earlier evidence after level changes. Clients cannot update/delete attempts or set their evidence timestamps. The stored answers and self-ratings are practice evidence rather than tamper-resistant examination results.

**Applied 7 September 2026** to project `fcgvbfohqplckorwkusj`. The complete migration and security checks first passed in a rollback-only transaction; the migration was then applied separately and the table’s existence confirmed. No test identities or test submissions were retained. The hosted frontend has not been deployed by this change.

## Verification and remaining coverage

- `node --test tests/grammar-api.test.mjs tests/grammar-curriculum.test.mjs tests/grammar-practice.test.mjs tests/grammar-learning-path.test.mjs tests/level-content.test.mjs`
- `npx tsc --noEmit`, focused lint, and `npm run build`.
- `supabase/tests/grammar_rule_attempts.sql`: rollback-only owner access, duplicate identity, immutable records, restricted timestamps, level eligibility, validation, cross-account isolation, and preserved earlier-level review.

The full lesson inventory, independent linguistic review, broader contextual task banks, graded production, validated delayed retention tasks, and an archive UI for historical rule versions remain future work. On 12 September 2026, all 78 automated tests, TypeScript, lint, and the production build passed. Signed-in browser verification covered the B2 path from starting check through written results, answer locking, separate score totals, C1 read-only preview, and expanded-path overflow at 390px. Test writing was not saved to the learner account. Save/retry and review-bank round trips were verified through API fixtures; a new live database write and a full browser review-set attempt were not exercised. No authentication bypass was used.
