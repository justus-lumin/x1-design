# Motion

GSAP 3.13 (`gsap`, `@gsap/react`) with ScrollTrigger and SplitText. Motion is slow, eased out, and explanatory: it shows a sequence (a document arrives, is read, a question goes out) or guides reading. It never bounces (except the Magnetic return), never loops for decoration, and is fully off under `prefers-reduced-motion`.

Live demos with replay buttons: `/design-system#motion`.

---

## 1. Setup

`src/lib/gsap.ts` is the only place plugins are registered. Always import from it:

```ts
import { gsap, Flip, ScrollTrigger, SplitText, useGSAP, motion, prefersReducedMotion, afterFonts } from "@/lib/gsap";
```

Never `import { gsap } from "gsap"` in a component. Registered and exported plugins: `ScrollTrigger`, `SplitText`, `Flip`. Helpers: `motion` (tokens), `prefersReducedMotion()`, `afterFonts(fn, timeout)`. Register any new plugin in `lib/gsap.ts` and export it from there.

### Component pattern

```tsx
"use client";
import { useRef } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

export function Cards() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-card]", {
        autoAlpha: 0,
        y: motion.distance,
        duration: motion.dur.base,
        ease: motion.ease,
        stagger: motion.stagger,
        scrollTrigger: { trigger: "[data-cards]", start: "top 80%", once: true },
      });
    },
    { scope: root } // selectors resolve inside root; everything reverts on unmount
  );
  return <section ref={root}>…</section>;
}
```

Rules:

- `useGSAP` with `{ scope }`, never raw `useEffect`, so tweens and ScrollTriggers are cleaned up.
- Target elements with `data-*` attributes (`data-card`, `data-reveal`, `data-stage`), not classes.
- Event handlers that tween must be wrapped in `contextSafe` (second arg of the `useGSAP` callback).
- Entrances are `once: true`. Content does not re-animate when scrolling back up.
- Use `autoAlpha` (opacity + visibility), not `opacity`, for entrances.
- When animating `filter: blur()`, add `clearProps: "filter"` so the element is crisp afterwards.
- For layouts that only exist on desktop (pinned scenes), use `gsap.matchMedia()` with `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`.

### Tokens

| Token (`motion.*`) | Value | Use |
|---|---|---|
| `ease` | `expo.out` | Every entrance |
| `easeInOut` | `power3.inOut` | Scene swaps, scrubbed timelines |
| `dur.fast` | `0.45s` | Small UI feedback |
| `dur.base` | `0.9s` | Reveal, cards, blocks |
| `dur.slow` | `1.4s` | Headlines |
| `stagger` | `0.08s` | Between siblings |
| `distance` | `28px` | Rise distance |

