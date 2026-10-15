# QA.md: how to check X1 work before it ships

This is the QA process for anything built on the X1 design system: a new page, a new slice, a token change, a refactor.
It has three layers. Run them in order. Work is not done until all three pass.

| Layer | What it proves | How |
|---|---|---|
| 1. Static gates | It compiles, lints and builds every route | `npm run qa:static` |
| 2. Automated browser QA | Measurable design rules hold on every route, viewport and theme | `npm run qa:audit`, `qa:reveal`, `qa:shader` |
| 3. Visual review | It looks and moves like X1 | Screenshots + a scroll-through, against the checklist below |

`AGENTS.md` says what the rules are. This file says how to prove you followed them.

---

## 0. Setup

```bash
npm install
npm run dev                       # http://localhost:3000
```

All browser QA uses Playwright driving the system Chrome (`playwright-core`, `channel: "chrome"`). No browser download is needed.
Point the scripts at your server with `BASE_URL` (default `http://localhost:3000`). They work against `next dev` or `next start`.

A production build can run beside the dev server without touching its `.next` folder:

```bash
npm run build:check               # NEXT_DIST_DIR=.next-build next build
```

---

## 1. Static gates

```bash
npm run qa:static
```

Runs, and must pass, in order:

1. `npm run typecheck`: `tsc --noEmit`, zero errors.
2. `npm run lint`: ESLint, zero errors and zero warnings in files you touched.
3. `npm run build:check`: production build. Every route must prerender. The route table should list `/`, `/design-system`, `/_not-found` and `/[...slug]` with all content paths (164 static routes at the time of writing).

If you changed tokens in `src/app/globals.css`, also run `npm run tokens` and commit the regenerated `design-system/tokens.json`.

---

## 2. Automated browser QA

### 2a. Page audit: `npm run qa:audit`

```bash
BASE_URL=http://localhost:3000 npm run qa:audit                       # every route, 1440x900 + 390x844, dark
BASE_URL=http://localhost:3000 npm run qa:audit -- --sample=4         # every 4th route (fast smoke run)
BASE_URL=http://localhost:3000 npm run qa:audit -- --paths=/,/pricing --themes=dark,light --viewports=1440x900,390x844,360x780 --shots
```

It loads each route in Chrome, waits for entrances, checks the first viewport, scrolls the whole page, then checks the rest.
Output: `qa-report/report.md` and `qa-report/report.json` (git-ignored). `--shots` saves a screenshot of every failing page to `qa-report/shots/`.

**Errors (fail the run):**

| Check | Rule it enforces |
|---|---|
| HTTP status | 200 for every content route, 404 for an unknown route |
| Exactly one `<h1>`, visible after load | Hierarchy and the hero reveal |
| No content still hidden 2.8s after load | Hide-until-ready contract (motion.md). Any selector in the `x1-failsafe` list that is still hidden is a bug |
| No horizontal overflow | Mobile rules (390 and 360 are first-class) |
| No bordered or outlined elements | "No borders anywhere" (focus rings on the focused element are exempt) |
| At most 2 `GrainShader`s, no lost WebGL context | Shader rules |
| No duplicate `id`s | Anchors and accessibility |
| No console errors or page errors | Runtime health |
| Every `<img>` has `alt` | Accessibility |

**Warnings (review, do not block):**

- Tap targets under 32px on phones (buttons, nav links). The rule is 40px; anything flagged here must be checked by eye.
- An em dash in visible text. Allowed only inside scraped source copy; never in copy you write.

### 2b. Reveal stress: `npm run qa:reveal`

Reloads key pages and interrupts them 0, 150 and 450ms into the entrance, then does rapid client-side navigation through the header.
Fails if any headline or first-viewport text is left invisible. This is the test for "text sometimes disappears" bugs. Run it whenever you touch motion, SplitText, a hero, or a component that hides content before it animates.

### 2c. Shader stress: `npm run qa:shader`

Reloads three times, scrolls the whole page down and back, and flips the theme four times.
Fails on any lost WebGL context, more than 2 live contexts, or no visible shader in the first viewport. Run it whenever you touch `GrainShader`, add a shader to a page, or change page layout around one. Use `--path=/some/page` to test a specific page.

### 2d. Full suite

```bash
BASE_URL=http://localhost:3000 npm run qa       # static gates + sampled audit + reveal + shader
```

Before a release, run the audit on every route in both themes:

```bash
BASE_URL=http://localhost:3000 npm run qa:audit -- --themes=dark,light
```

---

## 3. Visual review

Automated checks cannot tell you whether a page is beautiful, calm or on-brand. A person or an agent with vision must look.

### 3a. Capture

```bash
node scripts/qa/shoot.mjs http://localhost:3000/pricing qa-report/pricing 1440 900          # dark desktop
node scripts/qa/shoot.mjs http://localhost:3000/pricing qa-report/pricing-m 390 844 light   # light phone
```

`shoot.mjs` scrolls the page in viewport-sized steps (so scroll-triggered entrances play) and saves one JPEG per step.
Review the frames in order. For long pages, combine frames into a contact sheet (for example with ffmpeg `hstack`/`vstack`) so the whole page can be judged at once.

