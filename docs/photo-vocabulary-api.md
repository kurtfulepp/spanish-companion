# Photo vocabulary API

Photo vocabulary now connects the authenticated analysis endpoint to upload/capture, editable bilingual review, list preview, naming, and profile-owned list tiles. The endpoint suggests words; only the user’s accepted text is saved to their profile. Photos are never persisted by KurtES.

## Configuration

1. Create a project-scoped OpenAI API key with access to the Responses API and the configured vision model. Keep it server-side. Configure API billing and a project budget/alerts in OpenAI.
2. Set `OPENAI_API_KEY` in the ignored `.env.local` for development. Never paste it into a conversation or use a `NEXT_PUBLIC_` variable. Restart a running development server after changing the key.
3. The default is the pinned `gpt-4.1-mini-2025-04-14` model, which supports image input and Structured Outputs. `OPENAI_VISION_MODEL` can override it, but a replacement must support this request schema and have its retention behavior reviewed.
4. Apply `supabase/migrations/20260904220000_create_photo_vocabulary_quota.sql` to the same Supabase project as the app. The endpoint fails closed if this RPC is missing or inaccessible.
5. Configure `OPENAI_API_KEY` as a secret in Sites for production. Hosted environment values are separate from `.env.local`; deploy the validated version to apply them. Do not place credentials in `.openai/hosting.json` or source control.

The user configured the local OpenAI key, and a live Responses request returned HTTP 200 using the app's existing dining illustration. The response contained nine reviewable English–Spanish suggestions, including plate/el plato, fork/el tenedor, and spoon/la cuchara. The test used the actual analysis handler with authentication and quota callbacks mocked; it verifies the key, model access, image input, and response schema, not the complete signed-in endpoint. That earlier test did not verify the signed-in flow; see the current integration checkpoint below. The local key file is ignored by Git. No additional API keys were created or hosted secrets changed during verification.

## Request and response

`POST /api/vocabulary/analyze-photo`

Use the existing Supabase sign-in cookies. The request body is **raw JPEG or PNG bytes**, not multipart form data, a remote URL, or Base64 JSON. Set `Content-Type: image/jpeg` or `image/png`. The actual stream is limited to 2 MiB, even when Content-Length is absent or inaccurate. The header signature is checked; OpenAI performs full image decoding.

The browser uploader orients, resizes (at most 1536 pixels on the longest side), and re-encodes the selected image before sending it. Re-encoding removes EXIF/location metadata. This endpoint does not yet perform image re-encoding or metadata stripping: callers should send prepared image bytes. HEIC, WebP, GIF, and other formats must first be converted by the uploader to a supported format.

```js
// preparedPhoto is a re-encoded JPEG or PNG Blob held in browser memory.
const response = await fetch('/api/vocabulary/analyze-photo', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': preparedPhoto.type },
  body: preparedPhoto,
});
const suggestions = await response.json();
```

Successful response:

```json
{
  "suggested_title": "Kitchen",
  "items": [
    { "english": "frying pan", "spanish": "la sartén", "usage_note": null }
  ],
  "requires_review": true
}
```

Zero to 15 distinct suggestions are returned. An empty array is a valid result for an unclear or uninformative image. The user must review and accept the words before a separate save operation persists them. The model's suggested title and all text are untrusted display content; render as text, never raw HTML.

Errors return `{ "error": "User-facing message", "code": "stable_code" }`. Statuses include 400 for an empty image, 401 for missing sign-in, 403 for browser cross-site requests, 413 for an oversized image, 415 for unsupported/invalid image signatures, 422 for refused or unreadable images, 429 for quota/provider limits, 503 for missing configuration or an unavailable quota service, and 502/504 for analysis failures/timeouts. All handler responses use `Cache-Control: no-store`.

## Usage and persistence

The database keeps one counter row per user, capped at 3 attempts per five-minute window and 20 per 24-hour window. These are fixed windows beginning with that user's first attempt, not calendar days or a strict rolling window. Row locking makes quota consumption atomic across concurrent Workers. Attempts that reach OpenAI consume quota even if the provider fails; there are no automatic retries. Direct calls to the RPC can consume the caller's own allowance but cannot bypass it or access another user's counters.

