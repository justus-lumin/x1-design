// Foundations sections of /design-system: principles, logo, color, type, layout, radii, surfaces.
import type { CSSProperties } from "react";
import { FileText } from "lucide-react";
import { X1Lockup, X1Mark } from "@/components/brand/logo";
import { Eyebrow, SourceChip } from "@/components/brand/primitives";
import { cn } from "@/lib/utils";
import type { CssTokens } from "./css-tokens";
import { GridOverlayToggle, LiveValue, MeasuredVar } from "./live";
import { DsSection, DsSub, Rule, SpecTable, ThemeScope, Tok } from "./parts";

/* ------------------------------------------------------------------ principles */

const PRINCIPLES = [
  { k: "Provenance first", t: "Every fact shown points back to the document it came from, and says how old it is. The SourceChip is the most important small component." },
  { k: "Tone, not lines", t: "No borders anywhere. Surfaces separate by tone (background, card, raised) and by space. Unconfirmed facts get a soft hatch." },
  { k: "Dark first, light equal", t: "Dark is the default theme. Light is a complete twin. Components use semantic tokens only, so both themes come free." },
  { k: "Calm and short", t: "Generous, consistent spacing. The strongest sentence big, the rest demoted or behind a disclosure. Pages vary their heroes and slices, and stay short." },
  { k: "Motion explains, sparingly", t: "A hero entrance plus two or three signature moments per page: a document arrives, gets read, a question goes out. Everything else is still or one soft fade. Off for reduced motion." },
  { k: "The household decides", t: "X1 prepares, the family approves. Nothing goes to a professional without approval. X1 never trades or moves money, and the UI never implies it does." },
];

