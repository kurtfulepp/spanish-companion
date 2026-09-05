# Photo vocabulary: staged UI plan

Planning proposal, 2026-09-04. This document defines the next implementation stages; it does not mean the screens, camera support, or private lists have shipped.

The request's reference to calendar access is interpreted as camera access. No calendar, microphone, location, or full photo-library permission is needed.

## Product scope and entry point

Updated by user feedback: place “Photo vocabulary” after all topics, in a separate full-width creation panel. Use the shared `.brand-action-*` styles, light surface, gold border, warm cream artwork inset, terracotta type, and prominent upload/camera actions. Stack actions below the copy on mobile. This replaces the initial proposal to place a matching tile second in the grid.

Tile content:

- Bespoke tactile 3D camera with a small blank photo print and two recognizable everyday objects. Coral body, warm cream details, turquoise lens accent, restrained marigold. Follow the illustration library's lighting and rendering; transparent 512×512 PNG; no lettering, logos, people, emoji, or new palette.
- Title: “Photo vocabulary”.
- Description: “Create a word list from a photo.”
- Separate “Upload photo” and “Take photo” buttons, with Lucide functional icons. The surrounding tile is not a nested link or button.

Register the generated art in `lib/illustrations.ts` and `docs/illustration-library.md`. Inspect existing source artwork and the required style reference before generation. Use the ImageGen skill when this implementation stage starts.

Use a focused `/vocabulary/from-photo` route with the existing app header and a return link to Vocabulary. The tile buttons navigate to source modes; entering the camera route must still show an explicit “Open camera” action before requesting camera access. This deliberate tap also gives mobile native capture a fresh user gesture. Keep transient image state in a route-owned component/provider, not URLs or persistent browser storage. Later stages stay inside this route to avoid losing the photo during navigation.

## Camera behavior

Use web capabilities and actual outcomes for behavior. Browser/OS detection is only a hint for selecting help text, not a guarantee of hardware or permissions.

| Environment | Preferred capture experience | Recovery |
| --- | --- | --- |
| iPhone/iPad | Native photo capture using an image file input with `capture="environment"` where supported; rear-camera preference | Upload photo, or supported live-camera capture. Guidance for that browser's website camera permission. |
| Android | Native capture where supported, with rear-camera preference | Upload photo; check both website permission and Android camera permission for the browser when blocked. |
| macOS | In-page webcam preview using `getUserMedia({ video: true, audio: false })` | Website camera settings; macOS Privacy & Security → Camera when applicable; upload always available. |
| Windows | In-page webcam preview using the same web API | Website camera settings; Windows camera/device and desktop-app access settings when applicable; upload always available. |
| Embedded browsers or restricted iframes | Use supported capture APIs only | Explain that the host browser may block camera access; offer upload or opening the same site in a regular browser. |

`capture` is a browser hint, not a universal native-camera launcher. Some browsers show the file picker instead. Do not promise that macOS/Windows will open a native camera application. HTTPS (or localhost development) is required for `getUserMedia`; embedded deployments also need camera delegation through Permissions Policy and the host iframe.

Do not request permission on the Vocabulary page, during camera detection, or on route load. A supported media API does not prove that a camera is present. Show the camera action where capture can reasonably be attempted; only hide/disable it when known unsupported or after a definite no-device result. Do not interpret an incomplete pre-permission device list as proof that no camera exists. `navigator.permissions` support varies; it must not be a required gate.

Handle permission denied, prompt left unanswered, no camera, camera in use, device disconnected, and unsupported/insecure environment separately where the platform exposes enough information. Do not claim to know the precise cause when `NotAllowedError` conflates website permission, OS permission, or host policy. Provide “Try again”, “Upload photo”, and optional contextual help. Never loop permission prompts automatically or imply the website can change system settings. A user may leave the native prompt unanswered indefinitely, so keep Cancel available.

For a live preview, provide Capture, Retake, and Cancel. Offer camera switching only when multiple devices can be discovered. Stop every video track immediately after capture, cancel, navigation, or loss of the active capture view. If an access request resolves after the user has left, stop the late-arriving stream immediately. Reopening capture after backgrounding requires an explicit action. Native picker cancellation returns to the source screen without an error.

## Review journey