CSS twins in globals.css: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`. CSS transitions use `duration-300` to `duration-500` with `ease-[var(--ease-out)]` (buttons: `transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-out)]`). Theme switch: body background/color transition `0.5s var(--ease-out)`.

ScrollTrigger start positions in use: `"top 85%"` (headings, Reveal), `"top 80%"` / `"top 82%"` (grids), `"top 88%"`–`"top 90%"` (batched cards and article blocks).

### Reduced motion

- Every motion component checks `prefersReducedMotion()` first and returns, leaving content in its final state.
- globals.css shortens all CSS animations and transitions to `0.01ms` under `prefers-reduced-motion: reduce`, and unhides `[data-split]` headings.
- The shader renders one still frame.
- Smooth scrolling (`scrollIntoView({ behavior })`) uses `"auto"` when reduced motion is on.

### No flash before animation (hide-until-ready)

Anything that starts hidden must be hidden by CSS before hydration, scoped to `.js` (the boot script adds `js` to `<html>`), and revealed when GSAP takes over. Without JS or with reduced motion it must show immediately.

The contract:

1. Hide with a selector of the form `.js [data-x]:not([data-x-ready])`.
2. Set the **ready/done attribute directly on the DOM** (`el.dataset.xReady = "true"` or `setAttribute("data-x-done", "")`) at the moment the tween takes over, also in the reduced-motion branch. It is persistent: never a React-managed class or state, which a re-render would wipe and re-hide.
3. Add the selector to the **failsafe** list in globals.css. Every hide selector there gets `animation: x1-failsafe 0s linear 2.5s forwards`, which forces `visibility: visible` after 2.5s whatever happens to JS, fonts or GSAP.

Hide selectors in use (all covered by the failsafe):

| Selector | Set ready by |
|---|---|
| `.js [data-split]:not([data-split-ready])` | `SplitHeading`, `BlurHeading` |
| `.js [data-ar-hero]:not([data-ar-done])` | `ArticleHeroMotion` |
| `.js [data-hub-pending]:not([data-hub-done])` | `useHubEntrance` (`HubRevealStyle`) |
| `.js [data-hero]:not([data-hero-ready]) :is([data-hero-fade],[data-stage],[data-toc],[data-card])` | `HeroMotion` (`HERO_CSS` in page-hero.tsx) |
| `.js [data-lm]:not([data-lm-ready]) [data-lm-item]` | `Enter` (landing-motion.tsx) |

### Split text and fonts

SplitText measures lines, so it must run after fonts load, and it must be revertible:

```tsx
useGSAP((_, contextSafe) => {
  const el = ref.current;
  if (!el) return;
  const ready = () => void (el.dataset.splitReady = "true");
  if (prefersReducedMotion() || !contextSafe) return ready();
  const split = contextSafe(() => {
    try {
      SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, onSplit: (self) => gsap.from(self.lines, { yPercent: 105, … }) });
    } finally {
      ready();
    }
  });
  return afterFonts(split); // runs when fonts are ready or after 700ms; returns a cancel for cleanup
}, { scope: ref });
```

- Create the split **inside `contextSafe`**, so a re-mount (StrictMode, navigation) reverts it cleanly: no double split, no orphaned hidden text.
- Use `afterFonts(fn, timeout = 700)` from `@/lib/gsap`, never a bare `document.fonts.ready.then(…)`: it never waits forever and returns a cancel function for cleanup.
- Set the ready attribute in `finally`, so a failed split still shows the text.

---

## 2. Motion components (`src/components/motion/`)

### `Reveal`

Fade and rise on scroll. Children marked `data-reveal` animate in sequence; otherwise the wrapper itself.

| Prop | Default | |
|---|---|---|
| `as` | `"div"` | Polymorphic |
| `stagger` | `motion.stagger` | |
| `delay` | `0` | |
| `y` | `motion.distance` | |
| `start` | `"top 85%"` | `"load"` animates immediately (hero) |

Tween: `autoAlpha 0 → 1, y → 0, duration dur.base, ease expo.out`.

```tsx
<Reveal className="grid grid-cols-1 gap-2 md:grid-cols-3">
  {plans.map((p) => <div key={p.name} data-reveal className="rounded-[var(--radius)] bg-card p-7">…</div>)}
