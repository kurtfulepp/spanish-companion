# KurtES design system

## Source of truth

The vocabulary overview at `/vocabulary` is the visual reference for new screens. The user explicitly selected its colors and style on 2026-09-04. Use this system when extending the app; do not invent a separate onboarding brand.

This standard consolidates the vocabulary hierarchy refinement (`d0f6133`), the custom illustration work (`fbf6557`, `15cf06d`), and the user's onboarding feedback. The direct and understated voice below supersedes existing promotional copy where new copy is needed. Existing screens can contain older decisions; their presence is not approval to repeat them.

Executable tokens and shared hero styles live in [`app/design-system.css`](../app/design-system.css). Shared application styles live in [`app/globals.css`](../app/globals.css). Change shared tokens deliberately instead of introducing route-specific replacements. Both welcome and vocabulary use `.brand-hero` so their palettes cannot drift independently.

## Color roles

| Role | Token / value | Use |
| --- | --- | --- |
| Page canvas | `--brand-canvas` / `#f6f1e8` | Warm cream page background |
| Surface | `--brand-surface` / `#fffdfa` | Headers, cards, light controls |
| Hero | `--brand-hero-fill` | Vocabulary's 115° coral `#e9513d` → orange `#ef6a43` at 48% → marigold `#f4a43b` gradient |
| Wordmark accent | `--brand-flag-red` / `#aa151b`, `--brand-flag-gold` / `#f1bf00` | Small red ES in a white box with a yellow outer frame |
| Strong warm ink | `--brand-ink` / `#7f302b` | Text on cream and peach; light hero controls |
| Focus ink | `--brand-ink-strong` / `#7b211b` | Focus outlines and deep warm emphasis |
| Supporting warm ink | `--brand-ink-muted` / `#79564c` | Descriptions on pale warm surfaces |
| Topic surfaces | `--brand-peach` / `#fff0e8`, `--brand-cream` / `#fff4dc` | Dining cards, topic panels, supporting controls |
| Small accents | `--brand-turquoise` / `#38b9b0`, `--brand-yellow` / `#ffd45b` | Sparse vocabulary-style geometric accents |
| Border | `--brand-border` / `#e1d9cc` | Warm, quiet surface separation |

Do not introduce cobalt as a primary interface color or restore a dark-green welcome background. Green and blue occur in the existing illustration palette, topic-specific pastel cards, and progress states; that does not make either a default hero or brand color. Preserve those contextual roles. The legacy global `--primary` and dark-green panels are not the reference for new brand surfaces.

Use white for large type over the coral hero. The compact red ES mark uses its own white surface and yellow frame. For regular-size copy and controls, prefer dark terracotta on cream/gold; do not assume small white text on the orange end has adequate contrast. Retain visible keyboard focus.

## Typography, surfaces, and layout

- Use the existing Geist sans family; do not introduce another font or wordmark treatment.
- Reuse `Brand` and `.brand-es`. Set “Kurt” as the primary word and position a much smaller ES at its upper right. ES uses red lettering in a white box with a yellow outer frame; keep the mark compact and visually secondary at every scale.
- Use tightly tracked, semibold or bold display headings, following vocabulary's approximately `-.055em` tracking. Body text remains normally tracked and readable.
- Use a 1360px content maximum, 12px mobile / 20px larger page gutters, and the existing 20px header-to-content gap.
- Learning and Join screens reuse `.app-header`: light surface, 64px height, 22px rounded corners, subtle border and warm shadow. The title screen uses one `.brand-hero` pane with a continuous orange gradient and no header. Show the large KurtES title and the Join / Sign in pair once; do not duplicate the wordmark or Sign in in the top corners.
- Keep the shared navigation header in normal document flow so it scrolls away with the page. Do not make it sticky or fixed; it must not cover the working content.
- Use a gold pill with terracotta text for the active navigation destination. Authenticated headers keep Profile/Settings and Sign out visible at the right; do not replace those account controls with a generic hamburger.
- Sign out returns to the public opening screen, where Sign in occupies the same conventional upper-right position.
- The upper-left brand is the KurtES wordmark only. A learner's personal avatar appears once, at the upper right, and opens Profile and Settings when selected.
- Hero corners are 24px; topic cards 26px; large focused lesson panels may use the existing 32px radius. Buttons and status chips are pills.
- Use soft warm shadows from the reference, not strong black shadows or a new glow treatment.
- Let the opening title fill the available screen height with one clear primary action. Learning screens keep compact heroes and put usable content close to the header; do not carry the title-page scale into every route.
- On mobile, stack text and artwork without clipping controls or forcing horizontal scrolling. Allow vertical scrolling on short screens and with enlarged text.
- Motion is brief and subtle; respect reduced-motion preferences.

The opening screen omits the “Spanish practice” label. Join and Sign in have equal width and height; omit the Join arrow and distinguish hierarchy through surface treatment, not size. Its authentication actions are Join (account creation) and Sign in (existing account), not “Start practice”. The title screen has no duplicate header Sign in link.

