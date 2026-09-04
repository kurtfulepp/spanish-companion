# Account onboarding contract

## Backend mapping

| UI | Supabase destination | Requirement |
| --- | --- | --- |
| Email | `auth.signUp({ email })` → Supabase Auth user email | Required, browser email validation, trimmed before submission |
| Password | `auth.signUp({ password })` → Supabase Auth password handling | Required, at least 8 characters in this UI; Supabase applies its configured policy |
| Review | No additional stored fields | Final explicit creation action; password is not displayed |
| Confirmation link | `/auth/confirm` exchanges PKCE code or verifies token hash | Completes authentication and redirects to `/today` |
| Profile ID | `public.profiles.id` → `auth.users.id` | Created by `on_auth_user_created_create_profile` in the existing profiles migration |

Do not write email or passwords into `profiles`, local storage, logs, or an application API. The password lives only in React state until submission and is cleared on the confirmation screen. Do not create a second profile in the unauthenticated browser: RLS only allows authenticated users to access their own row.

Profile fields are not mandatory signup inputs. `display_name`, `proficiency_level`, and `level_source` are nullable. `voice_preference` defaults to `male`, `learning_timezone` to `America/New_York`, and `follow_device_timezone` to `false`. The database supplies IDs and timestamps. Learners can edit optional fields through Profile after authentication.

Sources: `20260903023000_create_profiles.sql`, `20260904173000_add_profile_voice_preference.sql`, `20260904203000_add_profile_timezone.sql`, and the existing profile editor.

## Verification and limits

On 2026-09-04 the public Supabase settings endpoint reported email signup enabled, signup not disabled, and email autoconfirm disabled. A zero-row REST query verified the profile columns exist in the connected backend. Profile-trigger behavior is defined by the checked-in migration; it was not tested by creating a real account during this change. The public settings endpoint does not expose the complete password policy, so server validation remains authoritative.

Configure each deployed origin's `/auth/confirm` as an allowed Supabase redirect URL. Production settings and redirects were not changed by this UI task. The flow handles disabled registration, weak passwords, rate limits, network errors, immediate sessions, and email confirmation. It uses neutral confirmation text because Supabase can conceal whether an address already exists.

## Entry and authentication audit (2026-09-04)

- `/` always renders the welcome screen, even with an existing session. It exposes exactly two actions: Join and Sign in.
- `/join` always opens Email → Password → Review, including when the browser has another valid session. Only Create account invokes Supabase signup. Email confirmation completes authentication; the profile trigger supplies the account row.
- `/sign-in` uses Supabase email/password authentication. A still-valid session is reused and leads to `/today`; expired or absent sessions require credentials. Staying authenticated for seven days would retain this behavior, not prompt for a password on every visit.
- Signed-out visits to protected pages return to `/`, so newcomers see the welcome choices. Unauthenticated API requests receive 401 JSON, never application data or an HTML sign-in page.
- Signed-in users can navigate directly to protected routes. “Always welcome” applies to opening the app at `/`; it does not interrupt in-app navigation or redirect every authenticated deep link.
- Sign out ends the session and returns to `/`.

## Live session settings verified in Supabase

Project: `spanish-companion` (`fcgvbfohqplckorwkusj`). Inspected Authentication → Sessions in the signed-in dashboard on 2026-09-04.

| Setting | Current value | Meaning |
| --- | --- | --- |
| Plan | Free | Session lifetime controls are disabled |
| Access token expiry | 3600 seconds | Tokens refresh after approximately one hour; this does not end the session |
| Time-box user sessions | 0 / never | No fixed session lifetime |
| Inactivity timeout | 0 / never | No inactivity-based sign-out |
| Refresh-token replay detection | Enabled | Retained |
| Refresh-token reuse interval | 10 seconds | Retained |

**Seven days has not been applied.** The native setting exists, accepts hours up to 8760, and can be set to **168 hours on Pro or above**. The dashboard explicitly disables it on this project's Free plan. No subscription, billing, or authentication settings were changed during the audit.

Options:

1. Upgrade to Pro and set Time-box user sessions to 168 hours. Keep the 3600-second access-token lifetime and automatic refresh. This is the recommended way to cap session duration across the application and direct Supabase access. Supabase checks the cap on refresh, so a token already issued can remain valid for up to its remaining one-hour lifetime beyond the seven-day boundary.
2. Remain on Free and implement a separate server-enforced session-age policy, tied to trusted session creation time, including protection for direct Supabase database access via RLS. This requires backend work and tests; a client timer or cookie expiry alone is not equivalent. Not implemented as part of this screen audit.
3. Keep the current indefinite sessions until the plan or enforcement approach is chosen. Sign out and session revocation continue to work normally.

Do not set the JWT expiry to seven days: that lengthens individual bearer-token validity without imposing a seven-day session cap.

References: https://supabase.com/docs/guides/auth/sessions and https://supabase.com/docs/guides/auth/server-side/advanced-guide