</Reveal>
```

### `SplitHeading`

Section headlines rise line by line out of a mask. Splits inside `contextSafe` via `afterFonts()`, sets `data-split-ready` in `finally`, splits with `SplitText` (`type: "lines", mask: "lines", autoSplit: true`), tweens `yPercent: 105 → 0`, `duration dur.slow`, `stagger 0.09`. Props: `as` (default `h2`), `className`, `start` (`"top 85%"`, or `"load"`), `delay`. Used inside `SectionHeading`, `CtaBand`, testimonial, FAQ.

```tsx
<SplitHeading className="font-display text-display-md font-medium">How it works</SplitHeading>
```

### `BlurHeading`

The hero headline only, once per page. Characters resolve from `blur(14px)`, `yPercent 30`, `scale 1.08` to focus, `duration 1.4`, `stagger 0.025`, plays on load after `delay` (default `0.2`). Props: `as` (default `h1`), `className`, `delay`.

```tsx
<BlurHeading className="max-w-4xl font-display text-display-xl font-medium">A family office built around you.</BlurHeading>
```

### `ScrubWords`

A statement whose words ink from `opacity 0.14` to `1` as you scroll, scrubbed (`start "top 78%"`, `end "bottom 42%"`, `scrub 0.6`). Props: `text` (string), `className`. One per page at most. The SEO twin is `ScrubLine` in `slices/landing-motion.tsx` (keeps the heading tag, waits for fonts).

```tsx
<ScrubWords className="max-w-4xl font-display text-display-lg font-medium" text="Your financial life belongs to you. …" />
```

### `Magnetic`

Gentle pointer pull for primary CTAs. `gsap.quickTo` on x/y, `duration 0.6`, `elastic.out(1, 0.5)`, `strength` default `0.22`. Wrap the primary button only; never a whole card.

```tsx
<Magnetic><Button size="lg" asChild><Link href="/pricing">Start free <ArrowRight /></Link></Button></Magnetic>
```

---

## 3. Patterns on the homepage (`src/components/sections/home/`)

| Section | Pattern | Details |
|---|---|---|
| `hero.tsx` | Load timeline | `[data-hero-fade]` blur 6px + y 14 from 0.6s, `[data-stage]` y 80 at 0.9s (1.6s), `[data-greet]`, `[data-widget]` (stagger from random), `[data-prompt]` |
| | Scrubbed 3D | App window `rotateX 22 → 0`, `scale 0.9 → 1` scrubbed from `top 85%` to `top 15%` (`scrub 0.8`) inside `[perspective:1600px]` |
| | Pointer tilt | `quickTo` rotateX/rotateY, at most 4–5°, `power3.out` |
| | Typing prompt | Infinite timeline types and deletes example questions (`0.035s` per char) |
| `how-it-works.tsx` | Pinned scrubbed scenes (desktop) | `matchMedia` ≥1024px; pin `+=2800`, `scrub 0.7`, `snap` to labels; four scenes swap with blur 8px + `clipPath` wipe; step list highlights by progress; suggested filing turns from hatch to `bg-primary` (confirmation) |
| `capabilities.tsx` | Grid assembles | Icons `scale 0.6 → 1`, stagger `{ grid: [2, 4], from: "center" }`, labels follow |
| `someone.tsx` | Clip wipe + scramble | Tiles `clipPath inset(100% 0 0 0 round var(--radius))` up; "One record." scrambles through glyphs `X1#%/-_=+<>` then settles |
| `statement.tsx` | `ScrubWords` | Ownership thesis |
| `testimonial.tsx`, `pricing-preview.tsx` | `SplitHeading` + `Reveal` | |
| `site-header.tsx` | Hide on scroll | `yPercent -100` after 160px scrolling down, back on scroll up |

## 4. Patterns on SEO pages (`src/components/slices/`)

SEO pages follow the motion budget strictly. On landing pages `planLanding()` (landing-compose.ts) hands each slice a `motion` flag: the hero entrance plus **at most 3 signature moments**, at least two sections apart. Signature-capable variants: `statement:scrub`, `prose:quote`, `features:bento`, `pillars:grid`. Every other slice renders static.

| File | Pattern |
|---|---|
| `landing-hero-motion.tsx` → `HeroMotion` | One entrance per hero variant, same timing as the home hero (`[data-hero-fade]` blur 6px + rise); the `stage` variant's "On this page" card drifts `yPercent 6 → -6`, scrubbed |
| `landing-motion.tsx` → `Enter` | Group entrance, `kind`: `"rise"`, `"wipe"` (clip-path from below), `"scale"`. Only when a slice holds a signature moment |
| `landing-motion.tsx` → `ScrubLine` | `statement:scrub`: heading inks in word by word |
| `data-motion.tsx` → `CountUp` | The page's first stats block counts up once, then settles on the exact source string. Nothing else in data slices moves |
| `quote.tsx` → `testimonial` | Masked line rise, the quote slice's only motion |
| `article-motion.tsx` → `ArticleHeroMotion` | Article budget: hero entrance, `ArticleProgress` reading fill, and the TOC pill that glides to the active section. The body is static |
| `hub-reveal.tsx` → `useHubEntrance` | Hub masthead entrance |
| `hub-flip.ts` → `useHubFilter` | Search and topic filtering; `Flip` (from `@/lib/gsap`) glides tiles into place |

