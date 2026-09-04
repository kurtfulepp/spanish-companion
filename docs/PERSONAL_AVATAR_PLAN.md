# Personal learner avatars

## Product experience

When public signup is enabled, a learner may optionally upload one clear photo
and create a KurtES-style personal character. The step must be skippable. Before
saving anything, show the original photo, the generated transparent avatar, and
plain-language controls to retry, accept, or delete both.

The accepted avatar should replace initials in the account control and appear
sparingly in personal moments such as lesson completion and progress. It should
not compete with the KurtES guide character.

## Safe implementation

1. Create a private Supabase Storage bucket for source photos and generated
   avatars. Never use a public bucket for original photos.
2. Add owner-scoped storage policies. A learner may read, replace, or delete only
   files inside their own user-ID folder.
3. Accept JPEG, PNG, or WebP only, enforce a modest size and pixel limit, reject
   malformed files, and remove metadata such as GPS EXIF information.
4. Add profile metadata for source path, generated avatar path, processing
   status, style version, consent timestamp, and last generation time.
5. Send the source image from a protected server endpoint to the selected image
   generation provider. Never expose that provider key in browser code.
6. Request one consistent front-facing character on a transparent background,
   using a fixed KurtES visual-style prompt and no added text, logos, or scenery.
7. Rate-limit generation per authenticated learner and moderate uploads before
   processing.
8. Delete the original automatically after the learner accepts the avatar unless
   they explicitly choose to retain it for future regeneration.
9. Provide permanent delete and replace controls in Profile.

## Decisions required before implementation

- Select and fund the image-generation provider.
- Approve the fixed character style and the degree of resemblance.
- Decide whether source photos are deleted immediately or retained by consent.
- Write the short privacy notice shown before upload.
- Decide how many free retries a learner receives.

This capability should be implemented alongside the future public-signup task,
then tested with two separate accounts to verify that neither learner can access
the other learner's source photo or generated avatar.
