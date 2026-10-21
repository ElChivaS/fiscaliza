# FISCALIZA — DESIGN.md

Design system for **FISCALIZA**, a PWA that centralizes Chilean vehicle documents (licencia, revisión técnica, permiso de circulación, SOAP) and presents them one at a time during a fiscalización.

This document reflects the **currently shipped design system** (source of truth: `app/globals.css`, `app/layout.tsx`). Any agent generating UI for this project must follow it.

---

## 1. Visual Theme & Atmosphere

- **Mood**: calm, institutional, trustworthy. It is a tool used standing next to a car, in a hurry, under pressure. Clarity beats decoration.
- **Density**: airy. Generous whitespace, few elements per screen, one clear action at a time.
- **Philosophy**: the document is the hero. Surfaces stay quiet (warm off-white), ink is near-black, and color is reserved almost entirely for **document status** (valid / expiring / expired). Accent color is functional, never ornamental.
- **Language**: Spanish (Chile), neutral register. No voseo. No emojis in UI copy.
- **Tone of writing**: short, direct, factual. No hype, no exclamation. Never claim features that do not exist (e.g. do not claim offline use).

---

## 2. Color Palette & Roles

### Light surface (app default)

| Token | Hex | Role |
| --- | --- | --- |
| `background` | `#f5f3ef` | App canvas, warm off-white |
| `surface` | `#ffffff` | Cards, sheets, inputs |
| `ink` | `#111010` | Primary text, icons, borders emphasis |
| `muted` | `#888580` | Secondary text, captions, meta |
| `placeholder` | `#666666` | Input placeholder text |

### Dark surface (fullscreen document viewer)

| Token | Hex | Role |
| --- | --- | --- |
| `dark-bg` | `#0a0a0a` | Presentation / viewer background |
| `dark-surface` | `#141414` | Elevated panels inside the viewer |

### Document status (semantic — the only expressive color)

| Token | Hex | Role |
| --- | --- | --- |
| `valid` | `#22c55e` | Document up to date |
| `expiring` | `#f59e0b` | Expires within the alert window (30 days) |
| `expired` | `#ef4444` | Already expired |

**Rules**
- Status color never fills large areas. Use it on the badge, the dot, or the label — not on backgrounds.
- Do not introduce new accent hues. If a new state is needed, derive it from the status scale.
- `themeColor` meta is `#111010` (ink).

---

## 3. Typography Rules

Two families, loaded via `next/font/google`:

| Token | Family | Role |
| --- | --- | --- |
| `--font-display` | **Syne** (700, 800) | Headings, brand wordmark, big numbers |
| `--font-sans` | **DM Sans** (300, 400, 500) | Body, UI labels, buttons, everything else |

**Hierarchy**

| Level | Family | Weight | Notes |
| --- | --- | --- | --- |
| Display / H1 | Syne | 800 | Tight tracking, short lines. Sentence case. |
| H2 / section | Syne | 700 | Sentence case, no all-caps. |
| Body | DM Sans | 400 | Default body weight. |
| Emphasis | DM Sans | 500 | Labels, active states, key values. |
| Caption / meta | DM Sans | 400 | `muted` color, smaller size. |

**Rules**
- No all-caps headings. No decorative letter-spacing on headings.
- No kicker / eyebrow / overline labels above titles.
- Numerical data (dates, patente, montos) uses tabular, legible sizing; patente format is `KX·TR·74`.

---

## 4. Component Stylings

- **Buttons**: solid ink fill on light surface, or white fill on dark surface. Rounded (pill). No outlines-only buttons as primary action. Label is a short verb phrase ("Crear cuenta", "Revisar documento").
- **Cards / surfaces**: `surface` fill on `background`, soft shadow, `radius-card: 18px`. No harsh 1px colored borders framing cards.
- **Document rows**: label + status badge + date. Status uses the semantic colors above. Row separated by hairline (`rgba(0,0,0,0.08)`-ish), not by a full box border.
- **Inputs**: `surface` fill, `placeholder` color at `#666`, subtle border, generous touch height.
- **Presentation / fullscreen viewer**: `dark-bg` canvas, one document centered, minimal chrome, clear close affordance (Esc / X).
- **Feedback tab**: fixed `FeedbackTab` component, present on all pages (see `app/layout.tsx`).

**States**: hover darkens fill slightly; focus-visible shows an ink outline; disabled reduces opacity. Animations are subtle (transform/opacity), and respect `prefers-reduced-motion`.

---

## 5. Layout Principles

- **Spacing scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. Generous padding inside surfaces.
- **Grid**: single column on mobile; max content width capped and centered on desktop.
- **Whitespace**: bias toward more space. When in doubt, remove an element rather than shrink spacing.
- **Alignment**: primary content left-aligned; the presentation viewer centers its single document.

---

## 6. Depth & Elevation

- Two levels only: `background` (flat) and `surface` (raised via soft shadow on light theme; `dark-surface` on dark theme).
- Shadows are large, soft, low-opacity. No neumorphism, no hard drop shadows.
- No glassmorphism / heavy blur as a default treatment.

---

## 7. Do's and Don'ts

**Do**
- Keep surfaces quiet and let status color carry meaning.
- Use Syne for headings and DM Sans for everything else.
- Write short, factual Spanish (Chile) copy.
- State real facts: 4 documents, Ley 21.302 (valid since 2021), alerts 30 days before expiry, signed temporary URL for access.

**Don't**
- Don't add accent colors beyond the semantic status scale.
- Don't put kickers/eyebrows/badges above titles.
- Don't frame content in bordered boxes as a layout device.
- Don't use emojis, exclamation marks, or marketing hype.
- Don't claim offline / sin-señal operation or any feature the product does not have.
- Don't use all-caps headings.

---

## 8. Responsive Behavior

- Mobile-first. Primary breakpoint at ~768px; also handle ~1024px for tablet.
- Touch targets ≥ 44px. The app is used one-handed, standing, at a vehicle.
- Collapse multi-column layouts to a single column below `md`.
- The document viewer must remain readable at small sizes; never crop the document.

---

## 9. Agent Prompt Guide

**Quick color reference**

```
background  #f5f3ef   surface    #ffffff
ink         #111010   muted      #888580
dark-bg     #0a0a0a   dark-surface #141414
valid       #22c55e   expiring   #f59e0b   expired #ef4444
```

**Fonts**: display = Syne (700/800) · sans = DM Sans (300/400/500)

**Ready-to-use prompts**

- "Build a document list row for FISCALIZA using the DESIGN.md tokens: label, status badge (valid/expiring/expired), and expiry date. Hairline separator, no box border, DM Sans body, muted meta."
- "Create the fullscreen document presentation viewer: `dark-bg` background, one document centered, minimal chrome, X/Esc to close, respect reduced motion."
- "Design a pricing section with Free / Pro $4.990 / Business $14.990, Syne headings, DM Sans body, no decorative accents, no card borders."

---

## Note on pending landing redesign

The marketing landing proposals explored in `_mockups/` (art directions A "Control", B "Boletín", C "Señal", D "Señal" negro/naranja) use different palettes and typefaces (Instrument Serif, Bodoni Moda, Unbounded, Newsreader, etc.). Those are **explorations only and are not shipped**. If one is adopted into `app/page.tsx`, update the tokens in `app/globals.css` and this DESIGN.md together so the source of truth stays accurate.
