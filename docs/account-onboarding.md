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