1. **Choose or take a photo.** Explain briefly that OpenAI will process the image. No upload occurs merely from opening the picker or capturing a frame.
2. **Check photo.** Show a local preview with Replace/Retake and “Find words”. Correct orientation, resize and re-encode locally before transfer to strip metadata and satisfy the 2 MiB API limit. Target roughly 1536px on the longest edge. JPEG/PNG first; browser-decodable HEIC/WebP may be converted. If decoding fails, explain the supported formats instead of promising universal HEIC support. Reserve crop controls for a subsequent refinement if needed.
3. **Find words.** Send one request to the existing analysis endpoint. Use an honest indeterminate “Finding words…” state rather than a fabricated percentage or staged object detections. Disable duplicate submission and offer cancellation. Abort requests on exit; cancellation cannot retract data already sent to OpenAI or guarantee avoidance of a charge.
4. **Review words.** Desktop: temporary photo preview alongside an English/Spanish list. Mobile: compact/collapsible photo preview above vertically stacked rows. Each row has a selection checkbox, editable English and Spanish, and optional usage note. Include Spanish articles. Initially select suggestions so the user can remove unwanted ones, but require an explicit final save. Offer Select all/Clear all and Add word. Show selected count, validate empty/overlong values, and identify duplicates after edits. Do not imply AI results are verified facts.
5. **Name and save.** Offer the editable suggested list name and “Save N words”. Require at least one valid selected item. Save only the final accepted text, with no photo fields. On success, clear the transient photo and show the new private list with “Practice list”. Preserve edited text after a save failure so the user can retry without paying for another image analysis.

Do not add object bounding boxes or clickable regions in the first version: the current API returns vocabulary rather than reliable object coordinates. Do not animate a pretend scan. Translation rechecks, if added later, can be text-only requests after the photo has been released.

## State and persistence boundaries

Use explicit states: source → permission/capture → preview → analyzing → review → saving → saved, with recoverable errors scoped to the relevant step. Each request has an identity so a late response from an old/replaced image cannot overwrite the current draft.

The app retains the photo only in memory through review, then releases Blob URLs, canvases, image references, and streams on save/cancel/exit. Nothing goes into localStorage, IndexedDB, service-worker caches, Supabase Storage, logs, or analytics. Do not silently persist unfinished vocabulary drafts either. Warn before deliberate in-app navigation loses substantial edits; reload may lose an unsaved draft.

The operating system may retain a captured original in the user's photo library depending on its capture flow; KurtES cannot guarantee deletion of that original. Browser cleanup is not a secure-erasure guarantee. OpenAI retention is separate, as documented in `photo-vocabulary-api.md`. Show an accurate short notice before “Find words” and link to the fuller explanation. Audit session replay and request-body logging before release.

Private lists need ownership-aware storage and row-level security. Proposed tables are `custom_vocabulary_lists`, `custom_vocabulary_items`, and `custom_vocabulary_progress`, with list/item ownership enforced in policies and server-side validation. Use one atomic transaction for list + selected items, and a per-user idempotency key to prevent duplicate saves after double-clicks or uncertain network results.

Existing `user_vocabulary_progress.item_id` references the published vocabulary table. Custom words cannot simply be inserted into that progress path without schema work. Reuse the practice UI with a common item adapter and route progress to the correct store; do not mix private user words into the published themes or discard existing progress.

## Implementation sequence and acceptance gates

1. **Artwork and entry tile:** generate/review one matching asset, add the two controls, and build the focused source/preview shell. Verify visual alignment, keyboard access, mobile layout, no nested interactive controls, and no camera prompt or upload on page load. Do not present a dead “Find words” action as working.
2. **Capture and local image preparation:** native/mobile and webcam/desktop capture, permissions, cancellation, fallback, orientation, re-encoding and cleanup. Verify that camera use stops on every exit and that only the selected image is handled.
3. **Analysis and word review:** connect the existing endpoint, activate the quota migration, build loading/error/review states, editing and selection. Test empty scenes, refusal, malformed output, quota exhaustion, replacement races, and flaky connections. Preview the real review interface before adding saved-list behavior.
4. **Private lists and practice:** implement the ownership schema, transactional/idempotent save, saved list UI, practice adapter and progress. Test cross-user isolation, duplicate-save prevention, and saving retries without reanalysis.
5. **Device validation and release:** real iPhone/iPad Safari, Android Chrome, macOS Safari/Chrome, and Windows Edge/Chrome; allow, deny, previously blocked, no device, occupied camera, background/return, portrait rotation, native picker cancel, and unsupported formats. Also verify keyboard use, screen-reader status messages, 200% zoom, reduced motion, and phone-sized layouts. Browser emulation alone does not verify OS permission prompts. Record device/browser versions and any untested combinations honestly.