---

## 5. The grain shader

`src/components/brand/grain-shader.tsx` (copied to `assets/shader/`, GLSL split into `grain.vert` / `grain.frag`). Raw WebGL1, no dependencies.

**Look:** slow, soft folds of light, like draped fabric under a window, with fine static film grain. Low-frequency fbm warp, two drifting sine creases across a light ramp, a soft pointer pool, then grain hashed to the device pixel grid (texture, not TV static).

### Props

| Prop | Default | Range | Effect |
|---|---|---|---|
| `angle` | `35` | 0–360 | Direction the light comes from (0 = right, 90 = top) |
| `light` | `0.5` | 0–1 | How much of the field is lit |
| `folds` | `0.7` | 0–1 | Fold contrast |
| `grain` | `0.09` | 0–0.2 | Grain strength |
| `interactive` | `false` | bool | Light leans toward the pointer. Listens on the shader's parent element (the wrapper itself is `pointer-events-none`) |
| `speed` | `1` | 0–3 | Drift speed |
| `className` | | | On the `absolute inset-0` wrapper |

### Presets in use (generated list: `tokens.json → shader.presets`)

| Preset | Props | Where |
|---|---|---|
| Hero | `angle={20} light={0.55} folds={0.75} interactive` | Home hero stage, SEO `stage` hero |
| CTA band | `angle={70} light={0.3} folds={0.8} interactive` | `CtaBand` (always inside a `dark` tile) |
| Hub featured | `angle={30} light={0.42} grain={0.08} folds={0.7} interactive` | `HubFeatured` |
| 404 | `angle={60} light={0.32} folds={0.8} interactive` | `NotFoundStage` |
| Shader hero | `angle={28} light={0.5} folds={0.8} interactive` | SEO `shader` hero variant (page-hero.tsx) |
| Product hub | `angle={25} light={0.5} folds={0.75} interactive` | `HubProduct` |
| Statement band | `angle={160} light={0.4} folds={0.6}` | `statement` → `band` (static light, not interactive) |
| Defaults | `angle 35, light 0.5, folds 0.7, grain 0.09` | |

### Usage

```tsx
<div className="relative isolate overflow-hidden rounded-[var(--radius-tile)]">
  <GrainShader angle={20} light={0.55} folds={0.75} interactive />
  <div className="relative">…content…</div>
</div>
```

- The parent needs `relative isolate overflow-hidden` and a radius token. Content goes in a `relative` sibling after the shader.
- Colors come from `--grain-lo` / `--grain-hi`, re-read when the `<html>` class changes. Both must be hex.
- Always use `<GrainShader>`. MUST NOT write raw WebGL or a second shader component.
- **Max 2 shaders per page**, and one shader moment per viewport.

### Robustness (built into the component)

- **Own canvas per mount.** Each effect run creates its own `<canvas>`, so React StrictMode's dev double-mount never reuses a lost context.
- **Context only near the viewport.** A WebGL context is created when the shader comes within 200px of the viewport (IntersectionObserver `rootMargin: "200px 0px"`) and released when it is far away, so pages never hit the browser's context limit.
- **Context loss rebuilds.** On `webglcontextlost` the canvas is dropped and rebuilt.
- **CSS fallback underneath.** The wrapper itself paints an approximation: `--grain-lo` background, a radial light pool in `--grain-hi` placed by `angle` and sized by `light`, and an SVG fractal-noise grain. With no or slow WebGL it still looks right.
- **Fade in after the first real frame.** The canvas starts at opacity 0 and fades in (700ms) only once a frame has drawn.
- **Reduced motion:** one still frame. DPR is capped at 2; resizes via ResizeObserver; theme changes re-read the colors.
- Placement: Pages use it for the hero stage and the closing CTA band, sometimes a featured hub tile. Never as a full-page background, never behind body text.
- Text on the shader sits on its own surface (`bg-background/85 backdrop-blur-xl` card, or chips `bg-background/60 backdrop-blur`), except large display type in the CTA band.
