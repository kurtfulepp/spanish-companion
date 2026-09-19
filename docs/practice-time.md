# Practice time

Owner-adopted 13 September 2026: the Home tile shows active practice hours in the preceding 720 hours, across the account's levels and devices. Existing attempts have no reliable duration and are not backfilled. Duration is an activity estimate, never evidence of mastery or CEFR progression.

Count vocabulary recall/use assessments (including personal lists), grammar starting checks, exercises and writing, and active conversation sessions. Exclude browsing, rule explanations, curriculum previews, results, and AI/service waits. The timer runs only while a practice surface is active, visible and focused. Trusted keyboard, pointer, input or scroll events renew a 60-second activity window. This allows thinking and short speaking/listening turns; the app cannot know whether someone is paying attention. A suspended timer never credits its elapsed gap.

Send recent timestamp intervals approximately every 15 seconds and flush on hiding, blur, unmount or page exit. Retry transient failures in memory while mounted, for up to five minutes; show a save warning. A crash, offline exit or rejected browser delivery can lose unsaved time. No keystroke contents or answers are collected by this timer. Hours are rounded down to two decimal places, with `<0.01` for a positive total below 36 seconds.

Migration: `supabase/migrations/20260913120000_practice_time.sql`. Account-owned intervals are readable through RLS. Direct client writes are blocked. An authenticated function validates each recent interval (up to 30 seconds), verifies exact current level or earlier grammar review, and serializes merging for that learner. Retries and overlapping tabs/devices cannot duplicate time. Client activity is not tamper-proof; duration must not grant rewards or progression. Only timestamps and ownership are retained, until account deletion; no activity breakdown or answers are stored here.

The summary function clips merged intervals to database time minus 720 hours, independent of local timezone and daylight-saving changes. Missing storage or read failures produce unavailable, not zero.

## Verification

The migration was applied to the production Supabase database on 13 September 2026. The local dashboard successfully read its initial zero total. PostgreSQL tests in an isolated PGlite database passed for duplicate retries, interval overlap, account isolation, direct-write restrictions, level eligibility, bounded reports, and the exact rolling cutoff. Node tests cover timer idle/suspension behavior, request validation, authentication/account changes, failed saves and unavailable dashboard data. Build, lint and type checking passed. No synthetic practice intervals were saved to the learner's account. The updated application has not been published.
