# Components

Every primitive, its props and variants, when to use it, and a snippet. Live versions: `/design-system#components`.

Import paths use the `@/*` alias (`src/*`). Always compose classes with `cn()` from `@/lib/utils`.

| Group | Path | Contents |
|---|---|---|
| Brand | `src/components/brand/` | `Section`, `Container`, `Eyebrow`, `SourceChip`, `SectionHeading` (primitives.tsx), `X1Mark`, `X1Lockup` (logo.tsx), `GrainShader` |
| UI | `src/components/ui/` | `Button`, `Badge`, `Card*`, `Input`, `Tabs*`, `Accordion*`, `Table*` |
| Motion | `src/components/motion/` | `Reveal`, `SplitHeading`, `BlurHeading`, `ScrubWords`, `Magnetic` (see motion.md) |
| Site | `src/components/site/` | `SiteHeader`, `SiteFooter`, `ThemeToggle`, `CtaBand` |

---

## Brand primitives

### `Section`

Owns vertical rhythm so spacing never drifts between pages. Every slice is a Section.

| Prop | Type | Default |
|---|---|---|
| `spacing` | `"default" \| "tight" \| "none"` | `"default"` → `section-y`; `tight` → `section-y-tight` |
| `id` | `string` | Anchor for in-page links |
| `className` | `string` | Always `relative` |

```tsx
<Section spacing="tight" id="faq">
  <Container>…</Container>
</Section>
```

### `Container`

`.container-x1`: max width `--max-w`, padding `--gutter`, centered. Wrap every section's content in it.

### `Eyebrow`

Small label above a heading: `text-eyebrow text-muted-foreground`. Sentence case. Never uppercase.

```tsx
<Eyebrow className="mb-5">Your household record</Eyebrow>
```

### `SectionHeading`

Centered heading block at the top of most sections: optional eyebrow, a `SplitHeading` in `font-display text-display-md font-medium`, optional lede (`text-lede text-muted-foreground`, `max-w-xl`).

| Prop | Type | Default |
|---|---|---|
| `title` | `ReactNode` | required |
| `eyebrow` | `ReactNode` | |
| `lede` | `ReactNode` | |
| `titleAs` | `"h1" \| "h2"` | `"h2"` |
| `className` | `string` | |

```tsx
<SectionHeading
  title="Everything a family office keeps track of"
  lede="Documents, entities, deadlines, decisions and the professionals around them, in one record you own."
/>
<ul className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:grid-cols-4">…</ul>
```

### `SourceChip` (provenance)

The most important small component. Every fact shown on an X1 surface points back to its document and, when it matters, how old it is.

| Prop | Type | Notes |
|---|---|---|
| `doc` | `string` | Document name. Short: "K-1", "Operating agreement", "Trust agreement" |
| `locator` | `string` | Where in the document, mono: "Item J", "§ 5.2", "Art. IV", "p. 3" |
| `asOf` | `string` | Freshness, mono, after a middle dot. Hidden under `sm` |
| `pending` | `boolean` | Hatches the chip: source suggested, not confirmed |
| `className` | `string` | Add `bg-background` when the chip sits on `bg-raised` |

Anatomy: `rounded-full bg-raised py-1 pr-3 pl-1 text-data text-muted-foreground`, a `size-5` round `bg-background` icon well with `FileText`, the doc name in `font-medium text-foreground`, locator in `font-mono`.

```tsx
<SourceChip doc="K-1" locator="Item J" asOf="Mar 14" />
<SourceChip className="bg-background" doc="Operating agreement" locator="§ 5.2" />
<SourceChip doc="Life policy" locator="p. 3" pending />
```

On phones keep `doc` short so the chip does not truncate (the locator truncates first: `min-w-0 truncate`).

### `X1Mark`, `X1Lockup`

```tsx
<X1Mark className="h-5" />            // header
<X1Mark className="h-7 self-start" /> // footer
<X1Lockup className="text-[3.5rem]" />  // mark + "Wealth"; size via font-size (em-based)
```

`X1Mark` renders the official vector paths (`logo-paths.ts`) with `fill="currentColor"`, default `h-6 w-auto`, `role="img"`, `aria-label` from `title` (default "X1"). Color it with `text-*`. See brand.md for usage rules.

### `GrainShader`

See motion.md § Shader. Props: `angle`, `light`, `grain`, `folds`, `interactive`, `speed`, `className`.

---

## UI primitives

### `Button` (`ui/button.tsx`)

cva variants. Base: `rounded-[var(--radius-control)] font-medium tracking-[-0.01em]`, `focus-visible:ring-4 ring-ring/30`, `disabled:opacity-40`, icons `size-4`, group name `group/button`.

| `variant` | Classes | Use |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/85` | The one primary action per view ("Start free", "Approve and send") |
| `secondary` | `bg-secondary hover:bg-secondary/70` | Secondary actions |
| `outline` | `bg-secondary hover:bg-accent` | Same tone as secondary (no outline exists). Used for non-featured pricing CTAs |
| `ghost` | `hover:bg-accent` | Tertiary, header "Sign in", "Read the manifesto" |
| `inverse` | `bg-background text-foreground` | On a `bg-primary` surface |
| `link` | underline on hover, no padding | Inline text links that need button semantics |

| `size` | Height | |
|---|---|---|
| `sm` | `h-8` (32px), `text-[0.8125rem]` | Dense rows on desktop only |
| `default` | `h-10` (40px) | Standard |
| `lg` | `h-11` (44px) | Hero and CTA band primary |
| `icon` | `size-10` | Icon-only; needs `aria-label` |

`asChild` renders the child (Radix Slot), used for links:

```tsx
<Magnetic>
  <Button size="lg" asChild>
    <Link href="/pricing">
      Start free
      <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
    </Link>
  </Button>