export function Principles() {
  return (
    <DsSection id="principles" index="01" title="Principles" lede="Six rules every page follows. When a choice isn't covered by a token or a component, decide with these.">
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {PRINCIPLES.map((p, i) => (
          <li key={p.k} className="flex flex-col gap-3 rounded-[var(--radius-tile)] bg-card p-6">
            <span className="font-mono text-data text-subtle">{String(i + 1).padStart(2, "0")}</span>
            <p className="font-display text-title font-medium">{p.k}</p>
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{p.t}</p>
          </li>
        ))}
      </ol>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ logo */

export function Logo({ tokens }: { tokens: CssTokens }) {
  const L = tokens.lightScope;
  return (
    <DsSection
      id="logo"
      index="02"
      title="Logo"
      lede="The X1 mark is drawn from the official vector (components/brand/logo-paths.ts). It is always currentColor, so it takes the ink of the surface it sits on."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="rounded-[var(--radius-tile)] bg-card p-2"><ThemeScope theme="dark" lightVars={L} className="flex aspect-[4/3] h-full flex-col justify-between rounded-[var(--radius)] p-5">
          <span className="text-data text-muted-foreground">On dark</span>
          <X1Mark className="h-14 self-center" />
          <span className="font-mono text-data text-subtle">text-foreground on bg-background</span>
        </ThemeScope></div>
        <div className="rounded-[var(--radius-tile)] bg-card p-2"><ThemeScope theme="light" lightVars={L} className="flex aspect-[4/3] h-full flex-col justify-between rounded-[var(--radius)] p-5">
          <span className="text-data text-muted-foreground">On light</span>
          <X1Mark className="h-14 self-center" />
          <span className="font-mono text-data text-subtle">text-foreground on bg-background</span>
        </ThemeScope></div>
        <div className="flex aspect-[4/3] flex-col justify-between rounded-[var(--radius-tile)] bg-card p-6">
          <span className="text-data text-muted-foreground">Lockup, X1Lockup</span>
          <X1Lockup className="self-center text-[3.5rem]" />
          <span className="font-mono text-data text-subtle">Footer and brand moments only</span>
        </div>
      </div>

      <div className="grid-12 gap-y-2">
        <DsSub
          className="col-span-4 md:col-span-6"
          title="Clear space"
          note="Keep at least half the mark's height clear on every side. The hatched area shows the minimum; nothing (text, edges, other marks) enters it."
        >
          <div className="flex items-center justify-center rounded-[var(--radius-tile)] bg-card py-12">
            <div className="hatch rounded-[var(--radius-control)] p-8">
              <X1Mark className="h-16" />
            </div>
          </div>
        </DsSub>
        <DsSub
          className="col-span-4 md:col-span-6"
          title="Sizes in use"
          note="Height drives size; width follows (w-auto). Below 12px the counter of the 1 closes up, so 12px is the minimum."
        >
          <div className="grid h-full min-h-48 grid-cols-2 items-end gap-x-6 gap-y-10 rounded-[var(--radius-tile)] bg-card px-6 py-10 sm:grid-cols-4">
            {[
              { c: "h-3", w: "12px", u: "Product chrome" },
              { c: "h-5", w: "20px", u: "Site header" },
              { c: "h-7", w: "28px", u: "Footer" },
              { c: "h-14", w: "56px", u: "Brand moment" },
            ].map((s) => (
              <div key={s.c} className="flex flex-col items-center gap-3">
                <X1Mark className={s.c} />
                <span className="flex flex-col items-center gap-0.5 text-center">
                  <span className="font-mono text-data text-foreground">{s.w}</span>
                  <span className="text-data text-subtle">{s.u}</span>
                </span>
              </div>
            ))}
          </div>
        </DsSub>
      </div>

      <DsSub title="Don't">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Rule kind="dont" title="Stretch or squash it.">
            <X1Mark className="h-10 scale-x-150" />
          </Rule>
          <Rule kind="dont" title="Rotate it or set it on an angle.">
            <X1Mark className="h-10 -rotate-12" />
          </Rule>
          <Rule kind="dont" title="Outline it or add effects.">
            <X1Mark className="h-10 text-transparent [&_path]:stroke-foreground [&_path]:[stroke-width:3]" />
          </Rule>
          <Rule kind="dont" title="Set it in low contrast or a color.">
            <X1Mark className="h-10 text-raised" />
          </Rule>
        </div>
      </DsSub>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ color */

const GROUPS: { title: string; keys: string[] }[] = [
  { title: "Surfaces", keys: ["--background", "--card", "--raised", "--popover", "--muted", "--secondary", "--accent", "--input"] },
  { title: "Ink", keys: ["--foreground", "--muted-foreground", "--subtle-foreground", "--card-foreground", "--popover-foreground", "--secondary-foreground", "--accent-foreground"] },
  { title: "Action", keys: ["--primary", "--primary-foreground", "--ring", "--destructive"] },
  { title: "Texture", keys: ["--hatch", "--grain-lo", "--grain-hi", "--border"] },
];

function Swatch({ name }: { name: string }) {
  // The hatch frame keeps a swatch visible even when it matches the surface behind it.
  return (
    <span className="hatch grid size-10 shrink-0 place-items-center rounded-[var(--radius-control)]">
      <span className="size-7 rounded-[calc(var(--radius-control)-2px)]" style={{ background: `var(${name})` }} />
    </span>
  );
}

function SemanticPanel({ theme, tokens }: { theme: "light" | "dark"; tokens: CssTokens }) {
  const vars = theme === "dark" ? { ...tokens.root, ...tokens.dark } : tokens.root;
  return (
    <div className="rounded-[var(--radius-tile)] bg-card p-2"><ThemeScope theme={theme} lightVars={tokens.lightScope} className="flex h-full flex-col gap-8 rounded-[var(--radius)] p-5 md:p-7">
      <p className="font-display text-title font-medium">{theme === "dark" ? "Dark (default)" : "Light"}</p>
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-1">
          <Eyebrow className="mb-2">{g.title}</Eyebrow>
          {g.keys
            .filter((k) => vars[k] !== undefined)
            .map((k) => {
              const tw = tokens.tailwindColor(k);
              return (
                <div key={k} className="flex items-center gap-3 py-1.5">
                  <Swatch name={k} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-mono text-data break-all text-foreground">{k}</span>
                    <span className="font-mono text-data break-all text-subtle">
                      {vars[k].replace(/^var\(--(.+)\)$/, "$1")}
                      {tw && ` · ${tw}`}
                    </span>
                    <LiveValue name={k} className="text-muted-foreground sm:hidden" />
                  </div>
                  <LiveValue name={k} className="hidden text-muted-foreground sm:inline" />
                </div>
              );
            })}
        </div>
      ))}
    </ThemeScope></div>
  );
}

export function Color({ tokens }: { tokens: CssTokens }) {
  return (
    <DsSection
      id="color"
      index="03"
      title="Color"
      lede="One neutral ink scale, no chroma. Three layers: primitives, then semantic tokens per theme, then Tailwind utilities. Components only ever touch the semantic layer."
    >
      <DsSub title="Primitives" note="The ink scale in globals.css. Never referenced by components; semantic tokens point at it. Values below are read live from the page.">
        <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-5 lg:grid-cols-[repeat(15,minmax(0,1fr))]">
          {tokens.primitives.map(([k]) => (
            <div key={k} className="flex flex-col gap-2">
              <span className="hatch aspect-[2/1] rounded-[var(--radius-control)] p-1 lg:aspect-[3/4]">
                <span className="block size-full rounded-[calc(var(--radius-control)-2px)]" style={{ background: `var(${k})` }} />
              </span>
              <span className="font-mono text-data text-foreground">{k.slice(6)}</span>
              <LiveValue name={k} className="-mt-1.5 text-subtle" />
            </div>
          ))}
        </div>
      </DsSub>

      <DsSub
        title="Semantic tokens, both themes"
        note={
          <>
            Each panel renders in its own theme. Left column: CSS variable and the primitive or literal it maps to, plus the Tailwind name (
            <Tok>bg-card</Tok>, <Tok>text-muted-foreground</Tok>). Right: the computed value.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <SemanticPanel theme="dark" tokens={tokens} />
          <SemanticPanel theme="light" tokens={tokens} />
        </div>
      </DsSub>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Rule kind="do" title="Use bg-card, text-muted-foreground, bg-raised. Semantic names survive a theme switch." />
        <Rule kind="dont" title="Use primitives (var(--ink-800)), hex values, or Tailwind palette colors (zinc-900) in components." />
        <Rule kind="dont" title="Add a brand hue, status colors, or red for errors. Emphasis comes from ink weight and position." />
      </div>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ type */

const ROLES = [
  {
    role: "Display",
    font: "Manrope · font-display · weight 500",
    sample: <p className="font-display text-display-md font-medium">A family office built around you.</p>,
    use: "Headlines (display-xl, display-lg, display-md) and titles. Tight negative tracking is built into the tokens.",
  },
  {
    role: "Editorial",
    font: "Inter · text-lede · muted-foreground",
    sample: (
      <p className="max-w-md text-lede text-muted-foreground text-pretty">
        X1 keeps the whole record, reads the documents, and tells you which professional needs to hear about what.
      </p>
    ),
    use: "The lede under a heading and long-form reading. Max about 36rem, text-pretty.",
  },
  {
    role: "UI",
    font: "Inter · text-sm, 0.8125rem, text-eyebrow",
    sample: (
      <div className="flex flex-col gap-2">
        <p className="text-eyebrow text-muted-foreground">Next 90 days</p>
        <p className="text-sm font-medium">Extended K-1s are due Sep 15</p>
        <p className="text-[0.8125rem] text-muted-foreground">Harbor Works LLC · waiting on your CPA</p>
      </div>
    ),
    use: "Labels, navigation, body copy in cards, buttons. Sentence case always.",
  },
  {
    role: "Data",
    font: "JetBrains Mono / Inter · text-data · tabular-nums",
    sample: (
      <div className="flex flex-col gap-2">
        <p className="font-display text-4xl font-medium tabular-nums tracking-tight">50.000%</p>
        <p className="font-mono text-data text-muted-foreground">K-1 · Item J · Mar 14</p>
      </div>
    ),
    use: "Figures, dates, locators, token names. Big figures use font-display with tabular-nums; small ones font-mono.",
  },
];

export function Typography({ tokens }: { tokens: CssTokens }) {
  return (
    <DsSection
      id="type"
      index="04"
      title="Typography"
      lede="Three families, four roles. Sizes are fluid tokens (clamp), with line height and tracking baked in, so a single class sets the whole style."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {ROLES.map((r) => (
          <div key={r.role} className="flex flex-col gap-6 rounded-[var(--radius-tile)] bg-card p-6 md:p-8">
            <div className="flex flex-col gap-1">
              <p className="font-display text-title font-medium">{r.role}</p>
              <p className="font-mono text-data text-subtle">{r.font}</p>
            </div>
            <div className="flex min-h-28 items-center">{r.sample}</div>
            <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{r.use}</p>
          </div>
        ))}
      </div>

      <DsSub
        title="Scale"
        note={
          <>
            Defined in the <Tok>@theme</Tok> block of globals.css and registered with tailwind-merge in lib/utils.ts, so{" "}
            <Tok>cn(&quot;text-display-xl&quot;, &quot;text-foreground&quot;)</Tok> keeps both.
          </>
        }
      >
        <div className="flex flex-col gap-1">
          {tokens.typeScale.map((t) => {
            const display = /^display|^title/.test(t.name);
            return (
              <div key={t.name} className="grid-12 items-baseline gap-y-3 rounded-[var(--radius)] bg-card px-5 py-6">
                <div className="col-span-4 flex flex-col gap-1 md:col-span-3">
                  <span className="font-mono text-data text-foreground">text-{t.name}</span>
                  <span className="font-mono text-data text-subtle">
                    {t.lineHeight && `lh ${t.lineHeight}`}
                    {t.tracking && ` · ${t.tracking}`}
                  </span>
                  <MeasuredVar name={`--text-${t.name}`} className="text-subtle" />
                </div>
                <p
                  className={cn("col-span-4 text-balance break-words md:col-span-9", display && "font-display font-medium", t.name === "data" && "font-mono")}
                  style={{ fontSize: `var(--text-${t.name})`, lineHeight: t.lineHeight, letterSpacing: t.tracking } as CSSProperties}
                >
                  {t.name === "eyebrow" ? "Your household record" : t.name === "data" ? "Operating agreement · § 5.2 · Mar 21" : t.name === "lede" ? "Ask your record. The answer cites the page and the clause." : "Less remembering. More deciding."}
                </p>
              </div>
            );
          })}
        </div>
      </DsSub>

      <DsSub title="Families">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {tokens.fonts.map((f) => (
            <div key={f.name} className="flex flex-col gap-4 rounded-[var(--radius-tile)] bg-card p-6">
              <span className={cn("text-5xl", f.name === "display" && "font-display font-medium", f.name === "mono" && "font-mono")}>Aa 12</span>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-data text-foreground">font-{f.name}</span>
                <span className="font-mono text-data text-subtle">{f.stack.split(",")[0].replace(/"/g, "")}</span>
              </div>
            </div>
          ))}
        </div>
      </DsSub>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ layout */

// Static class names so Tailwind generates them.
const SPAN: Record<number, string> = { 3: "md:col-span-3", 4: "md:col-span-4", 5: "md:col-span-5", 7: "md:col-span-7", 9: "md:col-span-9" };

const LAYOUT_TOKENS = [
  { k: "--max-w", u: ".container-x1 max width" },
  { k: "--gutter", u: ".container-x1 side padding" },
  { k: "--grid-gap", u: ".grid-12 column gap" },
  { k: "--section-y", u: "Section padding, top and bottom" },
  { k: "--section-y-tight", u: "Dense section padding" },
];

export function Layout({ tokens }: { tokens: CssTokens }) {
  return (
    <DsSection
      id="layout"
      index="05"
      title="Spacing and grid"
      lede="Every page sits on the same container and 12-column grid, and every section gets the same vertical rhythm. Spacing is decided by the section, never by the content inside it."
    >
      <SpecTable
        head={["Token", "Definition", "At this viewport", "Use"]}
        mono={[1, 2]}
        rows={LAYOUT_TOKENS.map((t) => [t.k, tokens.root[t.k], <MeasuredVar key={t.k} name={t.k} />, t.u])}
      />

      <DsSub
        title="12-column grid"
        note={
          <>
            <Tok>container-x1</Tok> then <Tok>grid-12</Tok>: 4 columns under 768px, 12 from 768px. Common splits below. Toggle the overlay to check any page section against the grid.
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="grid-12 gap-y-2">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className={cn("grid h-10 place-items-center rounded-[var(--radius-control)] bg-raised font-mono text-data text-muted-foreground", i >= 4 && "hidden md:grid")}>
                {i + 1}
              </div>
            ))}
          </div>
          {[
            [5, 7, "How it works: copy 5, panel 7"],
            [4, 4, 4, "Three cards"],
            [3, 9, "This page: nav 3, content 9"],
          ].map((row) => {
            const label = row[row.length - 1] as string;
            const spans = row.slice(0, -1) as number[];
            return (
              <div key={label} className="flex flex-col gap-2 pt-3">
                <span className="text-data text-muted-foreground">{label}</span>
                <div className="grid-12 gap-y-2">
                {spans.map((s, i) => (
                  <div
                    key={i}
                    className={cn("col-span-4 flex h-12 items-center rounded-[var(--radius-control)] bg-card px-4 font-mono text-data text-muted-foreground", SPAN[s])}
                  >
                    <span className="md:hidden">col-span-4</span>
                    <span className="hidden md:inline">col-span-{s}</span>
                  </div>
                ))}
                </div>
              </div>
            );
          })}
          <div className="pt-4">
            <GridOverlayToggle />
          </div>
        </div>
      </DsSub>

      <DsSub
        title="Section rhythm"
        note={
          <>
            Every slice is a <Tok>&lt;Section&gt;</Tok>: <Tok>section-y</Tok> by default, <Tok>section-y-tight</Tok> for dense content (FAQ, tables, related). Never add margin between sections; the padding is the gap.
          </>
        }
      >
        <div className="flex flex-col gap-1 rounded-[var(--radius-tile)] bg-card p-3">
          {[
            { n: "Hero", y: "pt-24 / md:pt-36" },
            { n: "Section", y: "section-y" },
            { n: "Section", y: "section-y" },
            { n: "Section, tight", y: "section-y-tight" },
            { n: "CTA band", y: "section-y" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col rounded-[var(--radius)] bg-background">
              <span className={cn("hatch rounded-t-[var(--radius)]", s.y === "section-y-tight" ? "h-4" : "h-7")} />
              <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 text-[0.8125rem]">
                <span>{s.n}</span>
                <span className="font-mono text-data text-subtle">{s.y}</span>
              </span>
              <span className={cn("hatch rounded-b-[var(--radius)]", s.y === "section-y-tight" ? "h-4" : "h-7")} />
            </div>
          ))}
        </div>
      </DsSub>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ radii */

export function Radii({ tokens }: { tokens: CssTokens }) {
  const items = [
    { k: "--radius-control", tw: "rounded-[var(--radius-control)] · rounded-sm / md", u: "Buttons, inputs, tab triggers, nav links" },
    { k: "--radius", tw: "rounded-[var(--radius)] · rounded-lg / xl", u: "Panels, accordion items, small cards, widgets" },
    { k: "--radius-tile", tw: "rounded-[var(--radius-tile)] · rounded-2xl", u: "Cards, tables, shader tiles, app window" },
    { k: "full", tw: "rounded-full", u: "SourceChip, badges, avatars, icon buttons in chips" },
  ];
  return (
    <DsSection id="radii" index="06" title="Radii" lede="Three radii plus full. Larger containers get larger radii; nested elements step down one size.">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((r) => (
          <div key={r.k} className="flex flex-col gap-5 rounded-[var(--radius-tile)] bg-card p-6">
            <span
              className="hatch h-20 w-full bg-raised sm:aspect-square sm:h-auto"
              style={{ borderRadius: r.k === "full" ? "9999px" : `var(${r.k})` }}
            />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-data text-foreground">
                {r.k} {r.k !== "full" && <span className="text-subtle">· {tokens.root[r.k]}</span>}
              </span>
              <span className="font-mono text-data text-subtle">{r.tw}</span>
              <span className="mt-2 text-[0.8125rem] text-muted-foreground">{r.u}</span>
            </div>
          </div>
        ))}
      </div>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ surfaces */

function Stack() {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-tile)] bg-background p-5">
      <span className="font-mono text-data text-muted-foreground">bg-background</span>
      <div className="flex flex-col gap-3 rounded-[var(--radius-tile)] bg-card p-5">
        <span className="font-mono text-data text-muted-foreground">bg-card</span>
        <div className="flex flex-col gap-3 rounded-[var(--radius)] bg-raised p-5">
          <span className="font-mono text-data text-muted-foreground">bg-raised</span>
          <div className="flex flex-wrap items-center gap-2">
            <SourceChip className="bg-background" doc="Trust agreement" locator="Art. IV" asOf="Jan 8" />
            <span className="hatch rounded-full bg-background px-2.5 py-1 text-data text-muted-foreground">Life policy: unconfirmed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Surfaces({ tokens }: { tokens: CssTokens }) {
  return (
    <DsSection
      id="surfaces"
      index="07"
      title="Surfaces"
      lede="No borders, anywhere. --border is transparent on purpose so stray shadcn borders vanish. Depth comes from three tones and from space."
    >
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="rounded-[var(--radius-tile)] bg-card p-2">
          <ThemeScope theme="dark" lightVars={tokens.lightScope} className="rounded-[var(--radius)]">
            <Stack />
          </ThemeScope>
        </div>
        <div className="rounded-[var(--radius-tile)] bg-card p-2">
          <ThemeScope theme="light" lightVars={tokens.lightScope} className="rounded-[var(--radius)]">
            <Stack />
          </ThemeScope>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Rule kind="do" title="Step one tone up per nesting level: background, card, raised. Inside raised, chips go back to bg-background.">
          <div className="w-full rounded-[var(--radius)] bg-card p-3">
            <div className="rounded-[var(--radius-control)] bg-raised px-3 py-2 text-[0.8125rem]">Harbor Works LLC</div>
          </div>
        </Rule>
        <Rule kind="dont" title="Draw lines: no border, divide-*, ring as decoration, hr, or outline cards. Focus rings are the only exception.">
          <div className="w-full rounded-[var(--radius)] p-3 shadow-[inset_0_0_0_1px_var(--ring)]">
            <div className="rounded-[var(--radius-control)] px-3 py-2 text-[0.8125rem] shadow-[inset_0_0_0_1px_var(--ring)]">Harbor Works LLC</div>
          </div>
        </Rule>
        <Rule kind="do" title="Mark unconfirmed or suggested facts with the .hatch fill. Never a dashed outline, never a color.">
          <span className="hatch flex items-center gap-2 rounded-full bg-raised px-3 py-1.5 text-data text-muted-foreground">
            <FileText className="size-3" /> Harbor Works LLC · confirm?
          </span>
        </Rule>
      </div>
    </DsSection>
  );
}