The local OpenAI key and a real model request have already been verified. The hosted OpenAI secret, hosted quota migration, and signed-in end-to-end analysis have not. Complete these before exposing analysis as available to live users. Publish only within the user's authorized scope. Before publishing, follow AGENTS.md: remind the user about Supabase Pro or above and a 168-hour time-boxed session; verify that setting, and keep access-token expiry at 3600 seconds. No subscription purchase is authorized by this plan.

## Sources

- [MDN: getUserMedia permissions, secure contexts, and failure modes](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: capture attribute and compatibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/capture)
- [Apple: camera and video-input permission on Mac](https://support.apple.com/en-gb/guide/mac-help/mchlf88b936b/mac)
- [Microsoft: Windows camera permissions](https://support.microsoft.com/en-us/windows/manage-app-permissions-for-a-camera-in-windows-87ebc757-1f87-7bbf-84b5-0686afb6ca6b)
- [Google: camera permissions in Chrome on Android](https://support.google.com/chrome/answer/2693767?co=GENIE.Platform%3DAndroid&hl=en)

## Implemented kitchen simulation

The `/vocabulary/from-photo?demo=kitchen` flow starts with a generated sample kitchen photo and goes through an explicitly simulated finding state, editable bilingual review, and a simulated saved-list preview. It is linked from the vocabulary action panel and the ordinary photo-selection screen. The real capture/upload screen remains available.

Fixture data lives separately in `lib/photo-vocabulary-demo.ts`. Nothing calls the analysis endpoint or writes account data. Selected words need nonempty translations and cannot duplicate another selected English or Spanish value. Users can replace the local photo, select/clear all, edit, add, remove, name the list, simulate saving, or start again. The fixed kitchen results apply even to replacement photos; the screen explicitly explains this. Temporary object URLs are released on replacement, simulated save, and exit.

Keep **FPO DATA** until real analysis succeeds and the fixture branch is removed from the production journey. Do not remove the simulated-saving notice until real private-list persistence is connected and verified.

### Sample photo

Built-in ImageGen output saved at `public/demo/kitchen-photo.png`. This is a bundled, synthetic demo asset; it is not a retained user upload.

Prompt:

> A realistic casual photograph of a tidy lived-in kitchen, taken with a phone in natural morning window light. Landscape 4:3 composition. Clearly visible distinct everyday objects for a Spanish vocabulary learning demo: stainless steel refrigerator on left, stove with frying pan and saucepan at rear, sink and curved faucet on right, light wood countertop in foreground with a wooden cutting board, single kitchen knife resting flat on board, white ceramic mug, bowl with red apples, folded dish towel, wooden spoon next to pan. Warm cream cabinets, subtle terracotta details, modest contemporary kitchen. Sharp enough to identify objects, believable scale, no people, no text, no letters, no branding, no watermark. This is the sample uploaded kitchen photo itself, no UI, no decorative frame.

## Updated save and tile interaction

The kitchen demo now uses Review → Preview list → Save list → Name My List overlay → Vocabulary, anchored to Your lists beneath Create Your Own. Only accepted bilingual text, a list ID/name, completion state, and creation time are persisted. FPO browser storage is namespaced by the authenticated user ID; it is not cross-device account storage. The shared-device browser owner can still inspect local storage. No photo or image URL is serialized. Failed writes keep the draft and modal open; a stable list ID avoids duplicate retry saves.

There is no fixed maximum number of list tiles or words; normal browser storage capacity applies and errors are surfaced. Active list tiles can be opened, completed into an archive, restored, or deleted with a list-specific confirmation. Completed lists remain available under Completed. Keep FPO labels until fixture data is replaced; replace browser persistence with ownership-enforced server storage before production use.

Validation: repository tests cover text-only serialization, user-key separation, retry deduplication, growing collections, archive/restore/delete, malformed data, and storage failure.
