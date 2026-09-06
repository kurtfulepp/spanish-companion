# Topic vocabulary engine

KurtES vocabulary topics use one reusable experience rather than separate route logic. Every published topic has six real-world moments and is filtered to the learner's exact A1–C2 profile level.

## Learning behavior

- The gap check selects up to eight expressions, balanced across moments.
- Unseen expressions are selected first, followed by due learning items, other learning items, due confident items, and future confident items.
- Ratings remain attached to stable vocabulary item IDs and determine the next review date.
- Curated expressions are shared. AI-expanded expressions are private to the learner who requested them and remain stable after generation.
- Changing profile level immediately reloads the topic at the new exact level without deleting earlier progress.

## Controlled expansion

“Add 12 expressions” creates exactly two expressions for each topic moment. The authenticated server reads the profile level; the browser cannot choose or override it. Output uses a strict schema, local validation, duplicate rejection, a 30-second timeout, non-stored foreground Responses API calls, and an atomic database save.

Personal expansion is currently limited to 72 expressions per topic and level. Database quota is four generations per rolling 24 hours and two per ten minutes. The OpenAI project spending limit remains an independent hard ceiling.

Generated material records its model and prompt version. It is labeled Expanded in the UI and is not automatically shared with another learner. A later editorial workflow can review and promote suitable expressions into the curated catalog.

## Cost and audio

Text is generated only after an explicit learner action and is then reused from Supabase. Audio remains just-in-time: ElevenLabs is called when Listen is first used for a text and voice in the browser session. A persistent server-side audio cache is a separate future optimization.

