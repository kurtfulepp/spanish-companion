# Photo vocabulary API

The first implementation is an authenticated analysis endpoint. It suggests vocabulary for human review; it does not create lists or save photos or vocabulary. The camera/upload UI and accepted-list persistence are separate work.

## Configuration

1. Create a project-scoped OpenAI API key with access to the Responses API and the configured vision model. Keep it server-side. Configure API billing and a project budget/alerts in OpenAI.
2. Set `OPENAI_API_KEY` in the ignored `.env.local` for development. Never paste it into a conversation or use a `NEXT_PUBLIC_` variable. Restart a running development server after changing the key.
3. The default is the pinned `gpt-4.1-mini-2025-04-14` model, which supports image input and Structured Outputs. `OPENAI_VISION_MODEL` can override it, but a replacement must support this request schema and have its retention behavior reviewed.
4. Apply `supabase/migrations/20260904220000_create_photo_vocabulary_quota.sql` to the same Supabase project as the app. The endpoint fails closed if this RPC is missing or inaccessible.
5. Configure `OPENAI_API_KEY` as a secret in Sites for production. Hosted environment values are separate from `.env.local`; deploy the validated version to apply them. Do not place credentials in `.openai/hosting.json` or source control.

The user configured the local OpenAI key, and a live Responses request returned HTTP 200 using the app's existing dining illustration. The response contained nine reviewable English–Spanish suggestions, including plate/el plato, fork/el tenedor, and spoon/la cuchara. The test used the actual analysis handler with authentication and quota callbacks mocked; it verifies the key, model access, image input, and response schema, not the complete signed-in endpoint. The quota migration in the hosted database and production activation remain pending. The local key file is ignored by Git. No additional API keys were created or hosted secrets changed during verification.

## Request and response

`POST /api/vocabulary/analyze-photo`

Use the existing Supabase sign-in cookies. The request body is **raw JPEG or PNG bytes**, not multipart form data, a remote URL, or Base64 JSON. Set `Content-Type: image/jpeg` or `image/png`. The actual stream is limited to 2 MiB, even when Content-Length is absent or inaccurate. The header signature is checked; OpenAI performs full image decoding.

The future browser uploader should orient, resize (roughly 1536 pixels on the longest side), and re-encode the selected image before sending it. Re-encoding removes EXIF/location metadata. This endpoint does not yet perform image re-encoding or metadata stripping: callers should send prepared image bytes. HEIC, WebP, GIF, and other formats must first be converted by the uploader to a supported format.

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

Only counters and window timestamps persist. The application does not write image bytes, image URLs, filenames, prompts, or generated vocabulary to a database, object store, filesystem, console, or error report. Inline Base64 is sent to OpenAI in a foreground Responses request with `store: false` and `background: false`; no Files API, conversations, background jobs, or image-generation tools are used. No provider response IDs are returned. The request holds image data temporarily in memory until processing completes; garbage collection is not a guaranteed secure erase.

Before shipping an uploader, also verify hosting/proxy/observability settings do not capture request bodies and disable session replay capture of the photo preview. Clear browser Blob URLs and image state when the user finishes or cancels; never put photos in local storage or IndexedDB. An original photo in the user's photo library remains theirs and is not deleted by the app.

## OpenAI retention synopsis — reviewed 2026-09-04

- API data is not used to train models by default.
- `store: false` avoids ordinary stored Responses state. It does not disable abuse monitoring: content can be retained for up to 30 days, with longer legal or harm-prevention exceptions.
- Zero Data Retention requires approval and organization/project configuration. Account eligibility has not been verified. Image inputs flagged as possible CSAM are retained for manual review even under ZDR; additional notified safety exceptions can apply.
- Prompt caching has separate model/account rules. This integration makes no claim that `store: false` or an in-memory cache option ensures zero provider retention. Re-check the selected model and account before making a stronger privacy promise.

Suggested product wording: “KurtES won’t save your photo. OpenAI processes it to suggest vocabulary and may retain content temporarily for safety monitoring.”

Sources: [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [image input](https://developers.openai.com/api/docs/guides/images-vision), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Verification

Run `node --test tests/photo-vocabulary.test.mjs`, `npx tsc --noEmit`, and `npm run build`. Handler tests use a mocked provider and cover authentication, no-store responses, bounded uploads, quota failures, inline non-stored requests, malformed output, refusals, empty scenes, deduplication, and sanitized provider failures. After configuring credentials and applying the migration, make one authenticated analysis request using a non-sensitive test image and verify the output and counter increment. Do not print credentials or request bodies while testing.
