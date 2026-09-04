# KurtES learner avatar reference

Status: approved direction for the future onboarding flow  
Canonical visual reference: `public/brand/kurtes-center.png`  
Supporting pose references: `public/brand/kurtes-open-arms.png`, `public/brand/kurtes-arms-crossed.png`, `public/brand/kurtes-pointing.png`, and `public/brand/kurtes-profile.png`

## Purpose

Turn a learner-provided portrait into a warm, recognizable 3D character that feels native to KurtES. The result should resemble the learner—not Kurt—and remain consistent across the app's lessons, topic worlds, progress moments, and navigation.

In product copy, call this a **personal avatar**, not an emoji. “Emoji” can remain friendly shorthand in conversation, but the generated asset is a custom illustrated character.

## Visual DNA

- Polished, cinematic 3D character illustration with a softly animated-film quality.
- Friendly proportions: slightly enlarged head, expressive face, simplified body, and rounded forms.
- Recognizable likeness without photorealism or caricature. Preserve face shape, skin tone, hairstyle, facial hair, eyewear, and other defining visible traits.
- Large, clear eyes with warm catchlights; expressive brows; natural, welcoming smile.
- Smooth materials with enough texture to avoid a plastic or waxy finish.
- Soft key light from the front-left, gentle rim light, subtle contact shadow, and warm tonal balance.
- Confident, encouraging body language suitable for a learning companion.
- Clean silhouette that remains readable at small UI sizes.
- Warm KurtES accent colors—coral, marigold, turquoise, cobalt, and leafy green—used selectively rather than applied to every character.
- No words, logos, flags, stereotypes, watermarks, scenery, or decorative props in the master avatar.

## Personalization rules

The source photo determines the learner's visible identity. Do not copy Kurt's hair, glasses, facial structure, clothing, ethnicity, or gender presentation unless those traits are present in the learner's image or explicitly selected by the learner.

Clothing should default to a simple, contemporary solid-color shirt or top. Cultural or regional clothing must be chosen by the learner; never infer it from appearance, name, language level, or location.

When a source detail is unclear, simplify it rather than inventing a sensitive trait. Do not alter body size, apparent age, skin tone, disability aids, religious garments, scars, or other identity-relevant features without an explicit request.

## Master generation prompt

```text
Use case: identity-preserve
Asset type: personal learner avatar for the KurtES language-learning application
Primary request: transform the person in the reference portrait into a polished, friendly 3D animated character while preserving their recognizable identity
Input image: the learner-uploaded portrait is the identity reference
Scene/backdrop: genuinely transparent background with a clean silhouette and no environmental elements
Subject: one person, centered, facing mostly forward, relaxed posture, warm and encouraging expression
Style/medium: premium cinematic 3D character illustration; softly stylized rather than photorealistic; slightly enlarged head and expressive facial features; rounded forms; detailed but uncluttered
Composition/framing: full body, entire hair and shoes visible, generous transparent padding, no cropping
Lighting/mood: soft front-left studio key light, subtle warm rim light, natural catchlights, optimistic and approachable
Color palette: preserve the person's natural coloring; use one restrained KurtES accent color in the clothing when appropriate
Materials/textures: soft natural skin shading, believable hair strands, lightly textured fabric, no plastic or waxy finish
Constraints: preserve face shape, skin tone, hair, facial hair, eyewear, visible disability aids, and defining traits from the reference; use simple contemporary clothing unless the learner has selected another option; output a single character only; preserve real alpha transparency
Avoid: copying Kurt's identity or clothing; changing age, ethnicity, body type, gender presentation, or culturally significant garments; stereotypes; flags; text; logos; props; scenery; heavy glow; black background; watermark; cropped hands, hair, or feet; extra fingers or limbs
```

## Required asset set

Generate the canonical neutral avatar first. Once approved, derive the following from that approved master rather than starting again from the original photo:

1. **Profile headshot** — square crop, head and shoulders, friendly neutral smile, transparent background.
2. **Open-arms guide** — full body, welcoming gesture, transparent background.
3. **Celebration** — half or full body, delighted but not exaggerated, suitable for milestones.
4. **Thinking** — half body, thoughtful expression and simple hand gesture, suitable for hints.
5. **Pointing guide** — full body with a clear presentation gesture toward UI content.

Topic-specific scenes—such as holding a menu for Dining Out—should be generated only after the master avatar and core pose set are approved.

## Consistency requirements

- Use the approved master avatar as the identity reference for every subsequent pose.
- Keep the same face geometry, hair design, skin tone, eyewear, body proportions, clothing base, material finish, and lighting family.
- Allow expression and pose to change; do not redesign the character between assets.
- Keep transparent backgrounds for reusable UI assets. Contextual topic scenes may use backgrounds only when the placement requires them.
- Never use a generated derivative as the only identity reference if the original approved master is available.

## Quality checklist

Approve an asset only when all answers are yes:

- Does it look recognizably like the learner?
- Are skin tone, hair, eyewear, facial hair, and defining traits accurate?
- Is the expression warm and appropriate for learning?
- Does it match the canonical KurtES 3D finish?
- Is the silhouette clear at approximately 48 px, 96 px, and 240 px?
- Are hands, fingers, glasses, teeth, and clothing structurally believable?
- Is the background genuinely transparent, with no black halo or baked-in glow?
- Is there no text, logo, watermark, flag, stereotype, or unrequested cultural styling?
- Is the character fully inside the canvas without unintended cropping?

## Proposed onboarding experience

1. Explain what will be created and request clear consent before the photo leaves the device.
2. Ask for one well-lit, front-facing portrait with the full head visible and no beauty filter.
3. Offer optional choices for clothing color, glasses, and presentation style; do not require gender selection.
4. Generate one neutral master preview.
5. Let the learner approve it, regenerate it, or continue without a personal avatar.
6. Generate the remaining pose set only after approval to avoid unnecessary cost and processing.
7. Let the learner replace or delete both the source photo and generated avatars later.

## Privacy and safety requirements

- State plainly why the photo is needed, where it is sent, and how long it is retained.
- Obtain explicit consent before uploading or generating.
- Do not make avatar creation a condition of using the app.
- Prefer deleting the original source photo after the avatar is approved unless the learner explicitly chooses to retain it for future regenerations.
- Store generated assets in a private per-user location with access controls; never expose another learner's photo or private avatar.
- Do not train on, sell, or reuse learner photos outside the requested avatar workflow.
- Provide a simple delete-and-regenerate control.
- Establish parental consent and age requirements before offering photo upload to minors.

## Implementation note

The onboarding build should treat avatar generation as an asynchronous job with `uploading`, `generating`, `ready`, `failed`, and `deleted` states. Store consent time, generation status, and private asset locations against the authenticated profile. The production implementation should use a server-side image-generation call so credentials are never exposed in the browser.

