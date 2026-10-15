# AGENTS.md

This repo is the X1 Wealth website and design system. Every change must follow the design system exactly.

## Before writing code

1. Read [`design-system/AGENTS.md`](design-system/AGENTS.md) in full. It is the source of truth for tokens, the no-borders rule, themes, type roles, layout rhythm, mobile, motion budget, variety, provenance, copy and components.
2. Read the doc for the area you are touching: `foundations.md`, `components.md`, `motion.md`, `slices.md` or `brand.md` in `design-system/`.
3. Reuse what exists (`src/components/ui`, `brand`, `motion`, `slices`). Add a variant before adding a component.

## Non-negotiables

- Semantic tokens only (`bg-card`, `text-muted-foreground`, ...). No raw colors outside `src/app/globals.css`.
- No borders, outlines, dividers or hairlines anywhere. Separate with surface tone and spacing.
- Dark is the default theme; light must work too.
- GSAP only from `@/lib/gsap`. Hero entrance plus at most 2 to 3 signature moments per page. Respect reduced motion.
- Anything hidden before it animates uses a DOM ready attribute and is covered by the `x1-failsafe` list in `globals.css`.
- Only `<GrainShader>` for the shader, max 2 per page.
- 390px and 360px are first-class layouts.
- Never invent data. Never show balances, trading, money movement or budgeting. No em dashes in new copy.

## Before handing over

Follow [`design-system/QA.md`](design-system/QA.md). Minimum:

```bash
npm run qa:static
BASE_URL=http://localhost:3000 npm run qa:audit -- --paths=<routes you touched> --themes=dark,light
```

Then review screenshots against the checklist in QA.md section 3b. Work is done only when QA.md section 5 is satisfied.
