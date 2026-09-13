# KurtES design system

## Source of truth

Learning objectives, level expectations, practice, and assessment follow the owner's adopted [educational rubric](educational-rubric.md) and full [A1–C2 curriculum](grammar-curriculum-plan.md). This document remains the authority for visual design and product voice.

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
- The upper-left brand is the KurtES wordmark only. The learner's personal avatar at the upper right opens Profile and Settings when selected. Home also uses that same profile avatar as the artwork in the “Level” tile.
- Hero corners are 24px; topic cards 26px; large focused lesson panels may use the existing 32px radius. Buttons and status chips are pills.
- Use soft warm shadows from the reference, not strong black shadows or a new glow treatment.
- Let the opening title fill the available screen height with one clear primary action. Learning screens keep compact heroes and put usable content close to the header; do not carry the title-page scale into every route.
- On mobile, stack text and artwork without clipping controls or forcing horizontal scrolling. Allow vertical scrolling on short screens and with enlarged text.
- Motion is brief and subtle; respect reduced-motion preferences.

The opening screen omits the “Spanish practice” label. Join and Sign in have equal width and height; omit the Join arrow and distinguish hierarchy through surface treatment, not size. Its authentication actions are Join (account creation) and Sign in (existing account), not “Start practice”. The title screen has no duplicate header Sign in link.

Authentication entry links use full document navigation (`<a href="/sign-in">` and `<a href="/join">`), following the existing vocabulary navigation fix for vinext. Sign in and Join use the existing Supabase email-and-password flow and start every authenticated learner on `/home`. Preserve refreshed session cookies through server redirects; do not add an alternate authentication provider or bypass.

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

## Photo vocabulary

The public kitchen simulation and its entry links are retired. The photo review screen requires actual API results and has no FPO banner or sample-data fallback. Internal kitchen fixtures live under `tests/fixtures`, outside public assets. Existing demo and legacy saved lists retain FPO labels so sample data cannot be mistaken for recognized vocabulary. Review uses editable English/Spanish rows with selection checkboxes, then a list preview. The final “Save list” opens a “Name My List” overlay with a freeform name and Save button. Accepted text, list names, and completion status persist to the signed-in profile for both real and demo lists. State that lists are available across devices. Existing browser lists transfer to the same user’s profile; preserve the local copy if transfer fails. Never persist photos. Saved list tiles appear below Create Your Own, with no fixed tile-count limit. Each tile has subtle top-right complete and trash icons. Completion moves the list into a collapsible Completed archive with a restore action; deletion confirms the specific list. Name lists only in the final overlay. On narrow screens, stack the language fields and allow collapsing the reference photo.


## Custom-list practice

Custom list tiles and their word dialogs link to “Assess list”. Use the same scored recall and contextual-use flow as topic vocabulary. Show Known, Needs practice, and Not assessed, with an AI-assessed explanation and a visible challenge action. Retain historical self-ratings and manual archive/restore as separate account history; do not display old confident counts as assessed knowledge or auto-archive a list from one successful check.


## Level-personalized learning

Show one exact active CEFR level: A1, A2, B1, B2, C1, or C2. Do not present a learner as a broad “B1–B2” range and do not silently substitute B2 content when another level is selected. The profile level is the shared source of truth for Vocabulary, Grammar, Conversation, guided lessons, and AI-generated practice.

