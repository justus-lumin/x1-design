# AGENTS.md: implementing the X1 design system

Strict instructions for coding agents building X1 Wealth pages and components. **MUST** and **MUST NOT** are requirements. When a rule here conflicts with a habit or a library default, the rule wins. When something is not covered, follow the principles in README.md and ask.

Source of truth, in order: the code (`src/app/globals.css`, `src/lib/gsap.ts`, `src/components/**`) → `tokens.json` (generated) → these docs. Live reference: `/design-system`.

---

## 1. Tokens

- MUST use semantic Tailwind utilities for every color: `bg-background`, `bg-card`, `bg-raised`, `bg-primary`, `text-foreground`, `text-muted-foreground`, `text-subtle`, `bg-input`, `ring-ring`. Opacity modifiers are allowed (`bg-raised/60`).
- MUST NOT use hex, rgb, primitives (`var(--ink-*)`), or Tailwind palette colors (`zinc-*`, `neutral-*`, `red-*`) in components.
- MUST NOT introduce any hue: no brand color, no status colors (red/amber/green), no colored links.
- MUST use the radius tokens: `rounded-[var(--radius-control)]` (controls), `rounded-[var(--radius)]` (panels), `rounded-[var(--radius-tile)]` or `rounded-2xl` (cards, tiles), `rounded-full` (chips).
- MUST use the type scale classes (`text-display-xl|lg|md`, `text-title`, `text-lede`, `text-eyebrow`, `text-data`) for their roles. New sizes go into `@theme` in globals.css **and** the tailwind-merge group in `src/lib/utils.ts`.
- MUST change tokens only in `src/app/globals.css`, then run `node scripts/export-tokens.mjs`. MUST NOT edit `tokens.json` or `assets/` by hand.
- `--grain-lo` / `--grain-hi` MUST resolve to hex (the shader parses hex only).

## 2. No borders

- MUST NOT draw lines: no `border`, `border-*` colors, `divide-*`, `<hr>`, `outline` as decoration, `ring` as decoration, dashed outlines, inset box-shadow lines, separators.
- MUST separate surfaces by tone and space: `bg-background` → `bg-card` → `bg-raised`, one step per nesting level. Chips and inputs inside `bg-raised` use `bg-background`.
- MUST NOT nest `bg-card` in `bg-card`.
- Focus rings (`focus-visible:ring-4 focus-visible:ring-ring/30`) are the only permitted line.
- MUST NOT set `--border` to anything but `transparent`.
- Card grids MUST use `gap-2`. Shadows only on one hero object per page.

## 3. Theme

- Dark is the default. MUST keep the boot script in `src/app/layout.tsx` (adds `js`, and `dark` unless localStorage `x1-theme` is `"light"`) and `<html suppressHydrationWarning>`.
- Every component MUST look correct in both themes using semantic tokens only. MUST NOT use the `dark:` variant to patch colors.
- To force dark on a region (CTA band), add `className="dark bg-background text-foreground"` to it.

## 4. Type roles

- Display: `font-display font-medium` (Manrope, weight 500), `text-balance`. MUST NOT bold display type.
- Editorial: `text-lede text-muted-foreground text-pretty`, max `max-w-xl`.
- UI: Inter, `text-sm` / `text-[0.8125rem]` / `text-eyebrow`. Emphasis is `font-medium`, never `font-bold`.
- Data: `text-data` with `font-mono` (locators, dates, token names) or `tabular-nums` (figures).
- One `text-display-xl` per page (the hero, with `BlurHeading`). Section h2s are `text-display-md` via `SectionHeading` / `SplitHeading`.
- Eyebrows MUST be sentence case, MUST NOT be uppercase or letterspaced.

## 5. Layout and rhythm

- Every section MUST be a `<Section>` (or `section-y` / `section-y-tight`) with a `<Container>` (`container-x1`). Use `grid-12` for multi-column layouts.
- MUST NOT add margins between sections; section padding is the gap. `section-y` by default, `section-y-tight` for dense content.
- Heading → content gap under a `SectionHeading`: `mt-16 md:mt-20`.
- Content MUST NOT exceed `--max-w` (82rem). Reading columns ~42rem.

## 6. Mobile (390px and 360px are first-class layouts)

- MUST design and check every page at **390px and 360px**, not just shrink desktop.
- MUST collapse multi-column card grids to **one column early** (`grid-cols-1 md:grid-cols-*`). Use `sm:grid-cols-2` only if each card still fits its content comfortably.
- MUST NOT squeeze numbers and labels side by side on phones. Stack the label above the value.
- MUST NOT truncate chips (`SourceChip`, badges, pills). Keep chip text short or let the row wrap (`flex-wrap`).
- Tap targets MUST be at least **40px** (`h-10`, `size-10`, `min-h-10`). `Button size="sm"` (32px) is for dense desktop rows only. Tab triggers on touch layouts get `className="h-10"`.
- MUST NOT cause horizontal page scroll. Wide tables scroll inside their own tile (`overflow-x-auto`), or become stacked cards on phones.
- Long code, URLs and token names MUST wrap (`break-words` / `break-all`) instead of overflowing.

