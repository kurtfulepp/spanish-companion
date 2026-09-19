# Conversation MVP

Implemented locally on 2026-09-07. This document describes the first version, not a publication or an authenticated browser verification.

## What the learner can do

- Open Conversation and see topics with saved vocabulary practice at their exact profile CEFR level.
- Choose a scenario corresponding to a practiced topic moment. One saved expression rating with `last_seen_at` unlocks that moment; Needs practice counts, and simply opening content does not.
- See which practiced expressions inform the exchange. Up to eight are used per session, prioritizing material needing practice.
- Speak or type free responses to an AI partner. Tap Speak, stop recording, check the editable transcription, and send. Replies play aloud by default; a switch and individual Listen controls remain available. The partner gets the preceding exchange and adapts its reply. A session allows six learner turns and can be reviewed earlier.
- Reveal English translations or English hints, and play the Spanish partner responses using the existing speech controls.
- Read a short AI review and up to three corrections tied to exact excerpts from their own messages. Corrections distinguish **Correct — small fix** from **Needs practice**, using target-sensitive meaning rather than edit distance. Return to the matching vocabulary topic for practice.
- Enter the matching conversation group from the vocabulary gap-check completion screen.

## Explicit limits shown before starting

No hands-free conversation, interruptions, pronunciation assessment, saved transcripts/history, custom scenarios, grammar-progress integration, or custom-word-list integration. Microphone input is included and is an essential MVP capability. The AI may use connective vocabulary beyond the target expressions; it is instructed to maintain the exact CEFR level, not restricted to a closed vocabulary. No numeric fluency score, CEFR reassessment, or automatic vocabulary-rating updates are produced. Generated feedback can be mistaken.

Conversation and review exist only in React component memory. Leaving, refreshing, signing out, or changing level clears them. The Topics action asks before discarding; page navigation/reload uses the browser's unsaved-work prompt. Failed turns preserve the submitted draft and previous transcript. Concurrent requests are blocked locally, and unmount/level changes abort pending requests.

## Backend and account connection

`GET /api/conversation` authenticates with the existing Supabase session, reads the profile level and published vocabulary topics, and joins them to that user's saved progress. Progress is paginated rather than silently truncated at 1,000 rows. Existing RLS remains in force, including ownership of personally expanded topic expressions.

`POST /api/conversation` independently authenticates, validates the transcript, reloads the account catalog, checks the supplied level against the stored profile, and rejects unpracticed topic moments before spending quota or calling AI. Topic names, scenarios, and target expressions come from server-loaded learning data, never client-supplied instructions. The transcript is client-held and is not a trusted completion record; this version awards no account progress based on it.

Every conversation-generation or transcription action uses the existing atomic account allowance (`consume_speech_quota`, 25 units per generation). This deliberately shares the existing rolling 1,500-unit daily and 12-request/five-minute allowance with spoken playback for this MVP. Without playback, this permits at most 60 generations per rolling day. Playback consumes its existing character allowance. No database migration is required. A voice turn can consume a transcription request, a conversation request, and a playback request, so the shared burst allowance can pause a voice session before six turns if they happen within five minutes. A separate conversation allowance should replace this shared budget in a later release. Quota failures stop generation; errors never return scripted sample conversations.

The server reuses `OPENAI_API_KEY` with the user's permission and the app's existing text-model convention (`OPENAI_TEXT_MODEL`, default `gpt-4.1-mini-2025-04-14`). Generation uses the [OpenAI Responses API with structured output](https://developers.openai.com/api/docs/guides/structured-outputs), a 30-second timeout, bounded messages and output, and runtime validation. Reply Spanish is capped at 300 characters to fit the existing speech endpoint. Refusals and incomplete or malformed output become recoverable errors. Review quotes are validated against learner messages, so an invented or partner quote is rejected.

Only the selected scenario, up to eight practiced expressions, the selected level, and the current conversation are sent to OpenAI. No name or email is included. Requests set `store: false` and `background: false`; the app does not persist transcripts, log request bodies, or retain provider response IDs. These settings do not promise zero provider retention. API results have `Cache-Control: no-store`.

## Verification

- `node --test tests/conversation.test.mjs tests/topic-diagnostic.test.mjs tests/level-content.test.mjs`: eligibility, exact-level filtering, unpracticed moments, authentication, cross-site rejection, forged input, turn limits, quota errors, request context, output validation, and review attribution.
- TypeScript, lint, and production build.
- Live OpenAI start/reply/review using synthetic test learning data; this tests generation, not the signed-in user's progress or browser interactions.
- Read-only anonymous Supabase query validates the nested catalog relationship syntax; authenticated RLS behavior has not been newly verified in this task.
- Local Conversation route responds with the expected authentication redirect when unauthenticated.

Desktop/mobile interaction and real-account eligibility still need browser verification. No publication was requested. Before publishing, verify the existing AGENTS.md requirement: Supabase Pro or above, Authentication → Sessions → Time-box user sessions = 168 hours, and access-token expiry = 3600 seconds. No upgrade purchase is authorized.

## Microphone implementation and verification

`POST /api/conversation/transcribe` authenticates and checks the active level and practiced scenario before sending audio. The request body is bounded before multipart parsing. WebM/Opus and MP4 recording support is detected in the browser; the endpoint also accepts WAV for test compatibility. Recordings are limited in the UI to 45 seconds and in both layers to 3 MiB. Client durations are not treated as a server-verified audio duration.

The endpoint uses [OpenAI file transcription](https://developers.openai.com/api/docs/guides/speech-to-text) with `gpt-4o-mini-transcribe`, Spanish language guidance, and a prompt to preserve the speaker's wording, errors, and regional variants. No target vocabulary is supplied to bias the transcript. Audio is sent with a neutral generated filename and without profile identity or learning history. Audio is never written by this app to disk, local storage, the database, or logs. Failed transcription retains the recording in tab memory for an explicit retry; successful transcription, discard, hidden-page cancellation, or leaving releases it. This is not a promise of zero provider retention or secure memory erasure.

Transcription can be inaccurate or normalize a learner's wording despite instructions. The learner can edit the transcript before sending, and the review evaluates that submitted text. It does not measure pronunciation or certify independent spoken proficiency. Oversized transcripts remain editable; sending is blocked until shortened to the existing 600-character reply limit.

The [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) handles recording, with [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) permission requested only from Speak. Cancellation invalidates late permission grants and pending transcripts. Current/pending partner playback stops before capturing audio. Automatic playback failures retain the text and expose a manual Listen action.

`tests/conversation-audio.test.mjs` covers endpoint authorization and eligibility, supported formats, byte limits, errors, recording cleanup and cancellation races, and late speech playback prevention. A synthetic Spanish WAV is used for the live transcription smoke check; this is not a test of the user's physical microphone or OS permissions. Physical microphone and browser permission behavior still require device testing.