Where a curriculum browser is provided, follow the [Curriculum preview rule](educational-rubric.md#curriculum-preview-rule): show all six levels and use **Review**, **Your level**, or **Curriculum preview** according to their relationship to the profile. Higher-level previews show requirements and explanations without practice controls or progress awards. Keep the active profile level visible and unchanged while browsing.

When the learner saves a new level in Profile or accepts an assessment result, update the mounted experience immediately. Reset route-local exercises to the newly selected level, refetch level-filtered database content, and preserve prior progress. Existing custom lists remain available because they are learner-owned; photo-generated lists retain the CEFR level used to create them.

A profile without a level does not receive assumed learning content. Show the shared level-selection experience before exposing lessons or generating vocabulary. Use concise factual labels such as “B1 vocabulary” and “B1 topic experience.”

## Vocabulary topic experiences

Every published topic card opens the shared topic experience: six real-world moments, an assessed recall-and-use check, an expression browser, saved progress, and optional controlled AI expansion. Dining Out is the layout reference; do not create separate route-specific interaction systems for later topics. Keep each topic's registered object illustration and pastel surface while retaining the shared warm typography, controls, and navigation.

Assessments prioritize identified gaps, then unassessed expressions and due reviews. Each check uses typed recall and a fresh contextual response; show feedback only after both responses. Browsing and recently assisted practice do not award Known. “Add 12 expressions” is an explicit learner action, not an automatic page-load cost. Label personally generated material “Expanded” and preserve its stable progress identity. Keep operational model, quota, and storage details out of the interface.

## Conversation practice

Organize Conversation around topics the learner has practiced. Use each topic's registered illustration, name, and pastel surface. A saved expression response with a last-seen timestamp at the exact active CEFR level unlocks its topic moment; simply opening content does not. Needs practice counts as practice, and mastery of the whole topic is not required. Enforce eligibility on the server for every conversation request.

Show the connection to learning explicitly: practiced-expression counts, available moments, and “Based on your practice” expressions. Prioritize expressions needing practice. Unpracticed moments link back to the topic. Changing profile level resets the active conversation and reloads eligibility without changing previous vocabulary progress. The vocabulary gap-check summary links to the topic's conversations.

Microphone input is an essential part of the Conversation MVP. The first version supports spoken or typed adaptive exchanges of up to six learner turns: tap Speak, stop recording, check the editable transcription, send it, and hear the partner reply. Retain hints, translations, manual Listen controls, and an AI review grounded in the submitted text. Play replies aloud by default with a visible switch and an actionable fallback when playback is unavailable. Request microphone permission only after Speak; show recording state, elapsed time, Stop and transcribe, and Cancel. Stop tracks on finish, cancellation, navigation, hidden page, and level changes, including a permission grant arriving after cancellation. Limit each recording to 45 seconds, keep audio only in memory, and allow transcription retry before discarding. Starting recording stops current and pending speech playback. Show “Available now” and “Not included yet” before starting. Hands-free conversation, interruptions, pronunciation scoring, saved history, custom scenarios, grammar-based conversations, and custom-list integration remain outside this version. Transcripts and reviews stay in component memory and are lost on leaving or refreshing. Feedback does not change vocabulary ratings or the learner's level. Never present prerecorded scripts, fixtures, or a service failure as a successful generated conversation.

## Grammar curriculum

Every module at every level includes visible plain-language subtext explaining when someone would use its grammar. Give concrete communicative situations and clarify the purpose of technical titles. Keep this explanation visible before expansion; detailed grammar types, rule scope, and learning objectives remain inside the module. Source the subtext from the canonical curriculum so it also appears in higher-level previews.

Use the shared scrolling learning header and compact brand hero. Grammar presents the exact active profile level while the curriculum dropdown lists all six levels, including C1 and C2. Label earlier-level review and higher-level curriculum previews explicitly. Provide a grammar-type filter and expandable module outlines. Keep available rule lessons visually distinct from outlines. A rule follows Learn → Practice → Write → Review; use labeled native inputs, keyboard-operable choices, visible feedback, and separate evidence labels. Account-saved practice, ungraded writing, and visit-only sample results must remain distinguishable. Do not imply mastery, complete module coverage, or teacher approval from a short lesson.

## Home dashboard

The signed-in homescreen is `/home`. Home is the first navigation item on desktop and mobile, and the wordmark returns there. Sign in, immediate Join sessions, and confirmation links land on Home. The public opening screen remains at `/`.

Use a responsive tile grid with oversized level and metric type, the shared coral hero, warm cream and peach surfaces, quiet borders, and existing registered artwork. Keep the exact profile level prominent. Show saved progress and actionable practice areas, with loading, unavailable, and empty states kept distinct. Current-level vocabulary and supported earlier grammar review remain distinguishable; custom lists retain their own saved content.

Use these Home tile labels exactly: “Level”, “Practice hours”, “Vocabulary you know”, “Progress”, “Needs practice”, and “Ready for assessment”. Omit the possessive “Your” from these labels.

Do not repeat the learner's display name as a standalone label at the right of the Home overview heading.

The “Level” tile uses the signed-in learner's profile avatar, with the same default avatar as the account header when none is set. Read it from the shared learner profile so changes stay synchronized. Do not use the topic compass in this tile.

Active practice duration is not recorded yet: show an em dash and “Not recorded yet”, never fabricated hours or lesson estimates presented as measured time. Replace confident and mastered labels with “Vocabulary you know”, “Needs practice”, and “Ready for assessment”, based only on verified assessment receipts. Show observed later successful checks separately. Label results AI-assessed and revisable; retain grammar practice as practice until production assessment is implemented. Counts describe saved practice, not CEFR completion.

Vocabulary assessments follow [Vocabulary assessment](vocabulary-assessment.md). Keep recall and use as two clear steps, visible labels and keyboard-operable text fields, an explicit “I don’t know” action, retained answers on failures, and “My answer may be valid” after grading. Do not show an answer or play target audio before both submissions.
