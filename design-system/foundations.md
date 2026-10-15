# Foundations

Color, type, spacing, grid, radii, surfaces and iconography. Every value here lives in `src/app/globals.css` (and is exported to `tokens.json`). Live reference: `/design-system`.

---

## 1. Color

### Three layers

| Layer | Where | Who may use it |
|---|---|---|
| 1. Primitives (`--ink-0` … `--ink-1000`) | `:root` in globals.css | Only the semantic layer. Never components. |
| 2. Semantic tokens (`--background`, `--card`, …) | `:root` (light) and `.dark` (dark) | Components, via Tailwind utilities |
| 3. Tailwind theme (`--color-*`) | `@theme inline` | Generates `bg-card`, `text-muted-foreground`, … |

There is no chroma. The whole system is one neutral ink scale. Emphasis comes from ink weight, size and position, never from hue.

### Primitives (ink scale)

20 steps. The odd steps (`10`, `20`, `350`, `550`, `975`) exist so every semantic value sits on the scale.

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `--ink-0` | `#ffffff` | | `--ink-550` | `#6e6e6e` |
| `--ink-10` | `#f2f2f2` | | `--ink-600` | `#5c5c5c` |
| `--ink-20` | `#ededed` | | `--ink-700` | `#2a2a2a` |
| `--ink-25` | `#fafafa` | | `--ink-800` | `#1c1c1c` |
| `--ink-50` | `#f4f4f4` | | `--ink-850` | `#161616` |
| `--ink-100` | `#ececec` | | `--ink-900` | `#121212` |
| `--ink-200` | `#dcdcdc` | | `--ink-950` | `#0c0c0c` |
| `--ink-300` | `#c2c2c2` | | `--ink-975` | `#111111` |
| `--ink-350` | `#d4d4d4` | | `--ink-1000` | `#000000` |
| `--ink-400` | `#9a9a9a` | | | |
| `--ink-500` | `#8a8a8a` | | | |

Note the scale is named by role, not strictly by lightness (`ink-25` is lighter than `ink-10`). Always go through the semantic tokens.

### Semantic tokens

Dark is the default theme (`.dark` on `<html>`). Light is the `:root` layer.

| Token | Tailwind | Dark | Light | Use |
|---|---|---|---|---|
| `--background` | `bg-background` | ink-950 `#0c0c0c` | ink-0 `#ffffff` | Page |
| `--foreground` | `text-foreground` | ink-20 `#ededed` | ink-950 | Primary text, the mark |
| `--card` | `bg-card` | ink-900 `#121212` | ink-50 `#f4f4f4` | First surface step: cards, panels, tables |
| `--raised` | `bg-raised` | ink-800 `#1c1c1c` | ink-100 `#ececec` | Second step: rows, widgets, chips inside cards |
| `--popover` | `bg-popover` | ink-900 | ink-0 | Menus, popovers |
| `--muted` | `bg-muted` | ink-900 | ink-50 | Muted fills (rare; prefer card) |
| `--muted-foreground` | `text-muted-foreground` | ink-500 `#8a8a8a` | ink-550 `#6e6e6e` | Secondary text, ledes, labels |
| `--subtle-foreground` | `text-subtle` | ink-600 `#5c5c5c` | ink-400 `#9a9a9a` | Tertiary text: metadata, dates, indexes |
| `--primary` | `bg-primary` | ink-20 `#ededed` | ink-950 | The one primary action per view, confirmed state |
| `--primary-foreground` | `text-primary-foreground` | ink-950 | ink-0 | Text on primary |
| `--secondary` / `--accent` | `bg-secondary` / `bg-accent` | ink-800 | ink-100 | Secondary buttons, hover fills |
| `--input` | `bg-input` | ink-800 | ink-100 | Input fill |
| `--ring` | `ring-ring` | ink-600 | ink-400 | Focus ring only (`focus-visible:ring-4 ring-ring/30`) |
| `--destructive` | `bg-destructive` | ink-20 | ink-950 | Exists for shadcn compatibility. Same as primary. Not red. |
| `--border` | `border-border` | `transparent` | `transparent` | Kills stray borders. Never set it to a color. |
| `--hatch` | via `.hatch` | `rgb(255 255 255 / 0.05)` | `rgb(0 0 0 / 0.06)` | Unconfirmed / suggested facts |
| `--grain-lo` | (shader) | ink-950 | ink-975 `#111111` | Shader shadow color. Must resolve to hex. |
| `--grain-hi` | (shader) | ink-350 `#d4d4d4` | ink-10 `#f2f2f2` | Shader light color. Must resolve to hex. |

Foreground variants (`--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground`) all equal `--foreground` in both themes. Every semantic value points at a primitive; there are no literal hexes in the semantic layer.

### Rules