</Magnetic>
```

### `Badge` (`ui/badge.tsx`)

Pill: `rounded-full px-2.5 py-1 text-xs font-medium`.

| `variant` | Look | Use |
|---|---|---|
| `outline` (default) | `bg-raised text-foreground` | Neutral tag ("Trust") |
| `default` | `bg-primary text-primary-foreground` | Confirmed, featured |
| `secondary` | `bg-secondary` | Counts, metadata |
| `pending` | `hatch bg-raised text-muted-foreground` | Unconfirmed / suggested |

```tsx
<Badge variant="pending">Unconfirmed</Badge>
```

### `Card` (`ui/card.tsx`)

`Card` = `relative flex flex-col overflow-hidden rounded-2xl bg-card` (rounded-2xl = `--radius-tile`). Parts: `CardHeader` (`p-6 md:p-8`, gap-2), `CardTitle` (h3, `font-display text-title font-medium`), `CardDescription` (`text-[0.9375rem] leading-relaxed text-muted-foreground`), `CardContent`, `CardFooter` (`mt-auto`).

```tsx
<Card>
  <CardHeader>
    <CardTitle>Membership</CardTitle>
    <CardDescription>The office that keeps going after the first question.</CardDescription>
  </CardHeader>
  <CardFooter><Button size="sm" variant="outline">See pricing</Button></CardFooter>
</Card>
```

Many sections build lighter tiles inline instead: `rounded-[var(--radius)] bg-card p-6` (or `p-7`). Both are correct; use `Card` when you need header/footer structure.

### `Input` (`ui/input.tsx`)

`h-11 rounded-[var(--radius-control)] bg-input px-4 text-[0.9375rem]`, placeholder `text-muted-foreground`, focus `ring-4 ring-ring/20`. No border. Put the label above in `text-eyebrow text-muted-foreground`.

```tsx
<label className="flex flex-col gap-2">
  <span className="text-eyebrow text-muted-foreground">Ask your record</span>
  <Input placeholder="Which trust owns the rental LLC?" />
</label>
```

### `Tabs` (`ui/tabs.tsx`, Radix)

`Tabs` (flex-col gap-6), `TabsList` (`rounded-[var(--radius)] bg-card p-1`), `TabsTrigger` (`h-9 px-4 text-sm`, active `bg-raised text-foreground`), `TabsContent`. Pass `className="h-10"` to triggers on touch layouts. Add `flex-wrap max-w-full` to the list if labels may not fit at 360px.

```tsx
<Tabs defaultValue="business">
  <TabsList>
    <TabsTrigger value="business">Business</TabsTrigger>
    <TabsTrigger value="trust">Trust</TabsTrigger>
  </TabsList>
  <TabsContent value="business">…</TabsContent>
</Tabs>
```

### `Accordion` (`ui/accordion.tsx`, Radix)

Items are separate tiles (`rounded-[var(--radius)] bg-card px-6`, open: `bg-raised/60`) stacked with `gap-2`. Never divided by lines. Trigger: `py-5 text-[0.9375rem] md:text-xl font-medium`, with a `size-7` round plus that rotates 45° and turns `bg-primary` when open. Content: `max-w-2xl pb-6 text-sm leading-relaxed text-muted-foreground`.

```tsx
<Accordion type="single" collapsible className="mt-14 flex flex-col gap-2">
  {items.map((f) => (
    <AccordionItem key={f.q} value={f.q}>
      <AccordionTrigger>{f.q}</AccordionTrigger>
      <AccordionContent>{f.a}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

### `Table` (`ui/table.tsx`)

Wrapper `overflow-x-auto rounded-2xl bg-card`; header `bg-raised/60`; rows `even:bg-raised/30 hover:bg-raised/60`; `TableHead` `h-12 px-5 text-xs font-medium text-muted-foreground`; `TableCell` `px-5 py-4 tabular-nums`; `TableCaption` `text-xs text-muted-foreground`. Give the `Table` a `min-w-[…]` when columns would crush on phones; the wrapper scrolls, the page does not.

Put a `SourceChip` in a "Source" column whenever the table shows household facts.

---

## Site components

| Component | What it is | Notes |
|---|---|---|
| `SiteHeader` | Fixed `h-16` header. Transparent at top, `bg-background/75 backdrop-blur-xl` after 24px; hides on scroll down after 160px, returns on scroll up (GSAP). Mobile menu below `md`. | Nav items from `src/lib/site.ts` → `nav` |
| `SiteFooter` | Mark, one-line promise, email, four link groups (`footer` in site.ts), the regulatory line | Required copy: X1 is not an RIA, law firm, or accounting firm, and does not hold, trade or move money |
| `ThemeToggle` | Sun/Moon button. Toggles `.dark` on `<html>` and stores `x1-theme` in localStorage | Dark is default; see "Theme" below |
| `CtaBand` | Closing slice on every page: a `dark` tile with the CTA shader preset, `SplitHeading` (`text-display-lg`), one line, one `Magnetic` primary button | Props: `title`, `body`, `primary: { label, href }`. Landing pages pass their closing statement here |

### Theme

- `src/app/layout.tsx` runs an inline boot script before paint: adds `js` to `<html>` (enables split-heading pre-hide) and adds `dark` unless localStorage `x1-theme` is `"light"`.
- `<html suppressHydrationWarning>` is required because the class is set before React hydrates.
- To force a theme on one region (e.g. the CTA band is always dark), add `className="dark bg-background text-foreground"` to that element.
- Never read the theme in render. If a component must react to theme changes (the shader does), observe the `class` attribute on `document.documentElement`.
