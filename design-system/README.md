# X1 Wealth design system: handoff kit

**Soft monochrome.** One neutral ink scale, no borders, a slow grain shader, Manrope for display, Inter for text, JetBrains Mono for data, calm 12-column layouts and slow GSAP motion. Every fact points back to its source.

This folder is the handoff for humans and coding agents. The running reference page is **`/design-system`** on the site (`src/app/design-system/page.tsx`): every swatch, type style and component there renders from the real tokens and components.

## What X1 is (one paragraph)

X1 Wealth is "a family office built around you": software for complex households with an operating business, trusts, properties and several professionals. It keeps the whole record, reads the documents, and tells the household which professional needs to hear about what, before the deadline. It never trades or moves money. Every answer points back to its source document. The household owns its record, and nothing goes to a professional without approval. The design exists to make that feel calm, sourced and trustworthy.

## How to read this kit

| File | Read it when | Contents |
|---|---|---|
| **AGENTS.md** | Before writing any code | MUST / MUST NOT rules and the pre-ship checklist. Coding agents: load this first, every session |
| **QA.md** | Before handing anything over | The QA process: static gates, automated browser audits (`npm run qa`), visual review checklist, common failures and fixes, definition of done |
| `foundations.md` | Building layouts or styling anything | Color (3 layers, both themes), type roles and scale, spacing, grid, mobile, radii, surfaces, hatch, icons |
| `components.md` | Using or adding a component | Every primitive: props, variants, usage, snippets. Theme mechanics |
| `motion.md` | Adding animation or the shader | GSAP setup, motion tokens, each motion component, homepage and SEO patterns, the grain shader |
| `slices.md` | Working on SEO pages | Content pipeline, eleven slice kinds and their variants, three templates, hero variants, variety rules, adding pages and slices |
| `brand.md` | Writing copy or illustrations | What X1 is and never does, pillars, voice, the Avery household, provenance patterns, logo |
| `tokens.json` | Porting tokens to another stack | W3C design-tokens JSON (primitives, light + dark semantic, type, spacing, radii, motion, shader presets). Generated |
| `assets/brand/` | Logo files | `x1-mark.svg` (currentColor), `-black`, `-white` |
| `assets/shader/` | Porting the shader | `grain-shader.tsx` (React component), `grain.vert`, `grain.frag` (GLSL) |

## Quick start (in this repo)

```bash
npm install
npm run dev                       # then open /design-system
npm run tokens                    # after changing tokens: regenerates tokens.json and re-syncs assets/
npm run qa:static                 # typecheck + lint + production build (beside the dev server)
BASE_URL=http://localhost:3000 npm run qa   # full QA suite, see QA.md
```

Stack: Next.js 15 (app router), React 19, Tailwind CSS v4 (CSS-first config in `globals.css`), shadcn-style primitives on Radix, `class-variance-authority`, `tailwind-merge`, GSAP 3.13 + `@gsap/react`, `lucide-react`, Fontsource variable fonts.

### Where things live

```
src/app/globals.css            tokens: primitives → semantic (light :root, dark .dark) → @theme; .container-x1 .grid-12 .section-y .hatch
src/app/layout.tsx             theme boot script (dark default), header, footer
src/lib/utils.ts               cn() with tailwind-merge taught the custom type scale
src/lib/gsap.ts                GSAP + ScrollTrigger/SplitText/Flip, motion tokens, afterFonts() (the only GSAP import)
src/lib/content.ts             SEO content pipeline: pages.json → Page → chunks → slice kinds
src/components/brand/          Section, Container, Eyebrow, SourceChip, SectionHeading, X1Mark, GrainShader
src/components/ui/             Button, Badge, Card, Input, Tabs, Accordion, Table
src/components/motion/         Reveal, SplitHeading, BlurHeading, ScrubWords, Magnetic
src/components/site/           SiteHeader, SiteFooter, ThemeToggle, CtaBand
src/components/sections/home/  the homepage, section by section
src/components/slices/         SEO slices, variants, landing composer (landing-compose.ts), hub and article parts
src/components/templates/      landing, article, hub
```

### Porting to another codebase

1. Copy the `:root`, `.dark` and `@theme inline` blocks and the `@layer components` utilities from `src/app/globals.css` (or map `tokens.json` into your token pipeline; aliases use `{color.ink.950}` syntax and each token has `x1.css` and `x1.resolved` extensions).
2. Install the three Fontsource variable fonts.
3. Copy `src/lib/utils.ts`, `src/lib/gsap.ts`, and the `brand/`, `ui/`, `motion/` component folders.
4. Add the theme boot script from `src/app/layout.tsx` to your document head.
5. Follow AGENTS.md.

## The principles in six lines

1. **Provenance first.** Every fact shows its source and age (`SourceChip`).
2. **Tone, not lines.** No borders. Background, card, raised. Hatch for unconfirmed.
3. **Dark first, light equal.** Semantic tokens only.
4. **Calm by default.** Generous rhythm, one idea per section, short pages, one shader moment per viewport.
5. **Motion explains, sparingly.** Hero entrance plus two or three signature moments. Off for reduced motion.
6. **The household decides.** Nothing is sent without approval. X1 never moves money.