The analysis endpoint persists only counters and window timestamps. It does not write image bytes, image URLs, filenames, prompts, or generated vocabulary to a database, object store, filesystem, console, or error report. A separate, explicit list-save action persists only the user’s accepted English–Spanish text and list metadata to their profile. Inline Base64 is sent to OpenAI in a foreground Responses request with `store: false` and `background: false`; no Files API, conversations, background jobs, or image-generation tools are used. No provider response IDs are returned. The request holds image data temporarily in memory until processing completes; garbage collection is not a guaranteed secure erase.

Before public release, also verify hosting/proxy/observability settings do not capture request bodies and disable session replay capture of the photo preview. Clear browser Blob URLs and image state when the user finishes or cancels; never put photos in local storage or IndexedDB. An original photo in the user's photo library remains theirs and is not deleted by the app.

## OpenAI retention synopsis — reviewed 2026-09-04

- API data is not used to train models by default.
- `store: false` avoids ordinary stored Responses state. It does not disable abuse monitoring: content can be retained for up to 30 days, with longer legal or harm-prevention exceptions.
- Zero Data Retention requires approval and organization/project configuration. Account eligibility has not been verified. Image inputs flagged as possible CSAM are retained for manual review even under ZDR; additional notified safety exceptions can apply.
- Prompt caching has separate model/account rules. This integration makes no claim that `store: false` or an in-memory cache option ensures zero provider retention. Re-check the selected model and account before making a stronger privacy promise.

Suggested product wording: “KurtES won’t save your photo. OpenAI processes it to suggest vocabulary and may retain content temporarily for safety monitoring.”

