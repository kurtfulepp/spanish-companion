# Vocabulary assessment

Owner adopted 12 September 2026. Implements the [educational rubric](educational-rubric.md) and complete [A1–C2 curriculum principles](grammar-curriculum-plan.md), scoped to vocabulary rather than CEFR placement.

## Results and evidence

- **Known**: one unassisted typed response to a fresh contextual prompt demonstrated the target meaning, acceptable Spanish form, and appropriate use. A **Correct — small fix** verdict counts as successful vocabulary evidence while retaining its exact repair for review. Those dimensions are judged separately even though the learner responds once. This is an AI-assessed, revisable result for that expression at the active profile level. It does not certify fluency, pronunciation, listening, or mastery.
- **Needs practice**: the response identified a specific gap in meaning, form, or contextual use, including an explicit “I don’t know”.
- **Not assessed**: no evidence, an assisted response, an uncertain result without an identified error, or a challenged result. Never count an unseen item as a failure.

Immediate **Practice expression** asks for one assisted recall response after study. It gives form and meaning feedback but cannot award Known. A later independent **Check now** asks for one fresh contextual response and judges meaning/form and contextual use as separate dimensions. Recognize accepted regional and register alternatives. Use **Correct — small fix** only for isolated capitalization, punctuation, or non-meaning-changing spelling/accent repairs when the intended meaning and function remain clear. A target error affecting meaning, negation, gender/agreement, verb form, complement, preposition, collocation, or register is **Needs practice**. The generated reference answer is not an exhaustive answer key. Use uncertain for ambiguous prompts or potentially valid readings. When a close answer has an accent or spelling repair, show the exact differing characters in **You wrote** and **Use** rows. Other incorrect results show **Fix** followed by one short, actionable correction and **Use** followed by the Spanish example; they do not narrate the already-visible answer or merely call it wrong. The learner may challenge any result; it is then removed from knowledge/gap counts until a fresh assessment. No claim of human review or automatic teacher escalation is made.

First results are due for review after one day. A further unassisted pass at least 24 hours later, with a different use prompt, records observed delayed success; the next review is seven days later. These are provisional scheduling choices, not empirically validated mastery thresholds. Prior delayed evidence persists through further successful checks; a later failure reopens practice. The current model does not infer permanent learning.

The one-response check is a product rule under evaluation. Automated grading and generated tasks have not received independent teacher calibration. The UI therefore says **AI-assessed** and provides a challenge action. Further validation is required before using these results for placement, high-confidence mastery, or consequential progression.

## Scope and history

Published topic assessments require the exact active profile level, enforced server-side at start and submission. Own photo lists remain assessable across level changes; grades are scoped to the profile level used for that assessment. Deleted, foreign-account, and demo lists are excluded. Item keys include a content fingerprint; changed content does not inherit a result for the older version. Old results remain stored.

Previous confidence ratings stay in their original tables. No self-rating is promoted to Known. The new topic and custom-list interfaces no longer write self-ratings. Manual list archive/restore remains organizational and does not prove knowledge. Legacy auto-completed lists remain archived and can be restored; assessment itself does not auto-archive lists.

Conversation accepts completed assessment attempts as practiced vocabulary, including Needs practice. Existing legacy practice eligibility is preserved. Grammar still reports its saved practice and ungraded writing; its results are not promoted to assessed skills.

## Storage and integrity

Migration: `supabase/migrations/20260912170000_vocabulary_assessments.sql`.

The app issues a 30-minute AES-GCM encrypted challenge containing the owner, profile level, content fingerprint, mode, prompts, and hidden answer specification. The client cannot supply or modify an accepted grade or prompt. Immediate assisted practice uses the already-known expression prompt and avoids a separate AI prompt-generation call; its submitted response still requires grading. Independent checks generate a fresh contextual prompt. Requests require same-origin and verified account authentication and share the existing atomic speech/practice allowance (25 units per preparation or grading call).

`vocabulary_assessment_attempts` stores an immutable serialized receipt signed with HMAC-SHA256 by the server. Every server read verifies the signature, receipt version, owner and ID before using evidence. RLS limits reads/inserts to the account; authenticated updates are restricted to the `disputed` column and only allow flagging a result. Client-inserted unsigned/forged rows have no authority. Unique attempt IDs make uncertain save retries idempotent; the first valid saved receipt wins. All history reads paginate.

Set the server-only `VOCABULARY_ASSESSMENT_SECRET` to the same stable secret in every environment connected to this account database. It is separate from `OPENAI_API_KEY`, so API-key rotation does not invalidate evidence. Preserve and back up it securely; changing or losing it invalidates verification of existing receipts and outstanding challenges. Do not rotate it without a receipt re-signing migration. A local secret is configured in ignored `.env.local`; it must be securely configured in hosting before publishing. Never expose either secret in client code.

The evaluator uses the existing OpenAI key, `OPENAI_ASSESSMENT_MODEL` or `OPENAI_TEXT_MODEL` when configured, otherwise `gpt-4.1-mini-2025-04-14`. Structured Responses output is runtime-validated; incomplete output, refusals, unavailable quota, and service errors do not create a grade. `store: false` is set; that is not a zero-retention guarantee. Only the vocabulary content and submitted answers needed for the task are sent, without the user's name, email or account identifier. The interface adds the profile's first name locally when presenting feedback and otherwise uses direct second-person language. Responses and feedback are retained in the learner's own account.

## Validation

Automated tests cover result rules, evidence tampering and ownership, challenge expiry and profile/content changes, retries, uncertain/assisted results, disputes, pagination, and dashboard aggregation. Live rubric fixtures are synthetic and do not create learner evidence. They are engineering regression checks, not independent teacher calibration.

On 13 September 2026, the owner-approved migration was applied successfully to the production Supabase database. Read-only catalog checks confirmed enabled RLS, three policies, blocked anonymous access, authenticated read/insert access, and updates restricted away from receipt payloads, signatures, and ownership. The local app loaded the dashboard and topic assessment catalog from this storage and prepared a live assessment question. No synthetic answers or assessment results were saved to the learner account during this check. Application publishing remains separate; hosting still needs the same assessment signing secret.
