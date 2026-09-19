# Vocabulary topic learning rollout plan

## Status

The owner approved the shared Dining Out direct-entry interaction for every published topic on 19 September 2026. The common learning-card flow is implemented independently of catalog size. The content work below remains the plan for giving each topic a complete reviewed catalog; personal generated expressions are not reviewed curriculum.

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

### 1. Approve the Dining Out pilot — complete

Review desktop and mobile entry, session clarity, study interaction, diagnostic return, full-expression browsing, and progress language. Record any change in the design system and Dining Out documentation before extracting shared code.

### 2. Extract the shared topic-learning experience — complete

Dining Out-specific presentation wiring has been replaced with a shared component driven by topic ID, exact CEFR level, moments, optional versioned learning sets, and expression metadata. Topic artwork and contextual surface colors remain registered in the existing illustration and topic libraries.

The shared component always enforces the learner's exact active level and never substitutes B2 content for another profile level. Complete catalogs show formal set progression. Topics without one use the same Learn → Practice → later independent Check flow over their available personal exact-level expressions, without claiming curriculum completion.

Practice uses one assisted recall response after study. The later independent check uses one fresh contextual response and reports meaning/form and contextual use separately. Close accent or spelling errors show character-level repairs. Shared result surfaces distinguish correct (turquoise), incorrect (coral/red), and uncertain (gold) with explicit text labels.

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