- Use semantic utilities only: `bg-card`, `bg-raised`, `text-muted-foreground`, `text-subtle`. Opacity modifiers are fine (`bg-raised/60`, `text-foreground/80`, `bg-background/60`).
- Never use primitives (`var(--ink-800)`), hex values, or Tailwind palette colors (`zinc-900`, `red-500`) in components.
- No status colors. Errors, warnings and success are expressed with words, position and the hatch. A confirmed state uses `bg-primary text-primary-foreground`.
- `--grain-lo` and `--grain-hi` must resolve to hex: the shader parses hex only (`cssColor()` in grain-shader.tsx).

---

## 2. Typography

### Families

| Tailwind | Family | Package | Role |
|---|---|---|---|
| `font-display` | Manrope Variable | `@fontsource-variable/manrope` | Display: headlines, titles, big figures |
| `font-sans` (default) | Inter Variable | `@fontsource-variable/inter` | Editorial and UI |
| `font-mono` | JetBrains Mono Variable | `@fontsource-variable/jetbrains-mono` | Data: locators, dates, token names |

Body has `font-feature-settings: "cv11", "ss01", "ss03"` and antialiasing (set in globals.css `@layer base`).

### Four roles

| Role | Recipe | Use |
|---|---|---|
| Display | `font-display font-medium` + `text-display-xl/lg/md` or `text-title` | h1, h2, statements, card titles, big numbers (`tabular-nums tracking-tight`) |
| Editorial | `text-lede text-muted-foreground text-pretty`, max `max-w-xl` | The lede under a heading; long-form reading (`text-[1rem] leading-[1.75] text-foreground/80` in `Prose`) |
| UI | `text-sm`, `text-[0.8125rem]`, `text-eyebrow` | Labels, nav, card body, buttons |
| Data | `text-data` + `font-mono` or `tabular-nums` | SourceChip, dates, captions, locators, metadata |

Display is always weight 500 (`font-medium`). Never bold display type. UI emphasis is `font-medium`, never `font-bold`.

### Scale (`@theme inline`)

| Class | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `text-display-xl` | `clamp(2.75rem, 5.6vw, 5.25rem)` | 1 | -0.045em | Hero h1, once per page (with `BlurHeading`) |
| `text-display-lg` | `clamp(2.25rem, 4vw, 3.75rem)` | 1.04 | -0.04em | Landing h1, statements, CTA band |
| `text-display-md` | `clamp(1.75rem, 2.6vw, 2.5rem)` | 1.1 | -0.035em | Section h2 (`SectionHeading`) |
| `text-title` | `clamp(1.125rem, 1.4vw, 1.375rem)` | 1.25 | -0.02em | Card titles, h3 |
| `text-lede` | `clamp(1rem, 1.2vw, 1.125rem)` | 1.6 | -0.008em | Lede paragraphs |
| `text-eyebrow` | `0.8125rem` | 1.2 | -0.005em | Label above a heading (`Eyebrow`) |
| `text-data` | `0.75rem` | 1.3 | | Chips, captions, metadata |

Supporting raw sizes used across the code: `text-sm` (14px) for body in cards and buttons, `text-[0.8125rem]` (13px) for secondary UI text, `text-[0.9375rem]` (15px) for card descriptions and inputs.

`src/lib/utils.ts` extends tailwind-merge with these names, so `cn("text-display-xl", "text-foreground")` keeps both. If you add a size to `@theme`, add it to the `font-size` class group there too.

### Type rules

- Headlines: `text-balance`. Paragraphs: `text-pretty`.
- Eyebrows are sentence case, `text-muted-foreground`, never uppercase letterspaced caps.
- Figures that are compared or aligned get `tabular-nums`.

---

## 3. Spacing and grid

### Tokens

| Token | Value | Applied by |
|---|---|---|
| `--max-w` | `82rem` | `.container-x1` max width |
| `--gutter` | `clamp(1.25rem, 4vw, 3rem)` | `.container-x1` inline padding |
| `--grid-gap` | `clamp(0.75rem, 1.5vw, 1rem)` | `.grid-12` column gap |
| `--section-y` | `clamp(6rem, 12vw, 10.5rem)` | `.section-y` block padding |
| `--section-y-tight` | `clamp(3.5rem, 7vw, 6rem)` | `.section-y-tight` block padding |

### Container and grid

```tsx
<Container>                      {/* .container-x1 */}
  <div className="grid-12 gap-y-12">   {/* 4 cols < 768px, 12 cols >= 768px */}
    <div className="col-span-4 md:col-span-5">…</div>
    <div className="col-span-4 md:col-span-7">…</div>
  </div>
</Container>
```

