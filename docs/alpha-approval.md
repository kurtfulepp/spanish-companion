# Closed alpha approval interface

The admin panel is at `/admin`. The development-only approval interface is at `/admin/approvals/preview` and returns not-found outside development. Both require a current Supabase admin privilege. All applicants in the preview are fictional example.com fixtures; decisions are component state only and reset on refresh. No invitation or notification is sent. This screen does not enable or enforce closed-alpha signup.

## Implemented admin authorization

The privilege is `auth.users.raw_app_meta_data.kurtes_role = "admin"`, attached to a specific Supabase Auth user UUID. It is not a profile field. Ordinary users cannot write app metadata. No email-based grant, first-user bootstrap, role editor, or browser-accessible grant endpoint exists.

The server checks `auth.getUser()` against the current Auth record for every `/admin` and `/admin/*` page and `/api/admin` and `/api/admin/*` request. The two admin pages also check independently. Missing privileges or Auth errors deny access. Signed-out requests follow the existing login gate; signed-in non-admin pages return 404 and admin APIs return 403. Responses are not cached. Future decision handlers must also call the shared `getAccountPrivileges()` helper immediately before performing privileged work.

Profile requests `/api/account/privileges` whenever it opens. Only a positive server result for the same user shows the Admin label and Open admin panel link. Closing the profile or switching accounts removes that result. UI visibility never authorizes an action. Role revocation is enforced on the next server request, without waiting for the access token to expire.

### Provisioning the sole owner

Only grant the role to Kurt's verified Auth UUID, using privileged Supabase administration. The UUID is available in Authentication → Users → the owner's account → User UID. The notification email is not sufficient identity evidence.

On 2026-09-13, Kurt supplied UUID `182168cb-5347-4c46-9efe-bb198ac323bf`. Its identity was verified against the project's Auth user detail for `kurtfulepp@gmail.com`. The protected `kurtes_role: admin` metadata was merged into that single account through the authenticated Supabase SQL editor, preserving all other app metadata. A subsequent query verified that this was the only account with the role. The live local profile displayed Admin and Open admin panel. This is a record of provisioning, not an automatic email-based grant.

After verifying the UUID, a trusted Supabase administrator can merge `{ "kurtes_role": "admin" }` into the account's **app_metadata** with the Auth Admin API `updateUserById`. Preserve unrelated metadata. Grant this role only to the owner; do not grant it to applicants or other learners. There is no app interface to add more admins. Revoke by removing `kurtes_role` from the same protected metadata. Project administrators and service-role credentials remain trusted infrastructure administrators.

References: [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser), [Supabase users and metadata](https://supabase.com/docs/guides/auth/users).

The interface provides Pending and History views, search by name/email, applicant details, and individual Approve/Decline confirmations. It deliberately has no bulk approval. The notification destination selected by Kurt is `kurtfulepp@gmail.com`. This address is not an authorization credential.

## Required live connection

- Replace public account creation with an access-request form. Persist only the request before approval, not an Auth user or password. Show pending only after the server confirms persistence.
- Disable public signup and anonymous Auth in Supabase. Audit existing users and all account creation paths before launch.
- Keep the protected admin role limited to the verified owner account. This privilege is provisioned; new environments need an explicit owner grant.
- Store requests and decisions in Supabase with database access controls; applicants must not read other requests or change approval state. Protect both review pages and decision APIs on the server.
- Send request notifications to the address above through configured server-side transactional email. Links open an authenticated review page; opening a link must not approve anything.
- An explicit owner approval sends a Supabase admin invitation using a server-only credential. Handle concurrent decisions, retries, and invitation failures without duplicate invitations or false success. Track approval and invitation delivery separately.
- Invited users finish account setup through the existing Supabase authentication callback. Declined/pending applicants must have no alternate signup path.
- Test direct API calls, unauthorized users, forwarded notification links, repeated decisions, and invitation failures before calling this live.

The owner account's admin privilege is configured. Server-side invitation credentials, notification delivery, approval database policies, and production signup restrictions are not configured by this change. The current Join flow remains unchanged until that backend work is completed.

Before publishing, upgrade Supabase to Pro or above and verify a 168-hour session timebox. Keep JWT expiry at 3600 seconds.
