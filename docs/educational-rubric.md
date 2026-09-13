# KurtES educational rubric

**Authority:** Adopted by the product owner on 7 September 2026.\
**Scope:** All KurtES learning content, practice, feedback, assessment, personalization, and educational AI behavior.\
**Status:** Canonical product standard. Independent teacher review and validation of individual lessons remain separate requirements.

## Source of truth

The [Spanish grammar curriculum and experience plan](grammar-curriculum-plan.md) is the full, owner-adopted curriculum reference: 15 grammatical systems, 87 planned modules across A1–C2, verb-form coverage, prerequisite paths, learning evidence, and content-review requirements. Preserve that document in full; do not replace it with a short summary or the current prototype lesson catalog.

This rubric establishes how that curriculum governs the whole app. Read both documents before creating or changing educational content, exercises, assessment, feedback, learning progression, or AI instructions. Consult the relevant level and rule families when implementing a specific feature.

The curriculum's grammar inventory is comprehensive at the level of key systems and rule families. Vocabulary, listening, speaking, reading, writing, interaction, and sociocultural competence also require their own content specifications. Apply the same educational principles to those areas without claiming that a grammar inventory alone defines complete Spanish proficiency.

## Core standards

1. **Use one exact active CEFR level.** A1, A2, B1, B2, C1, or C2 comes from the shared learner profile. A missing level requires selection; never substitute another level silently. Preserve earlier progress when the level changes.
2. **Teach cumulatively.** Distinguish first exposure, systematic explanation, independent production, and later refinement. Earlier rules remain relevant at higher levels. Learners can revisit prerequisites without changing their profile level. The complete A1–C2 curriculum must remain discoverable: higher-level outlines and rule explanations may be previewed explicitly without changing the active profile or recording out-of-level practice.
3. **Organize by grammatical system and rule.** Use the curriculum's stable systems and module identifiers. Define a specific construction or contrast and observable objective before writing a lesson. Existing sample lessons do not define the scope of a level.
4. **Teach form, meaning, and use together.** Give a useful explanation, contextual examples, important restrictions, and the reason a competing construction would mean something different.
5. **Track four kinds of evidence separately:** recognition, formation, contextual choice, and independent use. Retention requires later evidence. Practice completion alone is not mastery.
6. **Keep language and tasks appropriate to the level.** Vocabulary load, sentence complexity, instructions, and cultural assumptions should not obscure the target skill. A familiar formula can precede full analysis of its grammar; label that scope accurately.
7. **Respect regional and register variation.** Teach a consistent productive variety and recognize legitimate alternatives. Do not treat vos or a regional tense choice as inherently advanced or wrong. Attach region/register information where it affects evaluation.
8. **Judge the intended meaning fairly.** Provide sufficient context for a unique answer, or accept and explain legitimate alternatives. Distinguish grammatical error, meaning mismatch, register mismatch, and optional stylistic improvement.
9. **Avoid false shortcuts.** Do not present ser/estar as simply permanent/temporary, time expressions as automatic tense triggers, or every se as reflexive. Use the curriculum's contrast and misconception requirements.
10. **Keep proficiency claims proportionate to evidence.** Grammar practice, a short quiz, or self-rating does not establish overall CEFR proficiency. Numerical assessment thresholds require review and calibration.
11. **Make content auditable.** Published rules need source references, accepted-answer specifications, prerequisite and level rationale, and documented linguistic/teacher review. Owner adoption of the curriculum is not independent teacher approval or Cervantes accreditation.
12. **Preserve learning identity.** As durable progress is implemented, use account-owned, versioned rule evidence. Revisions and level changes must not silently erase valid learning history.

## Curriculum preview rule

**Owner-adopted, 7 September 2026. Applies across the app wherever a curriculum or level browser is provided.**

Keep all six CEFR levels discoverable. The learner’s profile level determines active practice; the level being browsed determines which curriculum requirements and explanations are visible.

| Browsed level | Experience |
| --- | --- |
| Below the profile level | Label as **Review**. Allow earlier learning and prerequisite practice where that learning area supports it. Preserve existing activity eligibility requirements. |
| Equal to the profile level | Label as **Your level**. Offer the normal learning and practice experience. |
| Above the profile level | Label as **Curriculum preview**. Show module requirements, objectives, and available rule explanations as read-only content. Do not start practice or record learning evidence at that higher level. |

Browsing a preview must not change the profile, unlock practice, award completion or mastery, or modify saved progress. To practice at a higher level, the learner must explicitly change their level through Profile or accept an assessment result. Enforce practice eligibility on the server as well as in the interface. If the profile has no level, retain the existing level-selection requirement.

Grammar is the first implementation of this rule. Apply it consistently when adding curriculum browsing to other learning areas; this adoption does not claim that those areas already provide preview interfaces.

## Application across learning areas