- Mobile has 4 columns, so mobile spans are `col-span-4` (full width). Add `md:col-span-*` for the 12-column layout.
- Centered content blocks use max widths instead of spans: `max-w-2xl` (SectionHeading), `max-w-3xl` (FAQ), `max-w-4xl`/`max-w-5xl` (card grids).
- Card grids that are not on `grid-12` use `grid grid-cols-1 gap-2 md:grid-cols-3`. **Card gap is `gap-2` (8px).** Tiles sit close together; the space between sections is what breathes.

### Section rhythm

- Every section is `<Section>` (`components/brand/primitives.tsx`) or a `<section className="section-y">`.
- `spacing="default"` → `section-y`; `spacing="tight"` → `section-y-tight` (FAQ, tables, related, dense reference); `spacing="none"` for pinned scenes that manage their own height.
- Never put margins between sections. The section padding is the gap.
- Inside a section: heading block → content gap is `mt-16 md:mt-20` for card grids under a `SectionHeading`, `mt-14` for FAQ lists.
- `<main>` has `pt-16` for the fixed 64px header (`h-16`).

### Mobile (390px and 360px are first-class)

- Collapse card grids to one column under `md` (`grid-cols-1 md:grid-cols-3`); use `sm:grid-cols-2` only when each card is still wide enough for its content.
- Stack labels above numbers on phones. Never put a label and a figure side by side if either could truncate.
- Tap targets at least 40px (`h-10`, `size-10`, or `min-h-10`). Button `size="sm"` (32px) only for dense desktop rows with a larger hit area around it.
- Wide tables scroll inside their own tile (`overflow-x-auto` on the wrapper), never the page. Prefer stacking key/value cards on phones when a table is only reference data.

---

## 4. Radii

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--radius-control` | `0.375rem` | `rounded-[var(--radius-control)]`, `rounded-sm`, `rounded-md` | Buttons, inputs, tab triggers, nav links |
| `--radius` | `0.5rem` | `rounded-[var(--radius)]`, `rounded-lg`, `rounded-xl` | Panels, accordion items, widgets, small cards |
| `--radius-tile` | `0.75rem` | `rounded-[var(--radius-tile)]`, `rounded-2xl` | Cards, tables, shader tiles, app window, CTA band |
| full | `9999px` | `rounded-full` | SourceChip, badges, avatars, pill links |

Nested elements step down one radius (tile → radius → control). Never use `rounded-3xl` or arbitrary pixel radii.

---

## 5. Surfaces

**No borders, anywhere.** `--border` is `transparent` and `* { @apply border-border }` is set in the base layer, so shadcn `border` classes render nothing. Do not work around it.

Depth is three tones plus space:

```
bg-background            page
  bg-card                first step: card, panel, table, accordion item
    bg-raised            second step: row, widget, chip, active tab
      bg-background      chips and inputs inside raised go back to background
```

- One tone step per nesting level. Never put `bg-card` on `bg-card`.
- Zebra rows and hovers use opacity of raised: `even:bg-raised/30`, `hover:bg-raised/60`.
- Elevation shadows are used only for one hero object (the app window: `shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]`). Cards have no shadow.
- Glass is for chrome only: the scrolled header (`bg-background/75 backdrop-blur-xl`) and chips over the shader (`bg-background/60 backdrop-blur`).
- Focus rings are the only lines allowed: `focus-visible:ring-4 focus-visible:ring-ring/30`.

### Hatch: the unconfirmed state

`.hatch` (globals.css) draws a soft 45° hatch from `--hatch`:

```css
.hatch { background-image: repeating-linear-gradient(-45deg, var(--hatch) 0 1px, transparent 1px 6px); }
```

Use it for anything X1 suggests but the household has not confirmed: a filing suggestion ("Harbor Works LLC · confirm?"), a draft not yet approved, an unverified fact ("Life policy: unconfirmed"), a pending source (`<SourceChip pending>`, `<Badge variant="pending">`). Combine with a fill (`hatch bg-raised`). When confirmed, remove the hatch and, if it is an action, switch to `bg-primary`.

---

## 6. Iconography

- Library: `lucide-react` only.
- Stroke: `strokeWidth={1.5}` for feature icons at `size-5`, `1.75` for small UI icons at `size-3`/`size-4`. Button icons inherit `size-4` from the button (`[&_svg:not([class*='size-'])]:size-4`).
- Icons sit in a tone tile, never an outline: `grid size-14 place-items-center rounded-[var(--radius)] bg-raised text-foreground/70` (capabilities grid) or `size-5 rounded-full bg-background` (SourceChip).
- Directional affordances: `ArrowRight` on CTAs (nudges `group-hover/button:translate-x-1`), `ArrowUpRight` for outbound or card links, `Plus` on accordions, `Check` in lists, `FileText` for documents.
- Icons are decorative unless they are the only content of a control; icon-only buttons need `aria-label`.
- No emoji, no illustrations, no stock photography. The shader and real product UI are the imagery.