Matrix for any new or changed page: **1440 dark, 390 dark, 1440 light, 360 light.** Add **reduced motion** (Chrome DevTools > Rendering > Emulate `prefers-reduced-motion: reduce`, or Playwright `reducedMotion: "reduce"`).

### 3b. Review checklist

Go through every item. Each one maps to a rule in `AGENTS.md`.

**First impression**
- [ ] The hero reads in one glance: one headline, one supporting line, at most two actions.
- [ ] The hero variant is different from sibling pages in the same section.
- [ ] Nothing flashes, jumps or reflows during load. Headlines rise or resolve once, then sit still.

**Layout and rhythm**
- [ ] Content sits on the 12-column grid (`container-x1`, `grid-12`). Edges line up between sections.
- [ ] Vertical spacing between sections is the `section-y` rhythm everywhere. No section is cramped, none is oddly loose.
- [ ] Surfaces step background → card → raised. No borders, no hairlines, no divider lines anywhere.

**Variety and brevity**
- [ ] No slice variant appears twice on the page. No two same-kind slices sit back to back.
- [ ] Big 01/02/03 numerals appear at most once.
- [ ] The page is not wordy: the strongest sentence is big, the rest is demoted or behind a quiet disclosure.
- [ ] Sources and notes are compact numbered mono footnotes, never cards with icons.
- [ ] The page is not too long: at most six full sections on landing pages, the rest folded into "More on this".

**Motion**
- [ ] Hero entrance plus at most two or three signature moments. Everything else is static.
- [ ] Scroll the page at normal speed: motion feels calm and premium, never bouncy, busy or late.
- [ ] Reduced motion: everything is visible immediately and nothing moves.

**Shader**
- [ ] The grain field fades in smoothly, shows soft folds and fine static grain (no flicker, no banding, no "TV static").
- [ ] The light follows the pointer gently on interactive stages.
- [ ] Text over the shader is legible in both themes.

**Mobile (390 and 360)**
- [ ] Multi-column cards collapse to one column early. Numbers and labels never collide or wrap into each other.
- [ ] No truncated chips, no text running out of tiles, no sideways scroll.
- [ ] Tap targets are at least 40px. Tables scroll cleanly or become stacked cards.

**Themes**
- [ ] Dark (default) and light both look intentional. Nothing loses contrast or disappears.

**Content and brand**
- [ ] Copy is the page's own copy (scraped or approved). No invented numbers, testimonials or features.
- [ ] Sentence case, no em dashes in new copy, no hype, no exclamation marks.
- [ ] Every household fact on a product surface has a `SourceChip`; unconfirmed facts are hatched; sends need approval.
- [ ] Nothing shows balances, trading, money movement, budgeting or card products.

### 3c. Writing up a review

Report findings as a short list, worst first. For each: page, viewport, theme, what is wrong, which rule it breaks, and the fix. Include the screenshot path. Re-run the relevant automated check after fixing.

---

## 4. Common failures and their fixes

| Symptom | Cause | Fix |
|---|---|---|
| Headline or hero text missing, sometimes | Split text ran outside the GSAP context, or a ready flag lives in React state or a class | Run SplitText inside `contextSafe(...)` passed to `afterFonts(...)` from `@/lib/gsap`. Set a DOM attribute (`data-*-ready`) when the tween takes over. Add the hide selector to the `x1-failsafe` list in `globals.css` and to `HIDE_SELECTORS` in `scripts/qa/audit.mjs` |
| Broken-image icon or blank where the shader should be | Raw WebGL, too many contexts, or a reused lost context | Only use `<GrainShader>`. Max 2 per page. Parent must be `relative isolate overflow-hidden` |
| Horizontal scroll on phones | `whitespace-nowrap` content, fixed widths, wide tables in a narrow column | Let it wrap or truncate below `sm`; tables use the table slice (stacked cards on phones) |
| "Bordered elements" in the audit | `border`, `divide-*`, `outline` or an `<hr>` | Replace with a surface step (`bg-card` / `bg-raised`) or spacing |
| Page feels repetitive | Same slice variant twice, or same kind back to back | Let `planLanding()` choose variants; add a new variant instead of reusing one |
| Page feels long or wordy | Every chunk rendered at full size | Fold low-value chunks; show first sentence big, rest in a disclosure |
| Numbers and labels collide in a tile | Side-by-side flex at phone width | Stack the label above the number below `sm`; `whitespace-nowrap` on short labels only |
| Motion feels tiring | Every component animates | Remove entrances outside the hero and the 2 to 3 signature moments |

---

## 5. Definition of done

A change is done when:

1. `npm run qa:static` passes.
2. `npm run qa:audit` passes for the routes you touched (both themes, 1440 and 390), and a sampled run passes for the whole site.
3. `npm run qa:reveal` and `npm run qa:shader` pass if you touched motion, heroes or the shader.
4. You reviewed screenshots against section 3b and fixed every finding.
5. Docs are updated: a new slice or variant is listed in `slices.md`; a new rule is in `AGENTS.md`; changed tokens are re-exported.
