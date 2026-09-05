# Custom vocabulary: practice QA and security review

Verified locally on 2026-09-05 against the configured Supabase project. This report covers the integrated photo, profile-list, and practice changes. It is not a claim of production deployment or a comprehensive penetration test.

## Implemented behavior

- Each custom list tile and its word dialog offer Practice list.
- The practice overview shows total, practiced, and confident word counts. Practice remaining excludes confident words; Review all includes them.
- English appears first. Reveal Spanish exposes the accepted translation, then Needs practice / I knew it records the learner’s self-assessment.
- Each answer is saved before advancing. Failed saves retain the revealed card and allow retry; an in-flight guard blocks duplicate clicks. No AI call is used for practice.
- Progress is stored by profile, list ID, and immutable word index, with status and last-review timestamp. There are no fabricated correct-answer counts or claims of verified mastery.
- When all words are confident, the list is automatically completed. A later Needs practice answer reopens it. The manual completion control remains available. Manual completion does not invent word ratings; restore retains all progress.
- Fresh page loads and tab refocus retrieve account progress. A session restarts from the words still needing practice, not an unsaved in-memory card position.
- Deletion clears the list text and deletes its word progress. A minimal list tombstone prevents stale browser imports from restoring deleted content.

## Browser checks performed

Used an authenticated desktop browser at localhost:3000, 1280px-wide viewport.

1. Uploaded the bundled synthetic kitchen image through the actual file chooser; submitted one real recognition request. It returned 15 suggestions.
2. Clear all disabled Preview list. Selected two words and edited the English text; accepted preview retained those edits and released the photo preview.
3. Named and saved a temporary Kitchen practice QA list. Its account tile showed two words, zero practiced/confident, and a working Practice list link; no FPO label was applied to real results.
4. Checked the recall-first card, answer reveal, focus movement to the active word, and successful save before moving to the second word. Inspected the rendered card and adjusted the progress-bar styling to shared brand colors.
5. Exited after one answer. Opened the same list in a fresh browser tab: it loaded one practiced/confident word from Supabase and offered only the remaining word.
6. Rated the remaining word Needs practice; the summary showed one of two confident. Practiced it again and chose I knew it; the summary showed two of two confident and automatic completion.
7. Returned to Vocabulary and opened Completed. The tile retained two practiced/confident words. Restored it, verified retained counts, and manually completed it again.
8. Deleted the temporary QA list via its named confirmation. A fresh request to its practice URL showed List unavailable with retry and return navigation. No QA list remains active.
9. Checked the unavailable page had no horizontal overflow at the tested desktop width.

A fresh tab verifies retrieval from account storage independently of the earlier React state. It is not a physical second-device test.

## Automated and database checks

- All 30 Node tests passed. Coverage includes raw-photo request validation, auth/cross-site rejection, quotas, sanitized provider failures, empty and malformed output, text-only list serialization, migration preservation, duplicate retry protection, owner scoping, pagination, practice queue selection, fresh progress reconstruction, and review failure handling.
- TypeScript and focused lint passed. The production build passed with the existing Vite JSON-import warning.
- Applied `20260905020000_create_custom_vocabulary_progress.sql`.
- Ran `supabase/tests/custom_vocabulary_practice.sql` in a rollback-only transaction against Supabase. Passed first review, retry without duplicate word count, remaining-word status, automatic completion, manual restore retaining progress, reopening, invalid index/status rejection, cross-user read/write rejection, deleted-list rejection, deletion cleanup, anonymous RPC denial, and denial of direct progress/count writes. Test rows were rolled back.
- The earlier rollback-only list-storage suite passed owner CRUD behavior, import idempotency, forbidden photo fields, RLS isolation, and deletion tombstone behavior.

## Security review

No blocking issue was found in the reviewed application code and tested database authorization boundaries.

- Public routes remain covered by the existing auth proxy; database authorization is enforced independently through RLS and authenticated RPC checks.
- The review RPC derives the owner from auth.uid(), validates status/index and the active list, and locks the list row before changing progress and completion together. Clients cannot supply a different owner or update the aggregate counters directly.
- Progress writes are RPC-only. Anonymous execution and direct table writes are revoked. All new functions use an empty search path and qualified table names; cleanup is restricted and tied to the deleted row.
- Accepted text is rendered through React text nodes. The new code does not use raw HTML, dynamic code evaluation, or log words/photos/credentials.
- List payloads contain accepted text only. Photos remain transient; existing no-store Responses requests, server-only key handling, and photo quotas are preserved.
- Confirmed .env.local is Git-ignored and scanned the client build against the actual configured OpenAI key without printing it: no match.
- The current CSP has an existing unsafe-inline script allowance; the new code does not widen it. Nonce-based CSP hardening would be separate app-wide work.
- Exactly one paid recognition request was used for this QA journey. Practice, saves, and security checks made no OpenAI calls. No budget or billing setting was changed.

## Limits and remaining validation

- Following explicit user approval on 2026-09-05, the live `npm audit --json` scan completed successfully (exit 0). npm reported zero known vulnerabilities across all severity levels in the installed dependency tree, including development dependencies. This resolves the earlier approval block. No package versions were changed. An advisory scan is point-in-time coverage of known vulnerabilities, not a guarantee that dependencies contain no security defects.
- Native camera prompts, real iOS/Android/Windows devices, physical cross-device testing, screen-reader testing, browser zoom/mobile emulation, and offline browser fault injection were not exercised here. Error behavior was checked in automated tests and source review, not by claiming simulated network tests ran in the browser.
- Public hosting configuration, production request-body/session-replay logging review, and deployment remain separate. Follow the existing Supabase plan/session requirements before publishing.
