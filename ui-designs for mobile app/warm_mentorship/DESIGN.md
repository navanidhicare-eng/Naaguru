---
name: Warm Mentorship
colors:
  surface: '#effcf9'
  surface-dim: '#cfddd9'
  surface-bright: '#effcf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f7f3'
  surface-container: '#e3f1ed'
  surface-container-high: '#ddebe7'
  surface-container-highest: '#d8e5e2'
  on-surface: '#121e1c'
  on-surface-variant: '#3e4946'
  inverse-surface: '#273331'
  inverse-on-surface: '#e6f4f0'
  outline: '#6e7a75'
  outline-variant: '#bdc9c4'
  surface-tint: '#006b5a'
  primary: '#006454'
  on-primary: '#ffffff'
  primary-container: '#087f6c'
  on-primary-container: '#d4fff2'
  inverse-primary: '#78d7c1'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#fec24a'
  on-secondary-container: '#715000'
  tertiary: '#0e6456'
  on-tertiary: '#ffffff'
  tertiary-container: '#317d6e'
  on-tertiary-container: '#d7fff3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#95f4dd'
  primary-fixed-dim: '#78d7c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#ffdea7'
  secondary-fixed-dim: '#f8bd45'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#a6f1de'
  tertiary-fixed-dim: '#8ad4c3'
  on-tertiary-fixed: '#00201a'
  on-tertiary-fixed-variant: '#005144'
  background: '#effcf9'
  on-background: '#121e1c'
  surface-variant: '#d8e5e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-xxl: 2rem
  space-3xl: 2.5rem
  screen-gutter: 1rem
  card-padding: 1rem
  list-gap: 0.75rem
---

## Brand & Style

The brand personality is that of an empathetic, articulate mentor: reliable, forward-looking, encouraging, and unhurried. Tailored for teenagers in Class 10 and 11 navigating high-stakes academic and career forks, the interface avoids the anxiety-inducing, hyper-gamified styling common in ed-tech. Instead, it offers calm clarity, structured choices, and warmth.

The design movement balances Modern Corporate/Ed-Tech with Soft Humanism:
- Clean visual hierarchy with generous white space to de-escalate decision stress.
- Tactile, accessible touch targets suited for one-handed mobile ergonomics.
- Reassuring, grounded visual weight anchored by structured lists and deliberate card elevations.
- Outline iconography with gentle radiuses to feel approachable rather than clinical.

## Colors

The palette is tuned specifically for sustained mobile reading and thoughtful decision-making under ambient Indian lighting conditions.

- **Primary (`#087F6C`):** Deep Teal acts as the core brand beacon. Used for key interactive calls-to-action, active tabs, progress indications, and focal brand moments.
- **Primary Dark (`#056052`):** Reserved for active/pressed states, deep contrast accents, and high-emphasis headers.
- **Primary Light (`#E6F5F1`):** Serves as contextual chip backgrounds, selected state surfaces, and soft progress fills.
- **Secondary Accent (`#F4B942`):** Warm Amber highlights achievements, milestones, critical tips, and exploratory badges without imparting false urgency.
- **Neutral Dark (`#172321`):** Deep forest-tinted charcoal for primary body text and titles, ensuring AA/AAA contrast without the harshness of pure black.
- **Neutral Muted (`#647572`):** Supporting metadata, secondary labels, disabled outlines, and inactive icons.
- **Canvas (`#F8FAF9`):** Soft, mint-tinged off-white reducing ocular fatigue over prolonged research sessions.
- **Surface (`#FFFFFF`):** High-clarity white for interactive cards, sheets, and dialogs.
- **Semantic Alerting:** Forest green (`#2E8B57`) for positive milestones and validations; muted crimson (`#D64545`) for friction alerts, deadlines, and validation errors.

## Typography

The type system prioritizes cross-script harmony between Latin (English) and Telugu. The Latin core is set in **Inter**, selected for its systematic tall x-height, neutral aperture, and robust readability on low-cost Android displays.

For regional language localisation (Telugu), the engine pairs fallback hierarchies directly with **Noto Sans Telugu**. 

Operational rules:
- When Telugu text is rendered, font-size increments remain identical, but line-height expands by an additional 2px–4px across body and headline levels to prevent diacritic clipping.
- Restrict uppercase transformations to short metadata tags (`label-sm`); avoid all-caps on CTA buttons to preserve an encouraging, conversational tone.
- Numerical statistics (such as cutoff ranks, percentage marks, stipend amounts) utilize tabular figures (`tnum`) for straightforward visual scanning.

## Layout & Spacing

A strict 4px horizontal and vertical rhythm underpins the system. Spacing decisions favor breathing room around dense academic data:

