# X1 Wealth: website and design system

The rebuilt X1 Wealth marketing site (homepage + 158 SEO pages) and the X1 design system it is built on.
Soft monochrome, a slow grain-gradient shader, Manrope display with Inter Variable text, no borders, dark by default.

**If you are a coding agent, read [`AGENTS.md`](AGENTS.md) first.**

## Start here

| You want to | Read |
|---|---|
| Understand the system | [`design-system/README.md`](design-system/README.md) |
| Implement anything | [`design-system/AGENTS.md`](design-system/AGENTS.md): the MUST / MUST NOT rules |
| Check your work | [`design-system/QA.md`](design-system/QA.md): how to run QA and the definition of done |
| See it live | `npm run dev`, then open `/design-system` |
| See previews | [`preview/`](preview/README.md): presentation boards, page and mobile shots |

## Commands

```bash
npm install
npm run dev                                   # http://localhost:3000
npm run qa:static                             # typecheck + lint + production build
BASE_URL=http://localhost:3000 npm run qa     # full QA suite (see design-system/QA.md)
npm run tokens                                # regenerate design-system/tokens.json from globals.css
npm run scrape                                # refresh src/content/pages.json from x1wealth.com
```

## Layout

```
src/app/                 routes: homepage, /design-system, [...slug] for every SEO page, globals.css (all tokens)
src/components/brand/    X1Mark, GrainShader, layout primitives, SourceChip
src/components/ui/       shadcn-style primitives (button, badge, card, accordion, tabs, table, input)
src/components/motion/   GSAP motion components (SplitHeading, BlurHeading, Reveal, ScrubWords, Magnetic)
src/components/sections/ homepage sections
src/components/slices/   SEO page slices, variants and the landing composer
src/components/templates/landing, article and hub templates
src/content/pages.json   scraped page content; src/lib/content.ts normalizes it into slices
design-system/           the handoff kit: rules, QA, foundations, components, motion, slices, brand, tokens, assets
scripts/qa/              automated QA: audit, reveal stress, shader stress, screenshots
preview/                 preview images for review
```

Stack: Next.js 15, React 19, Tailwind CSS v4, Radix, GSAP 3.13, Fontsource variable fonts.