| Area | How the rubric applies |
| --- | --- |
| Grammar | Use the full curriculum as the coverage baseline. Split modules into teachable rule objectives with explanation, contrast, practice, independent use, and review. |
| Vocabulary | Teach words and expressions with appropriate grammatical frames: gender/article, agreement, verb complements, prepositions, collocations, and register where relevant. Keep example grammar appropriate to the level and identify useful formulas whose analysis comes later. |
| Conversation | Select communicative tasks and target rules from the active level. Use realistic turns to elicit those rules; provide focused feedback that preserves the learner's intended meaning. Earlier prerequisites can be reviewed explicitly. |
| Listening and reading | Match grammatical and lexical demands to the objective. Distinguish recognition of unfamiliar structures from an expectation to produce them. Rare advanced forms belong primarily in appropriate reading/listening contexts. |
| Writing and speaking | Include original production without an answer bank. Assess the targeted construction, communicative success, and relevant register; separate unrelated mistakes from the current objective. |
| Assessment and placement | Sample multiple skills and rule families. Separate form, interpretation, production, and retention evidence. Describe scope and uncertainty honestly; do not infer a full level from a grammar-only score. |
| Guided lessons and review | Use prerequisites and rule-specific evidence to choose work. Revisit weak skills with unfamiliar contexts; an immediate repeat is assisted practice rather than fresh retention evidence. |
| Photo vocabulary and custom lists | Apply the rubric to generated terms, examples, and practice. Preserve learner-owned lists across level changes. Do not rewrite user-entered content or assume a saved list proves level mastery. |
| AI-generated educational content | Ground generation in the relevant approved level, rule scope, accepted varieties, examples, and assessment criteria. Validate outputs against those constraints; generation itself does not confer editorial approval. |
| Profile and progress | Retain one shared active level, preserve previous evidence, and make learning labels reflect what was actually demonstrated. |

## Implementation requirements

- Keep the complete curriculum in one canonical document. Link to it from feature documentation rather than copying its level tables into competing sources of truth.
- When building a content catalog, derive its system/module mapping from the curriculum and give atomic rules stable IDs. Record intentional departures and their pedagogical rationale.
- When creating or changing educational generation or grading prompts, supply the relevant rubric and curriculum constraints explicitly. A Markdown document stored in the repository is not automatically available to a running model.
- Prefer targeted, versioned rule context over blindly inserting the entire curriculum into every request. Ensure the same rule identity and accepted variants inform both generation and grading.
- Check the relevant reference material when authoring or revising claims. Preserve the distinction between CEFR proficiency descriptions, PCIC curriculum guidance, and RAE–ASALE grammatical/usage references.
- Keep the [design system](design-system.md) as the visual and voice authority. This rubric is the educational authority; the two standards apply together.
- Update the rubric, detailed curriculum, affected structured content or prompts, and relevant checks together when the owner changes an educational standard. Preserve unrelated work.

## Adoption and implementation status

This adoption makes the curriculum a persistent project requirement for future work across the app. It does not certify that existing lessons, databases, generation prompts, or progress logic already implement every requirement. Track implementation gaps against the curriculum rather than treating prototype behavior as the standard.

Grammar now derives its 87-module catalog from the full curriculum and includes eleven versioned rule lessons, including a seven-step past-narration path with separate recognition, formation, contextual-choice, and ungraded writing evidence. Account-owned rule progress is implemented; the 18 earlier sample lessons retain visit-only results. Complete rule coverage, independent lesson review, graded production, validated retention assessment, and comprehensive runtime prompt alignment remain implementation work governed by this rubric. See [Grammar learning](grammar-learning.md) for the current scope and verification.

## Maintenance

The owner may revise the educational standard. Record the date, changed rule or scope, and affected learning areas; then update the canonical curriculum and its implementations. Keep source-backed judgments, product choices, teacher review, and learner validation distinguishable.

**7 September 2026:** Owner adopted the complete grammar curriculum as the educational foundation for all KurtES learning areas. Project instructions now require this rubric and the full curriculum for educational work.

**7 September 2026:** Owner clarified that C1 and C2 grammar requirements must remain visible in the level dropdown. All six curriculum levels are now discoverable; previews remain distinct from the learner’s active practice level.

**7 September 2026:** Owner explicitly adopted the higher-level curriculum preview behavior as a reusable app-wide rule, documented above.

## Assessed vocabulary knowledge

**Owner-adopted, 12 September 2026.** Vocabulary uses **Known / Needs practice**, determined from scored unassisted recall and contextual use. **Not assessed** is the absence of a usable result, including uncertainty, assistance, or a dispute; it is not a failing score. Self-ratings remain historical and never become assessed knowledge automatically. Accepted regional variants and equivalent expressions must be recognized, and feedback must isolate the target skill.

Known is scoped to the expression and assessment at the exact active profile level. It does not establish broad CEFR proficiency, mastery, listening, or pronunciation. Recheck with fresh content after a delay to gather retention evidence. Preserve prior attempts when results change. AI assessments must be identified as such and allow a challenge that removes the disputed result from knowledge and gap counts. The first implementation is provisional and has not received independent teacher calibration; it must not drive high-confidence mastery, placement, or automatic level advancement. See [Vocabulary assessment](vocabulary-assessment.md) for the implementation and validation limits.