Sources: [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [image input](https://developers.openai.com/api/docs/guides/images-vision), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Verification

Run `node --test tests/photo-vocabulary.test.mjs tests/photo-analysis-client.test.mjs tests/demo-lists.test.mjs`, `npx tsc --noEmit`, and `npm run build`. Handler tests use a mocked provider and cover authentication, no-store responses, bounded uploads, quota failures, inline non-stored requests, malformed output, refusals, empty scenes, deduplication, and sanitized provider failures. After configuring credentials and applying the migration, make one authenticated analysis request using a non-sensitive test image and verify the output and counter increment. Do not print credentials or request bodies while testing.

## Cost-control checkpoint — 2026-09-04

User requires costs to remain limited until they decide otherwise. The following records the initial read-only check; the authorized cap and current integration checkpoint below supersede its pending status.

Verified in OpenAI Platform UI: KurtES project has no spend limit; organization monthly threshold is $100 with “Enforce a hard limit” OFF; billing shows $5.00 prepaid credit and auto-reload OFF. These observations are point-in-time, not ongoing monitoring.

OpenAI now supports explicit enforced organization/project spend limits separately from alerts. Both hard-limit propagation and prepaid exhaustion can permit some overrun; do not promise an exact dollar guarantee. See [Spend limits](https://developers.openai.com/api/docs/guides/spend-limits). App counters (3 attempts/5 minutes and 20/24 hours per user) still need database activation and do not constitute a global spending cap. The FPO demo makes no recognition API calls.

### Authorized cap applied and verified

Following the user's “Make the change” instruction, KurtES project `proj_t0ZYa6eGwsmelLbPpXqtb1bb` now has a **$5 USD monthly spend limit with hard enforcement ON**. Verified after reloading the project Limits page: amount `5`, enforcement switch checked, and the page says requests will fail at the limit. The platform also shows a 100% ($5) spend alert. Billing was rechecked: $5.00 prepaid balance, **auto-reload OFF**. No credits were bought, organization limits changed, or paid model requests made.

Keep this project cap and auto-reload setting until the user explicitly directs otherwise. The monthly cap can reset automatically with the billing calendar; it is not a lifetime testing budget. OpenAI warns small enforcement overruns are possible. The integration checkpoint below records subsequent activation. Production deployment remains separate.

## Local integration checkpoint — 2026-09-04

A signed-in browser upload of the bundled synthetic kitchen photo successfully reached the real endpoint and OpenAI, returning 14 suggestions. The existing local key was reused; one paid recognition request was made in this integration check, with no automatic retries or spending-setting changes. The review displayed actual results without FPO labels. Editing and deselection carried 13 accepted words into preview, and the temporary photo preview was cleared. Naming and saving produced a 13-word tile beneath Create Your Own without an FPO label; reopening retained the edited words. The temporary test tile was then deleted through its confirmation dialog.

`PhotoVocabularyDemo` now supplies the shared review and save UI with either real results or explicit demo fixtures. Real lists carry `source: photo`; only demo/legacy lists display FPO. Browser-only storage remains disclosed and user-scoped. Cross-device list persistence and practice integration remain future work.

The counter table and RPC were applied to Supabase project `fcgvbfohqplckorwkusj`. Verified: RLS enabled, authenticated direct table SELECT/UPDATE denied, authenticated function execution allowed. The 3-attempt/5-minute and 20-attempt/24-hour limits are active in the signed-in path. After the live request, a read-only aggregate query returned one counter row with day_count 1 and burst_count 1.

**Permission correction applied — 2026-09-05:** Following explicit user approval, applied the statements in `20260904230000_restrict_photo_vocabulary_quota_execution.sql` to Supabase project `fcgvbfohqplckorwkusj` in a transaction. Removed the inherited `PUBLIC`/`anon` execution grants and retained authenticated execution. The subsequent `has_function_privilege` query returned `anonymous_can_consume = false` and `signed_in_can_consume = true`. The original migration is also corrected for fresh installations. This resolves the earlier automatic approval-review block. No paid recognition request, spending-limit change, or public deployment was performed for this correction.

Validation: 19 focused mocked tests, TypeScript, targeted lint, and production build passed. No new key was created. Hosted `OPENAI_API_KEY`, public deployment, hosting/body-log review, and physical-device camera validation remain pending. The $5/month enforced project cap and auto-reload OFF remain unchanged.

## Account list storage connected — 2026-09-05

The current UI saves accepted real and FPO lists to `public.custom_vocabulary_lists`, linked to `public.profiles.id`. This supersedes the browser-only checkpoint above. One database row holds list metadata and an ordered JSON array of accepted English–Spanish pairs so each save is atomic. RLS enforces user ownership; anonymous access is denied. The client only has the column privileges needed to insert lists and change completion/deletion. There is no fixed application limit on list count or words per list; ordinary database/request capacity still applies, and reads paginate.

`lib/custom-vocabulary-lists.ts` serializes only accepted text and metadata. Stable list IDs and conflict-ignore inserts make save/import retries idempotent without overwriting an already saved list’s status. Existing browser lists transfer only under their original signed-in owner; browser data is removed only after every save succeeds and the original browser value remains unchanged. A failure preserves the browser copy and displays retry guidance. No unfinished draft or photo is copied.

Deletion clears name and words and retains only an ownership/ID tombstone and metadata to prevent stale browser imports from resurrecting deleted content. Account/profile deletion cascades to all list records. This is application deletion, not a claim about database backup retention. Completed lists retain their accepted words; restore returns them to active lists.

Lists reload on page entry, refocus, or returning to the visible tab; no realtime subscription is required. Failed saves keep the naming dialog and draft. Sign-out/account changes clear displayed lists. Profile storage is active in the local app against the existing Supabase project; this does not publish the updated frontend.

Applied `20260905010000_create_custom_vocabulary_lists.sql`. Rollback-only database tests in `supabase/tests/custom_vocabulary_lists.sql` passed owner save/read/complete/restore, duplicate retry, invalid photo-field rejection, cross-user read/update/insert denial, anonymous privilege denial, and deletion/import safety. Six new client tests cover serialization, migration preservation, idempotency, pagination, and mutation scoping. TypeScript, focused lint, and production build passed. No paid OpenAI request or cap change was needed. Physical cross-device browser testing, practice integration, and hosted frontend activation remain separate steps.


## Custom-list practice connected — 2026-09-05

`custom_vocabulary_progress` stores profile/list/word-index status and review time. Word indices remain stable because accepted list words cannot be edited after saving. If post-save editing is added later, migrate to immutable word IDs before reordering or deleting individual words. `record_custom_vocabulary_review` is an authenticated, owner-checked RPC that locks the list, upserts the self-assessed status, and updates practiced/confident counts and completion atomically. Direct client progress/count writes are denied. Manual list completion does not modify ratings; restore preserves them. Deleted lists cannot be reviewed, and their progress rows are removed. There are no AI calls in practice.

See `custom-vocabulary-qa.md` for the real photo → account save → practice → fresh-tab retrieval → archive/restore/deletion validation and bounded security review. The current checkpoint supersedes the earlier pending-practice notes. Physical second-device verification and public deployment remain pending. The dependency advisory scan needs approval to send package metadata to npm.
