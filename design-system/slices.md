# Slices, templates and the content pipeline

The homepage is hand-built from sections in `src/components/sections/home/`. Every other marketing page (product, resources, compare, statistics, tools, legal …) is generated from scraped content and rendered by three templates and eleven slice kinds, most with several variants. Live catalog with counts and example links: `/design-system#slices`.

---

## 1. Pipeline

```
src/content/pages.json        scraped pages (scripts/scrape.mjs): path, category, title, description, h1, sections[].blocks
        │
src/lib/content.ts  getPage(path)
        │   hero      = blocks before the first h2 → eyebrow (short kicker before h1), h1, lede, meta ("By…", "Updated…")
        │   chunks    = body split at each h2 → { id, eyebrow?, heading?, blocks, kind }
        │   kind      = classify(blocks)        (first matching rule wins, see §2)
        │   template  = hub | article | landing (see §3)
        │   ctas      = first two distinct non-anchor CTAs
        │
src/app/[...slug]/page.tsx    generateStaticParams() over allPaths(); dynamicParams = false; metadata from title/description
        │
templates/{landing,article,hub}.tsx  →  slices/registry.tsx  <Slice chunk index page layout />  →  slices/<kind>.tsx
```

Block types (`Block` in lib/content.ts): `h1`–`h4`, `p`, `quote` (text), `list` (`ordered`, `items: string[][]` where each item is `[title, ...body]` lines), `table` (`caption`, `head`, `rows`), `dl` (`items: { term, def }[]`).

Content helpers:

| Function | Purpose |
|---|---|
| `getPage(path)` | Normalized `Page` or `null` |
| `allPaths()`, `hasPage(path)` | Static params, link checks |
| `resolveHref(href)` | Keeps a link local when the page exists here (and for `/`, `/design-system`); otherwise points at `https://x1wealth.com` |
| `childrenOf(hub)` | Child pages of a hub |
| `relatedTo(path, n = 3)` | Stable pseudo-random pages from the same section for "Keep reading" |
| `CATEGORY_LABEL` | Category → label ("features" → "Product") |

Headings matching `DROP_HEADINGS` (site-wide promos the scraper picked up, "Related resources", "Keep reading" …) are dropped; the templates render their own.

## 2. Slice kinds

`classify(blocks, heading)` in `src/lib/content.ts`, in order. The first rule that matches wins.

| # | Kind | Picked when |
|---|---|---|
| 1 | `sources` | The heading is reference material: Sources, References, Citations, Methodology, Data sources, Compliance note, Disclaimer, Cite this, Update cadence, Research notes (`META_HEADING`) |
| 2 | `checklist` / `prose` | The heading is a related-links heading (`RELATED_HEADING`): a list of 2+ becomes `checklist`, otherwise `prose` |
| 3 | `faq` / `prose` | The chunk has a definition list: `faq` when the dl carries the chunk (only dl and up to 3 paragraphs), otherwise `prose` |
| 4 | `faq` | Question / answer pairs written as h3 + p (75%+ of h3s end in "?"), with a FAQ-like heading or 3+ questions |
| 5 | `table` | The chunk has a table |
| 6 | `ranked` | 2+ h3s starting with a number (`1. `, `2) `), at least half of the h3s |
| 7 | `quote` | 1 or 2 short quotes (≤ 320 chars, no `[placeholder]`) in a short chunk (≤ 6 blocks) |
| 8 | `stats` | 3+ list items that read as statistics (`isStatList`) |
| 9 | `prose` | Any other chunk with quotes |
| 10 | `features` | 2+ h3s |
| 11 | `steps` | An ordered list with 3+ items |
| 12 | `checklist` | Any list with 3+ items |
| 13 | `statement` | At most one paragraph, under 220 characters |
| 14 | `prose` | Everything else |

### Slices and their variants

Most slices have several looks. On landing pages the composer (`planLanding()`, §3) picks the variant; other callers (`Slice` from the registry, articles) get a sensible default. Variant names below are the exact string values in code.

