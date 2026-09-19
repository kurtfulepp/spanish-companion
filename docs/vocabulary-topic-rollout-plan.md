# Vocabulary topic learning rollout plan

## Status

This plan is ready for use after the owner reviews and approves the Dining Out B2 direct-entry pilot. It does not authorize changing another topic, publishing content, or treating generated content as reviewed curriculum.

## Topics remaining

1. Around the City
2. Travel
3. Social Life
4. Home & Daily Life
5. Work & Meetings
6. Feelings & Relationships

## Product model to reuse

- A topic card opens the current learning session directly.
- The default session contains no more than six expressions.
- Due reviews and Needs practice items are mixed with new material without taking over the session.
- **Browse all expressions** is a read-only reference grouped by the topic's six moments.
- **Check what I already know** is a secondary independent diagnostic.
- Browsing and assisted study do not create Known or Retained evidence.
- Complete delayed evidence is labeled **All expressions retained**, not mastery or verified proficiency.

## Implementation sequence

### 1. Approve the Dining Out pilot

Review desktop and mobile entry, session clarity, study interaction, diagnostic return, full-expression browsing, and progress language. Record any change in the design system and Dining Out documentation before extracting shared code.

### 2. Extract the shared topic-learning experience

Replace Dining Out-specific presentation wiring with a shared component driven by topic ID, exact CEFR level, moments, versioned learning sets, and expression metadata. Keep topic artwork and contextual surface colors registered in the existing illustration and topic libraries.

The shared component activates only when a complete, validated catalog exists for the learner's exact active level. It must never substitute B2 content for another profile level. Topics without a complete catalog retain their current experience.

### 3. Build and review level-specific catalogs

For each topic and exact CEFR level being released:

- define six real-world moments and observable communicative purposes;
- create versioned, stable expression IDs and progression sets;
- include vocabulary, collocations, grammatical frames, register, and accepted regional variants appropriate to that level;
- label prerequisite review separately from new level content;
- keep optional AI expansion outside required progression and retention totals;
- run content, linguistic, and independent teacher review before calling the catalog fully reviewed.

Begin with B2 catalogs for the six remaining topics so the current B2 experience can be evaluated consistently. Add other exact levels as separately reviewed catalogs; do not publish a broad B1-B2 substitute.

### 4. Roll out in three review waves

1. Around the City and Travel
2. Home & Daily Life and Social Life
3. Work & Meetings and Feelings & Relationships

After each wave, verify progression, diagnostic ordering, browsing, audio, mobile layout, exact-level filtering, and retained evidence before starting the next wave.

### 5. Database and security checks

- Add versioned learning-set and item metadata through reviewed migrations.
- Preserve stable IDs and prior assessment receipts.
- Enforce exact-level authenticated reads through row-level security.
- Assert expected topic, moment, set, item, and prerequisite counts in SQL tests.
- Do not add client-writeable mastery or completion fields.

### 6. Release gate

Run targeted learning-path and assessment tests, TypeScript, lint, production build, authenticated desktop/mobile browser QA, and a production configuration review. Publishing remains a separate explicit action.