## 7. Motion

- MUST import GSAP only from `@/lib/gsap` (exports `gsap`, `ScrollTrigger`, `SplitText`, `Flip`, `useGSAP`, `motion`, `prefersReducedMotion`, `afterFonts`). MUST register new plugins there.
- MUST use `useGSAP(() => …, { scope })`. Tweening event handlers MUST be `contextSafe`.
- MUST start every animation with `if (prefersReducedMotion()) return;` leaving content in its final, visible state.
- Entrances: `ease: motion.ease` (expo.out), durations from `motion.dur`, `once: true`. Use `autoAlpha`, not `opacity`. Clear `filter` after blur tweens.
- Content hidden before animation MUST be hidden by CSS scoped to `.js` with a `:not([data-…-ready])` selector, and MUST be visible without JS and with reduced motion (motion.md § No flash).
- The ready/done marker MUST be a persistent DOM attribute set when the tween takes over (`el.dataset.xReady = "true"`), also in the reduced-motion branch. MUST NOT use a React-managed class or state for it (a re-render would re-hide the content).
- Every hide selector MUST be added to the `x1-failsafe` list in globals.css, which forces `visibility: visible` after 2.5s no matter what.
- SplitText MUST run inside `contextSafe` and be scheduled with `afterFonts(fn)` (returns a cancel for cleanup), so re-mounts revert cleanly. Set the ready attribute in `finally`. MUST NOT call `document.fonts.ready.then` directly.
- Desktop-only scenes (pins) MUST use `gsap.matchMedia()` with `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`.
- MUST NOT add looping decorative animation, parallax on body text, bounce or spring easing (except `Magnetic`'s return), or scroll-jacking outside a deliberate pinned scene.

### Motion budget (per page)

- A page gets **the hero entrance plus at most 2 to 3 signature moments** (e.g. one pinned or scrubbed scene, one statement that inks in, one assembling grid).
- Everything else is **static or one soft fade** (a single `Reveal` on the block, not on each item).
- MUST NOT stagger every list item on every list. Per-item stagger is reserved for a signature moment.
- MUST NOT use scrubbed numeral fills (ink filling step numbers as you scroll).
- `BlurHeading` once per page (hero). `ScrubWords` / `ScrubLine` at most once per page. `Magnetic` only on the primary CTA.
- Shader: always `<GrainShader>` (never raw WebGL), inside a parent with `relative isolate overflow-hidden` and a radius token; **at most 2 shaders per page** and one per viewport. `CtaBand` always uses one, so the other goes to the hero (`stage`/`shader` variants) or one `statement:band`. The component already handles StrictMode, context limits (context only within 200px of the viewport), context loss, a CSS fallback and reduced motion; do not re-implement any of that.

## 8. Variety and brevity (SEO pages and templates)

- Landing pages MUST be composed through `planLanding()` (slices/landing-compose.ts), not by mapping chunks to slices directly. It enforces the rules below.
- Pages MUST NOT all share one hero. Templates choose among several hero and slice variants **deterministically** (derive the choice from the page path or chunk index, never `Math.random()`, so SSR and client agree and a page always looks the same).
- MUST NOT use the same slice variant twice on a page. MUST NOT place two slices of the same kind back to back; merge them or change the variant.
- Big-numeral lists (large index numbers, ranked or steps) at most **once per page**.
- Show the strongest sentence big; demote the rest to body or muted text.
- Long bodies go behind quiet disclosures (accordion tiles, "Read more"), not walls of copy.
- Sources and notes MUST be compact numbered footnotes in small mono text (`font-mono text-data text-muted-foreground`), never cards and never check-icon lists.
- Pages SHOULD be short and calm: at most **6 full sections**; the rest fold into the "More on this" accordion. Closing statements become the CTA band's copy instead of another big line. Cut repetition before adding a section.
- Exception: figure-led pairs (pricing tiers, then add-ons) may sit back to back in two different looks; `/pricing` keeps both plan sections.

## 9. Provenance

- Every household fact shown (figure, date, clause, ownership) MUST carry a source: `<SourceChip doc locator asOf />`.
- Unconfirmed or suggested facts MUST use the hatch (`.hatch`, `<SourceChip pending>`, `<Badge variant="pending">`). MUST NOT use dashed outlines or color for this.
- Two disagreeing sources: show both values, each with its chip. Do not pick a winner in the UI; the professional decides.
- Anything that leaves the household MUST show an approval step ("Approve and send") and the line "Nothing is sent until you approve." or equivalent.
- Unknowns are written as "Unknown" with a pending chip. MUST NOT invent or round values beyond the source.
- Example data MUST use the Avery household (brand.md § 4). MUST NOT invent other families, names or numbers.

## 10. Copy

- Sentence case for everything: headings, buttons, nav, eyebrows, table heads.
- MUST NOT use em dashes (—) or en dashes as punctuation. Use a period, comma or colon. Separate metadata with a spaced middle dot ` · `.
- Plain, calm, concrete. No hype words (revolutionize, unlock, supercharge, seamless, game-changing), no exclamation marks, no urgency.
- Curly quotes and apostrophes in JSX (`&rsquo;`, `&ldquo;`, `&rdquo;`).
- Professionals by role ("your CPA", "Sam Reyes, CPA"). Address the reader as "you".

## 11. What X1 must never show

- Trading, buying, selling, rebalancing, transfers, payments, "move money", or any execute-style action.
- Live balances presented as custody, performance charts as advice, portfolio recommendations.
- Investment, tax or legal advice framed as X1's own conclusion.
- Anything sent to a professional automatically, or a CTA implying X1 acts without approval.
- Fake logos, fake testimonials, fake press, fake statistics. Figures on SEO pages come from the scraped source text.
- The footer's regulatory line MUST stay: X1 is not a registered investment adviser, law firm or accounting firm, and does not hold, trade or move money.

## 12. Components

- MUST reuse `src/components/ui/*`, `src/components/brand/*`, `src/components/motion/*` before writing new primitives. MUST NOT fork variants inline; add a cva variant instead.
- Compose classes with `cn()` from `@/lib/utils`.
- Icon-only buttons MUST have `aria-label`. Icons from `lucide-react` only.
- The logo is always `<X1Mark />` with `currentColor`; never an `<img>` of a recolored file.
- New slices follow the contract and steps in slices.md § 5.

---

## Pre-ship checklist

Run this for every page or component before you hand it over. `QA.md` explains how to run each check, what the
automated audits measure, and the definition of done. The short version:

```bash
npm run qa:static                                   # typecheck, lint, production build
BASE_URL=http://localhost:3000 npm run qa:audit -- --paths=<routes you touched> --themes=dark,light
BASE_URL=http://localhost:3000 npm run qa:reveal    # if you touched motion or a hero
BASE_URL=http://localhost:3000 npm run qa:shader    # if you touched the shader or a page with one
```

**Build**
- [ ] `npx tsc --noEmit` passes. `npm run lint` passes.
- [ ] Production build passes: `NEXT_DIST_DIR=.next-build npx next build` (runs beside the dev server without touching `.next`).
- [ ] If tokens changed: `node scripts/export-tokens.mjs` was run and `design-system/tokens.json` is committed.
- [ ] No console errors or hydration warnings in dev.

**Tokens and surfaces**
- [ ] `grep -nE "#[0-9a-fA-F]{3,6}|ink-[0-9]|zinc-|neutral-|slate-|gray-"` on changed files finds nothing outside globals.css.
- [ ] `grep -nE "\bborder\b|border-[a-z]|divide-|<hr"` on changed files finds nothing (focus rings excepted).
- [ ] Radii are token radii. Card grids use `gap-2`.

**Themes**
- [ ] Checked in dark (default) and light via the header toggle. Nothing disappears or loses contrast.

**Mobile**
- [ ] Checked at 1440, 390 and 360px wide.
- [ ] No horizontal page scroll (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Card grids are one column on phones; labels sit above numbers; no truncated chips.
- [ ] Every tap target is at least 40px.

**Motion**
- [ ] Hero entrance + at most 2 to 3 signature moments. No per-item stagger on every list, no scrubbed numeral fills.
- [ ] With `prefers-reduced-motion: reduce`, everything is visible and static.
- [ ] With JS disabled, all content is visible. Any new hide selector is in the `x1-failsafe` list.
- [ ] SplitText runs via `contextSafe` + `afterFonts`; ready markers are DOM attributes, not React state.
- [ ] GSAP imported only from `@/lib/gsap`.
- [ ] At most 2 `<GrainShader>` on the page, each in a `relative isolate overflow-hidden` parent.

**Variety and brevity**
- [ ] The hero variant differs from sibling pages; variant choice is deterministic.
- [ ] No slice variant used twice; no two same-kind slices back to back; at most one big-numeral list.
- [ ] Strongest sentence big, the rest demoted; long bodies in disclosures; sources as numbered mono footnotes.

**Content**
- [ ] Sentence case. No em dashes (`grep -n "—"`). No hype, no exclamation marks.
- [ ] Every household fact has a SourceChip; unconfirmed facts are hatched; sends need approval.
- [ ] Nothing shows trading, money movement, or advice.
- [ ] Example data uses the Avery household only.