- **Mobile Canvas Base:** Mobile-first layout calibrated to a 360px–414px baseline viewport. Fixed lateral gutters of 16px (`space-md`) establish the safe boundaries on mobile.
- **Rhythm & Stacking:** Vertical spacing follows an 8px modular step: 8px between closely tied elements (such as titles and subtitles), 16px between independent inputs or list items, and 24px–32px separating macro content sections.
- **Layout Model:** Fluid grid layout for content areas, maintaining full-width single-column stacks on mobile. Tablet/foldable reflow introduces a maximum content bounding box of 640px to preserve natural eye-tracking speed.
- **List & Row Structures:** Preference is given to structured divider rows and inset grouping rather than nested cards. Data points (eligibility, stream options, exam dates) follow structured key-value rows.

## Elevation & Depth

Visual depth avoids heavy drop shadows, instead utilizing layered surface contrast and delicate ambient occlusion. This ensures optimal rendering performance on lower-tier smartphones:

- **Surface Tier 0 (Background):** `#F8FAF9`. The foundation layer.
- **Surface Tier 1 (Cards, Rows, Modals):** Pure `#FFFFFF`.
- **Outline Foundation:** Surfaces are outlined with a low-contrast 1px border (`#E4EBE8`) to provide structural delineation against the canvas without demanding heavy shadows.
- **Ambient Shadow (Elevated State):** Used exclusively for floating action buttons, sticky bottom commitment bars, and active modal sheets:
  `box-shadow: 0 4px 16px -2px rgba(8, 127, 108, 0.08), 0 2px 6px -1px rgba(23, 35, 33, 0.04);`
- **Tonal Elevation:** Interactive pressed states shift downward into `#E6F5F1` rather than generating simulated physical height.

## Shapes

The design system standardizes on a friendly, unified 12px (`0.75rem`) corner radius across primary functional surfaces:

- **Cards, Containers, Text Inputs, and Modals:** Fixed 12px radius. It softens the tone of rigorous educational assessments without feeling childish.
- **Buttons:** 12px radius on standard primary/secondary triggers, maintaining alignment with inputs.
- **Chips, Category Pills, and Badges:** Fully circular (`pill`, 9999px) to distinctly contrast against rectangular information cards.
- **Iconography:** Outlined 24px glyphs built with a 1.5px to 2px stroke weight, rounded terminal stroke ends, and soft exterior joins.

## Components

### Buttons
- **Primary:** Background `#087F6C`, text `#FFFFFF`, height 48px, radius 12px, font `label-lg`. Pressed state transitions to `#056052`. Full width across mobile form triggers.
- **Secondary / Subdued:** Background `#E6F5F1`, text `#087F6C`, borderless, height 48px, radius 12px.
- **Tertiary / Ghost:** Transparent background, text `#087F6C`, 44px min-touch target.

### Chips & Filters
- Compact 32px height, fully pill-shaped.
- **Unselected:** White surface, border 1px solid `#E4EBE8`, text `#647572`.
- **Selected:** Background `#E6F5F1`, border 1px solid `#087F6C`, text `#087F6C`, leading checkmark or indicator icon.

### Lists & Key-Value Rows
- Preferred over heavily layered cards.
- White surface backgrounds or direct canvas placements separated by 1px `#E4EBE8` rules.
- Horizontal layout: Left icon/avatar (40px with soft mint background), followed by Title/Subtitle hierarchy, right-aligned meta-data or navigation chevron (`#647572`).

### Text Inputs & Form Fields
- Height 52px, 12px radius, surface `#FFFFFF`, 1px border `#D1DCD8`.
- Label placed externally above input in `label-md` (`#172321`).
- Focus state: 2px border `#087F6C`, zero glow, neutral text `#172321`.
- Error state: 1.5px border `#D64545`, error message positioned beneath field in `body-sm`.

### Checkboxes & Radio Buttons
- 20px by 20px hit surfaces centered within a 44px minimum tap target.
- Checked state: `#087F6C` background with crisp white icon check or center dot.
- Unchecked state: White surface with 1.5px `#647572` border.

### Career & Guidance Assessment Cards
- Surface `#FFFFFF`, 12px radius, 1px border `#E4EBE8`, 16px internal padding.
- Top section holds stream badge (`#F4B942` tinted pill or `#E6F5F1` stream tag).
- Middle section houses career title (`headline-md`) with 2-line condensed eligibility/summary.
- Bottom section contains structured footer row: Average timeline, match percentage, and tertiary chevron link.

### Stream Compatibility Pathway Indicator
- Step indicator featuring numbered or icon-based 28px circles.
- Connected via a 2px track: `#087F6C` for completed steps, `#E6F5F1` for future roadmap milestones.