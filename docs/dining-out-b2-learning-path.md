# Dining Out B2 learning path

## Status

This is the first reviewable implementation of the larger topic-learning model. It applies only to **Dining Out at B2**. Other topics and levels continue to use the existing topic experience until the owner reviews this pilot and explicitly approves a wider rollout.

The content follows the adopted [educational rubric](educational-rubric.md), [vocabulary assessment rules](vocabulary-assessment.md), and B2 communicative expectations in the [A1–C2 curriculum](grammar-curriculum-plan.md). It is owner-adopted product content, not independently teacher-approved curriculum.

## Curriculum coverage

- 120 stable, curated expressions across the six existing Dining Out moments.
- Five sets of 24; every set contains four expressions from each moment.
- 96 B2 core expressions and 24 clearly labeled A2/B1 foundation reviews.
- One content version. Stable item IDs preserve assessment history when later versions are introduced.
- Optional AI-generated expansions remain outside the required catalog and cannot block or grant completion.

## Progression

The lowest set with unchecked expressions is the active set. A first independent check must demonstrate both recall and contextual use before an expression becomes **Known**. Known expressions leave active practice, remain available in a collapsed drawer, and receive a delayed review date. When all 24 expressions in a set are Known, the next set becomes active automatically.

A fresh successful check at least 24 hours later can mark an expression **Retained**. When its review date arrives it becomes **Due for review** and returns above the active set. A later failure changes it to **Needs practice** without deleting prior assessment evidence.

The topic displays **Mastered for now** only when all 120 required expressions are Retained and none are due. This is a revisable product state, not permanent knowledge or proof of B2 proficiency. A later missed review reopens the affected expression.

## Interaction rule

Active cards begin with the English recall prompt and do not expose the Spanish answer. **Check now** begins an unassisted assessment. **Study answer** reveals the Spanish, example, note, and audio; any check started after that reveal is explicitly treated as assisted practice and cannot create Known or Retained evidence.

## Storage

Supabase stores the versioned set definitions and curated item metadata. Existing signed, immutable vocabulary assessment receipts remain the sole source of learner knowledge evidence. No client-writeable mastery field is introduced.

The database enforces exact profile-level reads through row-level security. Foundation items are B2-path items with an `introduced_level` marker; they are not a broad B1–B2 profile range.

## Verification

Applied to Supabase project `fcgvbfohqplckorwkusj` on 13 September 2026. The migration completed in a transaction and its built-in assertions confirmed 120 items, 24 foundations, and five complete sets. The authenticated local app then read 120 items through RLS, rendered Set 1 with four expressions in each of six moments, revealed study content without recording evidence, and reported no browser errors. No synthetic assessment result was saved. The frontend pilot remains local until the owner reviews it; the hosted application has not been republished by this change.
