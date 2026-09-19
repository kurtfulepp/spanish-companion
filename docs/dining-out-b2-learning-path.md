# Dining Out B2 learning path

## Status

This remains the first complete reviewed catalog implementation of the larger topic-learning model and applies to **Dining Out at B2**. On 19 September 2026, the owner approved reusing its direct-entry learning-card interaction across all published vocabulary topics. That shared interaction does not imply that the other topics yet have Dining Out's 120-expression reviewed catalog or five formal progression sets.

The content follows the adopted [educational rubric](educational-rubric.md), [vocabulary assessment rules](vocabulary-assessment.md), and B2 communicative expectations in the [A1–C2 curriculum](grammar-curriculum-plan.md). It is owner-adopted product content, not independently teacher-approved curriculum.

## Curriculum coverage

- 120 stable, curated expressions across the six existing Dining Out moments.
- Five sets of 24; every set contains four expressions from each moment.
- 96 B2 core expressions and 24 clearly labeled A2/B1 foundation reviews.
- One content version. Stable item IDs preserve assessment history when later versions are introduced.
- Optional AI-generated expansions remain outside the required catalog and cannot block or grant completion.

## Progression

The lowest set with expressions that have not received an independent result is the active set. A first independent check must demonstrate both recall and contextual use before an expression becomes **Known**. A result can also place the expression in **Needs practice**. Once all 24 expressions in a set have a usable result, the next set becomes available; one difficult expression does not block the rest of the curriculum. Identified gaps remain in the review queue.

A fresh successful check at least 24 hours later can mark an expression **Retained**. When its review date arrives it becomes **Due for review** and returns above the active set. A later failure changes it to **Needs practice** without deleting prior assessment evidence.

The topic displays **All expressions retained** only when all 120 required expressions are Retained and none are due. This is a revisable retention state, not permanent mastery or proof of B2 proficiency. A later missed review reopens the affected expression.

## Session model

The 120-expression catalog is the curriculum, each 24-expression set is a progression unit, and the working session contains no more than six expressions. A session includes at most two due reviews and two Needs practice items while new expressions remain, then fills the available places with new expressions from the active set. This keeps retrieval practice present without allowing a small number of difficult items to consume every session. Once the current set has no new expressions, the remaining capacity is used for additional review work.

The session selection is deterministic rather than random. Reopening the same unchanged state presents the same work, which makes the pilot reviewable and avoids implying that unseen expressions were completed.

## Entry and navigation

Selecting Dining Out opens the current six-expression session directly. There is no separate topic overview or mode-choice screen. The topic heading, catalog totals, set progression, and session explanation remain in a compact learning header.

Two secondary actions remain available without interrupting the default learning path:

- **Browse all expressions** opens a read-only reference grouped by the six Dining Out moments. Browsing and listening do not change progress.
- **Check what I already know** starts the independent topic diagnostic and returns to the learning session when closed.

This direct-entry model now applies to every published vocabulary topic. Topics without complete published set metadata open the same six-expression working session from their available exact-level expressions and omit the set-progress rail.

## Interaction rule

New cards begin with the English meaning and **Learn expression** as the primary action. Needs practice cards use **Learn again**. Learning reveals the Spanish, audio, usage guidance, and a moment-specific variation prompt. The learner can write a supported variation before comparing it with one possible version.

The **Listen** control sits beside the revealed Spanish expression so its audio target is explicit. It does not appear detached in the card header.

After learning, **Practice expression** opens one assisted recall response immediately. It does not pass through the topic assessment overview or add a second near-duplicate use response. Because the answer was just exposed, this activity cannot create Known or Retained evidence. Its result returns to the same learning session. **Check now** is reserved for a later independent response to a fresh contextual prompt; meaning/form and use are graded separately from that response.

When a previously learned expression becomes due, the unrevealed card may lead with **Check now** for an independent result while retaining **Review expression** as a secondary action. The header-level **Check what I already know** action retains the whole-topic overview and queue.

## Storage

Supabase stores the versioned set definitions and curated item metadata. Existing signed, immutable vocabulary assessment receipts remain the sole source of learner knowledge evidence. No client-writeable mastery field is introduced.

The database enforces exact profile-level reads through row-level security. Foundation items are B2-path items with an `introduced_level` marker; they are not a broad B1–B2 profile range.

## Verification

Applied to Supabase project `fcgvbfohqplckorwkusj` on 13 September 2026. The migration completed in a transaction and its built-in assertions confirmed 120 items, 24 foundations, and five complete sets. The frontend now selects a six-expression session from that unchanged catalog and keeps supported study separate from independent assessment. No new table, synthetic assessment result, or learning evidence is introduced by this refinement. The hosted application has not been republished by this change.
