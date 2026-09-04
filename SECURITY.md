# Security notes

This app follows a least-privilege model: browser code uses only the Supabase
publishable key, private service credentials remain in server-side environment
variables, and Row Level Security limits learner records to their owner.

## Controls in place

- Authentication is required for the main application and speech API.
- The Join form uses Supabase signup and respects its server-side account-creation controls.
  Disabled signup is shown as unavailable; the UI does not enable it.
- Learning scores are calculated by trusted database functions rather than
  accepted directly from the browser.
- Speech generation is limited per authenticated user to reduce accidental or
  abusive ElevenLabs spending.
- Security headers restrict framing, browser capabilities, and resource origins.
- `.env.local` and real credentials are excluded from Git.

## Manual account controls

- Keep MFA enabled on the GitHub, Supabase, ElevenLabs, and OpenAI accounts.
- Disable new Supabase signups while the product is private. Re-enable them only
  when onboarding is ready, with email confirmation and CAPTCHA configured.
- Before increasing Supabase's minimum password length, confirm the current
  owner's password already satisfies the new minimum or reset it first.
- Keep ElevenLabs key permissions limited to text-to-speech and retain a modest
  per-key credit limit.

## Backups

Migration files in Git preserve the database schema, not the learner data. On a
free Supabase plan, export important table data regularly and store it in a
private encrypted location outside this repository. Do not commit exports that
contain user IDs or learning activity. Upgrade to a plan with managed backups
before the app holds data that cannot be recreated.

## Before public access

- Upgrade Supabase to Pro or above and set Authentication → Sessions → Time-box
  user sessions to 168 hours (seven days). Verify the saved setting before publishing;
  retain the 3600-second access-token expiry.
- Add CAPTCHA to sign-up and sign-in.
- Enable email confirmation and verify production redirect URLs.
- Review rate limits against real usage and add centralized/edge limiting if the
  app runs across multiple server instances.
- Revisit the microphone Permissions Policy before adding speaking exercises.
- Add server-side monitoring and alerts for failed authentication, elevated
  speech usage, and unexpected database errors.
