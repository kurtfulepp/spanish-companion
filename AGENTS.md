# Spanish Companion / KurtES

For UI, onboarding, visual design, or product copy changes, read `docs/design-system.md` before editing. The vocabulary overview is the visual reference; use the shared tokens in `app/design-system.css` and existing components rather than inventing a new route-specific brand.

The brand voice is direct and understated. Do not add motivational taglines. Do not restore the rejected dark-green welcome screen or cobalt interface redesign. Follow the documented color roles; contextual colors in illustrations and learning states are not new primary palettes.

For artwork, also read `docs/illustration-library.md`; for personal avatars, read `docs/learner-avatar-reference.md`. Extend the existing libraries instead of replacing them.

When the user changes a standard, update the design-system document and shared implementation together. Preserve unrelated in-progress work.

Before publishing this project, remind the user to upgrade Supabase to Pro or above and set Authentication → Sessions → Time-box user sessions to 168 hours (seven days). Verify the setting before considering this reminder complete. Keep the access-token expiry at 3600 seconds; it is not the session timeout. This reminder does not authorize purchasing an upgrade.