| Kind | File | Variants | Notes |
|---|---|---|---|
| `prose` | `prose.tsx` | `split` (heading cols 1–5, opening paragraph cols 7–12), `quote` (pull quote: the strongest sentence lifted large, signature-capable), `column` (heading cols 1–8, text offset to 5–12), `lead` (heading-less intro, centered column) | Opening line carries the section; the rest waits behind "Read more". `layout="article"` renders the full text |
| `statement` | `statement.tsx` | `scrub` (centered line that inks in, signature-capable), `band` (line on a slim shader strip; uses the page's spare shader), `quiet` (left display line, body low right), `note` (heading-less short note) | A short closing statement becomes the CTA band copy instead |
| `features` | `features.tsx` | `bento` (signature-capable), `tabs`, `contrast` ("X1 can" / "X1 can't"), `list` (compact index, no cards), `plans` (tiles led by a figure), `ledger` (figure-led rows, figure large on the right) | `featureFits(chunk)` lists the variants that suit the content. Question-titled groups follow as an accordion; trailing disclaimers go to the footnotes via `featureParts()` |
| `steps` | `steps.tsx` | `carousel` (snap row, swipeable on phones), `timeline` (heading cols 1–4, sequence cols 6–12, small mono numbers), `numerals` (large static numerals; once per page, short steps only) | `stepFits(chunk)`; title + first sentence, the rest behind "More"; caveats to footnotes via `stepParts()` |
| `checklist` | `checklist.tsx` | `rows` (two columns of short lines with a small check, six shown then fold), `prompts` (questions as "Ask X1" rows), `pills` (single words or short labels) | `checklistFits(chunk)`; extra paragraphs to footnotes via `checklistParts()` |
| `faq` | `faq.tsx` | `center` (centered heading over a 3xl accordion, like the homepage), `split` (heading cols 1–4, accordion cols 6–12), `glossary` (short-label dl as a term grid) | `faqFits(chunk)` |
| `table` | `table.tsx` → `data-body.tsx`, `data-table.tsx` | `bars` (label / single-unit number as proportional bars), `banded` (tone-banded rows), `tile` (table on a tile, raised header) | `pickTableVariant()`, static. Sticky first column, right-aligned tabular numbers, X1 row/column picked out by tone. 3+ columns become stacked cards on phones. In articles, 4+ column tables break out to cols 5–12 |
| `stats` | `stats.tsx` → `data-body.tsx`, `data-stats.tsx` | `strip` (2–4 figures on one band), `hero` (one lead figure, supporting figures beside), `ledger` (figure / claim rows) | `pickStatVariant()`. Citations move to small mono text. Only the page's first stats block counts up |
| `ranked` | `ranked.tsx` (+ `data-tabs.tsx`) | `leaderboard` (numbered rows that open), `tabs` (one entry at a time; phones get the leaderboard), `rows` (alternating rows with a large numeral) | Static. "Best for: …" lines become key facts; long bodies fold |
| `quote` | `quote.tsx` | `testimonial` (display quote with attribution; masked line rise), `pair` (two quotes on tone tiles), `pull` (static pull quote) | |
| `sources` | `sources.tsx` | One look: numbered footnote list in small mono text, notes in small muted type | No cards, no icons, no motion. Rendered once at the end of the page |
| (run of short statements) | `landing-pillars.tsx` | `grid` (tiles, signature-capable wipe), `rows` (two-column index with mono numbers) | 2+ consecutive heading + one-line chunks become one `PillarsSlice` |

Data slices (`table`, `stats`) share `DataFrame` / `DataHeading` (static headings) and `DataBody`, which renders blocks in order and keeps prose short (first paragraph, the rest behind `Disclosure`, "More context").

### The slice contract (`slices/types.ts`)

```ts
export type SliceProps = { chunk: Chunk; index: number; page: Page; layout?: "full" | "article" };
```

- `layout="full"` (landing and hub pages): the slice owns its `<section>`, `Container`, `id={chunk.id}` and vertical rhythm.
- `layout="article"`: rendered inside the article reading column. No Container, no section padding, fits about 42rem.
- Every slice must handle both layouts and render the chunk's `eyebrow` and `heading` when present.
- Slices with variants also accept `variant` and `motion` props from a composer; `Slice` from the registry falls back to a sensible default.

### Shared plumbing

| File | Role |
|---|---|
| `blocks.tsx` | `Prose` (long-form renderer), `ItemText` (list item lines), `DataTable` (simple table) |
| `landing-kit.tsx` | Server-safe helpers: `tidy()` drops scraped UI labels, `splitGroups()` at h3s, `isFigure`, `isFragment`, `SliceShell`, `SliceTitle` |
| `landing-motion.tsx` | `Enter` (rise / wipe / scale), `ScrubLine`, `VerticalTabs` |
| `data-motion.tsx` | `CountUp` (one per page) |
| `page-hero.tsx` + `landing-hero-motion.tsx` | `PageHero` with five variants (see §3) and its single entrance |
| `landing-compose.ts` | `planLanding()`: the landing composer (§3) |
| `landing-more.tsx` | `MoreOnThis` (fold accordion) and `Footnotes` ("Sources and notes") |
| `landing-pillars.tsx` | `PillarsSlice`: 2+ consecutive short heading + one-line statements become one grid |
| `related.tsx` | `RelatedSlice({ path, title = "Keep reading" })` in hub tile style |
| `hub-*.tsx` | Per-hub mastheads and indexes (`HubLibrary`, `HubCompare`, `HubStats`, `HubTools`, `HubProduct`, `HubPeople`, `HubFeatured`), cards (`HubCard`, `HubIconCard`, `HubToolCard`, `HubRow`), search and chips (`hub-controls.tsx`), Flip filtering (`hub-flip.ts`), 404 stage |
| `article-*.tsx` | `ArticleHero` (five voices), `ArticleHeroMotion`, `ArticleProgress`, `ArticleToc`, `ArticleTocMobile`, `article-utils.ts` |

## 3. Templates

The template is chosen in `getPage()`:

```ts
const template = HUBS.has(p.path) ? "hub" : ARTICLE.has(p.category) ? "article" : "landing";
// HUBS    = /resources /compare /statistics /tools /integrations /features /connect /blog /resources/authors
// ARTICLE = categories resources, compare, statistics, blog, legal, author
```

Every page ends with `CtaBand`. The 404 page (`src/app/not-found.tsx`) renders `NotFoundStage`: one shader field, one sentence, two ways back.

### Landing: `templates/landing.tsx` + `slices/landing-compose.ts`

The template only renders a plan. `planLanding(page)` returns `{ hero, units, more, notes, sources, closing }`:

1. **Hero:** `pickHeroVariant(page)` (page-hero.tsx) picks one of five variants by the page's position among its siblings, from a section-specific offset, so neighbouring pages always open differently. `stage` and `split` need 3+ sections and fall back to `editorial` or `compact`.

   | Variant | Look |
   |---|---|
   | `stage` | Centered headline, then a shader field with a floating "On this page" card |
   | `split` | Headline cols 1–7, a record card built from the page's own sections cols 8–12 |
   | `editorial` | Huge left-aligned headline, lede and actions to the right below it, no visual |
   | `shader` | Full-width shader panel with the headline overlaid low-left |
   | `compact` | Short left-aligned block flowing straight into the first section |

2. **Closing:** a short final statement becomes the `CtaBand` title and body (with the page's first CTA) instead of another big line.
3. **Sources:** `sources` chunks are pulled out and rendered once at the end by `SourcesSlice`.
4. **Notes:** low-value reference chunks (`LOW_VALUE` headings) and the notes each slice sets aside (`featureParts`, `stepParts`, `checklistParts`) become one "Sources and notes" footnote list (`Footnotes` in landing-more.tsx).
5. **Pillars:** runs of 2+ short statements become one `PillarsSlice`.
6. **Variants:** each unit takes the first variant that fits its content and has not been used on the page (`family:variant` is never repeated). After a tile-heavy section, a lighter variant is preferred.
7. **No repeats:** a section of the same family as the previous one folds instead of rendering. Exception: figure-led pairs (`plans` / `ledger`) and `/pricing`, where household and professional plans both stay visible. Repeated headings show once.
8. **Length:** at most **6** full sections (`MAX_SLICES`); the rest fold into **"More on this"** (`MoreOnThis`, one accordion, each item keeps its anchor id).
9. **Motion:** at most **3** signature moments (`MAX_SIGNATURES`), at least two sections apart, only on `statement:scrub`, `prose:quote`, `features:bento`, `pillars:grid`. Everything else gets `motion={false}`.
10. **Shaders:** at most 2 per page. The CTA band always has one; a `stage` or `shader` hero takes the other, otherwise one `statement:band` may.

Order on the page: hero → units → More on this → sources → footnotes → `CtaBand`.

### Article: `templates/article.tsx`

- **Hero by category** (`ArticleHero`, article-hero.tsx): resources = editorial; compare = typographic lockup ("X vs Y" or "N alternatives"); statistics = lead figure with its `SourceChip`; legal = plain; blog and author = name-led. Same grid and meta line.
- 12-col grid: sticky "On this page" TOC (cols 1–3) with a tone pill that glides to the active section (`ArticleToc`; `ArticleTocMobile` on small screens), reading column `#article-body` (cols 5–11).
- `ArticleProgress`: a reading progress fill at the top of the viewport.
- **Pull line:** one strong sentence per article (`pickPullQuote`, not on legal pages) set large in display type, removed from its paragraph.
- **Continue reading:** prose chunks over 350 words show their first two paragraphs; the rest sits behind "Continue reading" (`splitLong`; legal pages stay expanded).
- Wide tables (4+ columns) break out to cols 5–12 instead of scrolling in 42rem.
- Key takeaways, then back matter and `sources` collapsed into notes at the end, then `RelatedSlice` and `CtaBand`.
- Motion budget: hero entrance, progress fill, TOC pill. The body is static.

### Hub: `templates/hub.tsx`

Each hub gets its own masthead and index shape:

| Hub | Component | Shape |
|---|---|---|
| `/resources` | `HubLibrary` | Editorial left-aligned masthead with search, reading list with a sticky topic rail |
| `/compare` | `HubCompare` | Typographic "A vs B" masthead, compact table-like rows grouped as on the source |
| `/statistics` | `HubStats` | One headline figure from a report title (counts up once), reports as a quiet grid |
| `/tools` | `HubTools` | Compact header straight into a tool grid |
| `/integrations`, `/connect`, `/features` | `HubProduct` | Split hero with a small product fragment on the shader, index shape per hub |
| `/blog` | `HubFeatured` | One featured piece given room, text card beside a shader field |
| `/resources/authors` | `HubPeople` | Initials, name, one-line bio |

Filterable hubs use `hub-controls.tsx` (search, topic chips, empty state) and `useHubFilter` (hub-flip.ts) with `Flip`. Scraped hub copy that repeats the index is skipped (`SKIP` map); the rest renders as slices after the index.

`RelatedSlice({ path, title = "Keep reading" })` closes landing and article pages with three pages from `relatedTo()` in hub tile style.

## 4. How to add a page

**A scraped / SEO page:** add a `RawPage` object to `src/content/pages.json` (or re-run `scripts/scrape.mjs`). Structure the content with real `h2` sections; the pipeline does the rest. Pick the category so the right template applies. Check the result at its path and in `/design-system#slices` (counts update).

**A bespoke page** (like the homepage): create `src/app/<route>/page.tsx` and compose it from `Section` / `Container` / `SectionHeading`, ui and motion components. Export `metadata`. End with `<CtaBand />`. If the route should be linked from SEO content, add it to the local list in `resolveHref()`.

**Navigation:** `nav` and `footer` in `src/lib/site.ts`.

## 5. How to add a slice kind

1. Add the kind to `SliceKind` in `src/lib/content.ts` and a rule to `classify()` at the right priority (more specific rules first).
2. Create `src/components/slices/<kind>.tsx` exporting `<Kind>Slice(props: SliceProps)`. Support `layout="full"` and `"article"`. Use `SliceShell` / `Section` + `Container` for full, render `chunk.eyebrow` and `chunk.heading`, put `id={chunk.id}` on the root. If it has more than one look, export a `variant` type and a `…Fits(chunk)` helper so composers can pick deterministically.
3. Register it in `SLICES` in `slices/registry.tsx`. The map is `Record<SliceKind, …>`, so `tsc` fails until you do. If it has variants, teach `planLanding()` its candidates (and whether any variant is signature-capable) and render it in `templates/landing.tsx`.
4. Default to static. If the slice has a signature moment, gate it behind the `motion` prop so the page stays within its budget. Use `landing-motion.tsx` / `@/lib/gsap`, with no-flash hiding and reduced-motion handling.
5. Add the rule to `SLICE_RULES` in `src/app/design-system/page.tsx` and to the table above.
6. Check at 1440, 390 and 360px, dark and light.
