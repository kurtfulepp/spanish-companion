# Level personalization

KurtES uses `public.profiles.proficiency_level` as the single active CEFR level. Supported values are A1, A2, B1, B2, C1, and C2. A null level blocks curated and generated learning content until the learner chooses a level or accepts an assessment result.

## Runtime behavior

- `LearnerProfileProvider` loads the authenticated profile once and shares it across learning routes.
- Profile saves and assessment results update Supabase first, then update the shared client state.
- Vocabulary routes refetch exact-level items when the active level changes.
- Grammar and Conversation select an exact-level content configuration and reset route-local work when the configuration changes.
- Guided lessons query only the active level. There is no B2 fallback.
- Photo vocabulary reads the level from the authenticated server-side profile. It does not trust a browser-supplied level. A change during review invalidates the old suggestions and requires a new analysis.
- Custom lists remain accessible after a level change. Photo lists record the level at which they were generated.

## Database enforcement

Migration `20260905180000_make_learning_level_specific.sql` adds `vocabulary_items.cefr_level`, classifies the existing Dining Out material, adds C2 material, supplies a published lesson for every supported level, and records `custom_vocabulary_lists.cefr_level` for generated lists.

Row-level policies restrict curated vocabulary and published lessons to the authenticated learner's active profile level. `start_lesson_attempt` repeats the level check server-side so a client cannot start a published lesson from another level by submitting its ID directly.

Progress is never deleted when a level changes. `user_vocabulary_progress`, lesson attempts, assessment history, and custom-list progress retain their original records.

## Release checks

1. Apply the level-personalization migration to the same Supabase project used by the app.
2. Run `supabase/tests/level_specific_learning.sql` in a rollback-capable database session.
3. Verify one account at each of the six levels.
4. Change a signed-in account's level from Profile on Vocabulary, Grammar, Conversation, Dining Out, and Photo Vocabulary.
5. Confirm the visible content changes without signing out or refreshing and prior progress remains stored.

## Applied checkpoint

On 2026-09-05, the migration was applied to Supabase project `fcgvbfohqplckorwkusj`. The rollback-only level test completed successfully. An authenticated B2 browser session then returned six B2 Dining Out expressions through RLS, loaded profile-owned custom lists without a schema error, and rendered the B2 Grammar, Conversation, and Photo Vocabulary states. No paid photo-recognition request was made.
