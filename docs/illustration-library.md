# KurtES illustration library

This library is the single source of truth for expressive product artwork. It ensures that new topic worlds, sections, milestones, and empty states feel like one product rather than a collection of operating-system emoji.

## Product rule

- Do not use OS emoji for section or feature artwork.
- Use a bespoke KurtES 3D illustration for expressive visual moments.
- Use Lucide icons for functional controls such as navigation, playback, close, check, and directional actions.
- Use Kurt's character only when he is acting as the guide. Use object-led vignettes for topic and section identity.

## File structure

```text
public/illustrations/
  topics/       Topic-world artwork
  sections/     Reusable section artwork added later
  milestones/   Progress and celebration artwork added later
  states/       Empty and completion states added later
```

Only create a folder when its first approved asset is added. Final website assets are transparent PNG files, sized to 512 × 512 pixels unless a placement requires a different aspect ratio.

Runtime paths and accessible descriptions are registered in `lib/illustrations.ts`. Pages should import the manifest rather than repeat string paths.

## Current inventory

| Key | File | Intended use |
| --- | --- | --- |
| `photoVocabulary` | `topics/photo-vocabulary.png` | Photo creation action panel; opaque cream backdrop, 1254 × 1254 source |
| `topicCompass` | `topics/topic-compass.png` | Vocabulary map and topic discovery |
| `diningOut` | `topics/dining-out.png` | Dining Out |
| `aroundTheCity` | `topics/around-the-city.png` | Around the City |
| `travel` | `topics/travel.png` | Travel |
| `socialLife` | `topics/social-life.png` | Social Life |
| `workMeetings` | `topics/work-meetings.png` | Work & Meetings |
| `homeDailyLife` | `topics/home-daily-life.png` | Home & Daily Life |
| `feelingsRelationships` | `topics/feelings-relationships.png` | Feelings & Relationships |

## Visual specification

- Premium cinematic 3D animated-film object vignette.
- Rounded, friendly forms and clean silhouettes.
- Tactile materials with softly realistic texture—not plastic, flat vector art, clip art, or OS emoji styling.
- Soft front-left studio light with a subtle warm rim light.
- Lively coral, terracotta, marigold, turquoise, cobalt, leafy green, and warm cream.
- Centered compact composition with generous transparent padding.
- Legible at 80–160 px in the interface.
- Genuine alpha transparency without a black or white background, sticker border, or glow halo.
- No text, letters, numbers, logos, brands, flags, watermarks, or unrequested people.

## Reusable generation brief

```text
Use case: stylized-concept
Asset type: <topic, section, milestone, or state> illustration for the KurtES Spanish learning app
Input image: the approved KurtES avatar is a style and rendering reference only; do not reproduce Kurt or his identifying features unless he is explicitly the subject
Primary request: <one concrete object-led subject or compact scene>
Style/medium: premium cinematic 3D animated-film vignette; rounded forms; softly realistic tactile materials; friendly proportions; consistent with the KurtES illustration library
Composition/framing: single centered compact vignette; square composition; clear silhouette; generous transparent padding; readable at 80–160 px
Lighting/mood: soft front-left studio key light; subtle warm rim light; optimistic and inviting
Color palette: lively coral, terracotta, marigold yellow, turquoise, cobalt blue, leafy green, and warm cream; balanced and saturated without neon
Scene/backdrop: genuinely transparent background; no floor rectangle, frame, or scenery extending to the canvas edge
Constraints: one cohesive illustration; actual alpha transparency; no text, letters, numbers, logos, brands, flags, watermark, black background, white background, sticker outline, glow halo, or OS emoji styling
Avoid: flat vector icon, Apple emoji, Android emoji, generic emoji, clip art, photorealism, excessive detail, and cropped objects
```

## Adding an asset

1. Confirm the visual has a real product purpose and is not decorative filler.
2. Generate one specific asset using the reusable brief and the approved avatar as a style-only reference.
3. Check subject accuracy, palette, material finish, silhouette, transparency, and small-size legibility.
4. Resize the approved PNG to 512 × 512 for standard UI use.
5. Save it under the correct `public/illustrations` family with a descriptive kebab-case filename.
6. Register its path and plain-language alt description in `lib/illustrations.ts`.
7. Use an empty alt attribute when the same meaning is already stated by adjacent visible text; otherwise use the registered description.
8. Validate the page at mobile and desktop sizes before publishing.

## Source prompts used for the first set

The first library set used the reusable brief above with these subjects:

- Compass: dimensional explorer's compass with turquoise face, terracotta rim, marigold needle, and sunburst accents.
- Dining Out: hand-painted ceramic place setting, coral napkin, cutlery, blank menu, and turquoise bud vase.
- Around the City: colorful stucco street, cobblestones, tree, and turquoise bicycle.
- Travel: warm-cream suitcase, coral straps, blank turquoise tag, airplane, and marigold sun.
- Social Life: two ceramic café cups, flowers, celebratory accents, and blank conversation bubbles.
- Work & Meetings: blank-screen laptop, coral notebook, turquoise pen, marigold lamp, and blank presentation card.
- Home & Daily Life: coral doorway, turquoise door, plants, woven mat, and keys.
- Feelings & Relationships: interlocking coral and turquoise hearts supported by abstract hands.


## Photo creation action artwork

The Photo vocabulary action has an intentional warm cream backdrop within a rounded inset, distinguishing it from the transparent topic illustrations. The original built-in ImageGen output is retained at 1254 × 1254 to avoid another conversion step. The same registered artwork is used on the photo-selection screen.

Final edit prompt, built-in ImageGen (2026-09-04):

> Edit this artwork for a KurtES photo vocabulary action panel. Preserve the tactile 3D coral camera, turquoise lens, cream floral trim, apple and photo print exactly. Replace ALL the gray-white checkerboard with a smooth solid warm cream background #fff4dc, including through the wrist strap openings. This is an intentionally opaque illustration, NOT a transparency request. No checkerboard anywhere. Keep whole subject visible with generous padding. Square image, no text, no logos. Soft natural contact shadow only, no added objects.