Authentication entry links use full document navigation (`<a href="/sign-in">` and `<a href="/join">`), following the existing vocabulary navigation fix for vinext. Sign in and Join use the existing Supabase email-and-password flow and start every authenticated learner on `/vocabulary`. Preserve refreshed session cookies through server redirects; do not add an alternate authentication provider or bypass.

The Sign in screen uses the coral-to-marigold brand treatment rather than a dark-green panel. Show one KurtES wordmark in its illustrated left pane on desktop; do not repeat it over the form. Omit promotional taglines from both panes.

Profile avatars use a visible 2px colored ring, including image and initials fallbacks. Use the shared `--brand-avatar-border` token (brand gold) and `.profile-avatar-button` styling across headers. Retain a separate, offset keyboard-focus outline so the decorative border is not mistaken for focus.

## Creation actions

The photo creation panel headline is “CREATE YOUR OWN”, followed by “Upload a photo to create a custom theme to enhance your vocabulary.” Omit the former eyebrow and “Photo vocabulary” heading in this panel. Retain the existing action buttons.

Photo vocabulary appears after all topic cards as a separate, full-width action panel. Use the shared `.brand-action-*` styles: light surface, gold top border, warm cream artwork inset, larger title, and prominent upload/camera controls. On mobile, keep both actions below the artwork and copy. It is a creation tool, so do not place it among the topic cards or repeat their status-chip layout. The photo action artwork may use an intentional cream backdrop inside its rounded inset; topic illustrations retain transparency.

## Artwork

Follow [`illustration-library.md`](illustration-library.md) and [`learner-avatar-reference.md`](learner-avatar-reference.md). These retain the detailed generation and identity rules.

Reuse the transparent, tactile 3D assets. Kurt is the guide; objects identify vocabulary topics. Use `lib/illustrations.ts` for topic assets and Lucide for functional icons. Do not substitute OS emoji, generic flat illustration, new character styling, or CSS drawings. Keep the compact upper-right ES box treatment; artwork's broader colors are not an invitation to redesign UI colors.

## Voice

The user's explicit choice is **direct and understated**. Describe what the learner can do in plain language. Prefer “Join”, “Sign in”, “Spanish practice”, “Reveal Spanish”, and similarly concrete labels.

No motivational filler, sentimental promises, or decorative taglines in navigation, footers, or below actions. Do not replace a removed slogan with another. Specifically rejected: “A little Spanish, every day”, “Small steps. Real confidence”, “Vamos, a tu ritmo”, and the courage / new-world-of-conversation copy. Empty space is intentional.

The Vocabulary Worlds hero heading is “Select a theme or create your own”, with no supporting subtext.

Keep the Vocabulary overview similarly concise: omit the “More worlds…” tagline, the redundant “Vocabulary themes” eyebrow, and the “Your topic map” caption beneath the compass artwork.

Keep explanations and errors useful. Preserve Spanish in lesson content and examples; the explicitly requested “¡Hola!” speech bubble beside the welcome coach is retained. Do not generalize this into decorative Spanish taglines elsewhere. A colorful visual system does not require a promotional voice.

## Extending the system

Before designing, read this file and the relevant implemented vocabulary screen. Reuse its tokens, components, and registered artwork. Do not treat the latest generated mockup as a new source of truth. New explicit user feedback supersedes this document; record the correction here and in the shared implementation as part of the same change.

Before delivery, check that new screens use shared styles, the compact upper-right ES mark is unchanged, navigation is conventional, no rejected taglines or primary palettes have returned, and required controls remain readable and usable. Run the build and relevant static checks. When visual browser testing is requested, check desktop and mobile against the vocabulary reference.

## Join flow

Use a full-screen, sequential Email → Password → Review flow with bottom progress dots, Back/Continue navigation, and a final Create account action. Retain entered values between slides, validate before advancing, keep passwords only in component memory, and respect reduced motion. Dots identify the active step and allow returning to reached steps; they must not bypass field validation. See `docs/account-onboarding.md` for backend mapping.

## Welcome character

Use the original, unmodified still coach image with “¡Hola!” visible immediately. The user rejected both the whole-body wobble and the masked-arm wave. Do not reintroduce character animation unless explicitly requested again.

## Photo vocabulary prototype

The kitchen simulation uses a persistent **FPO DATA** banner on photo, finding, review, and list-preview states. Keep this label while any vocabulary is fixture data; remove it only after successful real API integration. Review uses editable English/Spanish rows with selection checkboxes, then a list preview. The final “Save list” opens a “Name My List” overlay with a freeform name and Save button. For the FPO prototype, accepted text persists in browser storage scoped to the signed-in user; show this limitation explicitly. Never persist photos. Saved list tiles appear below Create Your Own, with no fixed tile-count limit. Each tile has subtle top-right complete and trash icons. Completion moves the list into a collapsible Completed archive with a restore action; deletion confirms the specific list. Name lists only in the final overlay. On narrow screens, stack the language fields and allow collapsing the reference photo.
