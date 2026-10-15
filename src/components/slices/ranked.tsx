// Ranked slice: compare listicles ("1. Orion: best when…"). Static, three looks:
//   leaderboard  compact numbered rows that open to the details (long lists, long entries)
//   tabs         one entry at a time behind numbered tabs (short lists; phones get the leaderboard)
//   rows         alternating feature rows with a large index numeral
// Key facts are pulled from "Best for: …" lines; long bodies show their opening and fold the rest.
import { Prose } from "@/components/slices/blocks";
import type { SliceProps } from "@/components/slices/types";
import type { Block, Chunk, Page } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ShortProse } from "./data-body";
import { DataFrame } from "./data-frame";
import { DataTabs } from "./data-tabs";

type Item = { n: string; name: string; tagline?: string; meta: { k: string; v: string }[]; body: Block[] };

const NUMBERED = /^(\d+)[.)]\s+(.+)$/;
const META = /^(best for|best when|ideal (?:firm size|for|client)|who it'?s for|pricing|price|starting price|fee|fees|cost|minimum|rating)\s*:\s*(.+)$/i;

function parse(blocks: Block[]) {
  const intro: Block[] = [];
  const items: Item[] = [];
  for (const b of blocks) {
    const m = b.t === "h3" ? b.text.match(NUMBERED) : null;
    if (m) {
      const rest = m[2];
      const c = rest.indexOf(": ");
      const split = c > 0 && c <= 60;
      items.push({ n: m[1].padStart(2, "0"), name: split ? rest.slice(0, c) : rest, tagline: split ? rest.slice(c + 2) : undefined, meta: [], body: [] });
      continue;
    }
    const cur = items[items.length - 1];
    if (!cur) {
      intro.push(b);
      continue;
    }
    const mm = b.t === "p" && !cur.body.length && cur.meta.length < 3 ? b.text.match(META) : null;
    if (mm) {
      cur.meta.push({ k: mm[1].replace(/^\w/, (x) => x.toUpperCase()), v: mm[2] });
      continue;
    }
    // Short "Pricing:" / "Limitations:" lines are sub-labels, not paragraphs.
    if (b.t === "p" && b.text.length <= 48 && /:$/.test(b.text)) {
      cur.body.push({ t: "h4", text: b.text.replace(/:$/, "") });
      continue;
    }
    cur.body.push(b);
  }
  // Without a tagline, a "Best for" line stands in as the one-line summary.
  for (const it of items) {
    if (!it.tagline) {
      const i = it.meta.findIndex((m) => /^best/i.test(m.k));
      if (i !== -1) it.tagline = it.meta.splice(i, 1)[0].v;
    }
  }
  return { intro, items };
}

const size = (bs: Block[]) => bs.reduce((n, b) => n + ("text" in b ? b.text.length : b.t === "list" ? b.items.flat().join(" ").length : 0), 0);
const isX1 = (s: string) => /\bX1\b/.test(s);

type Variant = "leaderboard" | "tabs" | "rows";

function rankedOrdinal(page: Page, chunk: Chunk) {
  let n = 0;
  for (const c of page.chunks) {
    if (c.blocks === chunk.blocks) return n;
    if (c.kind === "ranked") n++;
  }
  return n;
}

function pick(items: Item[], ordinal: number): Variant {
  const avg = items.reduce((n, it) => n + size(it.body), 0) / Math.max(items.length, 1);
  if (items.length >= 6 || avg > 1400) return "leaderboard";
  if (items.length <= 5 && ordinal % 2 === 0) return "tabs";
  return "rows";
}

function Meta({ meta }: { meta: Item["meta"] }) {
  if (!meta.length) return null;
  return (
    <dl className="flex flex-col gap-2.5">
      {meta.map((m) => (
        <div key={m.k} className="flex flex-col gap-0.5 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4">
          <dt className="pt-0.5 text-data text-muted-foreground">{m.k}</dt>
          <dd className="text-[0.9375rem] leading-relaxed text-foreground text-pretty">{m.v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Leaderboard({ items, className }: { items: Item[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col gap-1.5", className)}>
      {items.map((it, i) => (
        <li key={i}>
          <details className={cn("group/row rounded-[var(--radius-tile)] transition-colors duration-300", isX1(it.name) ? "bg-raised" : "bg-card", "open:bg-card")}>
            <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_minmax(0,1fr)_1.25rem] items-baseline gap-x-3 rounded-[var(--radius-tile)] px-4 py-4 transition-colors duration-300 select-none hover:bg-raised/60 sm:grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-[1.375rem] font-medium leading-none tracking-[-0.04em] text-subtle tabular-nums sm:text-[1.75rem]">{it.n}</span>
              <span className="flex min-w-0 flex-col gap-1">
                <h3 className="font-medium text-foreground text-pretty">
                  <span className="sr-only">{Number(it.n)}. </span>
                  {it.name}
                </h3>
                {it.tagline && <span className="text-[0.875rem] leading-snug text-muted-foreground text-pretty">{it.tagline}</span>}
              </span>
              <span aria-hidden className="justify-self-end text-subtle transition-transform duration-300 group-open/row:rotate-45">
                +
              </span>
            </summary>
            {(it.meta.length > 0 || it.body.length > 0) && (
              <div className="flex flex-col gap-6 px-4 pt-1 pb-6 sm:pr-6 sm:pl-[calc(3.5rem+0.75rem+1.5rem)]">
                <Meta meta={it.meta} />
                {it.body.length > 0 && <Prose blocks={it.body} className="text-[0.9375rem]" />}
              </div>
            )}
          </details>
        </li>
      ))}
    </ol>
  );
}

function Panel({ it, layout }: { it: Item; layout: "full" | "article" }) {
  return (
    <div className={cn("grid-12 gap-y-6", layout === "article" && "flex flex-col")}>
      <div className={cn("col-span-4 flex flex-col gap-4", layout === "full" && "md:col-span-5")}>
        <h3 className={cn("font-display font-medium leading-tight tracking-[-0.03em] text-pretty", layout === "full" ? "text-[1.5rem] md:text-[1.875rem]" : "text-[1.375rem]")}>
          <span className="sr-only">{Number(it.n)}. </span>
          {it.name}
        </h3>
        {it.tagline && <p className="text-lede text-muted-foreground text-pretty">{it.tagline}</p>}
        <Meta meta={it.meta} />
      </div>
      {it.body.length > 0 && <ShortProse blocks={it.body} layout="article" className={cn("col-span-4", layout === "full" && "md:col-span-6 md:col-start-7")} />}
    </div>
  );
}

function Rows({ items, layout }: { items: Item[]; layout: "full" | "article" }) {
  const full = layout === "full";
  return (
    <ol className="flex flex-col gap-2">
      {items.map((it, i) => (
        <li
          key={i}
          className={cn(
            "rounded-[var(--radius-tile)]",
            full ? "grid-12 gap-y-6 p-6 sm:p-8 md:p-10" : "flex flex-col gap-5 p-6",
            isX1(it.name) ? "bg-raised" : i % 2 === 0 ? "bg-card" : "bg-transparent"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "col-span-4 font-display font-medium leading-[0.85] tracking-[-0.05em] tabular-nums",
              full ? "text-[3rem] md:col-span-2 md:text-[4.5rem]" : "text-[2.5rem]",
              isX1(it.name) ? "text-foreground" : "text-subtle"
            )}
          >
            {it.n}
          </span>
          <div className={cn("col-span-4 min-w-0", full && "md:col-span-10")}>
            <Panel it={it} layout={full ? "full" : "article"} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RankedSlice({ chunk, page, layout = "full" }: SliceProps) {
  const { intro, items } = parse(chunk.blocks);
  const full = layout === "full";
  const variant = pick(items, rankedOrdinal(page, chunk));

  return (
    <DataFrame chunk={chunk} layout={layout}>
      {intro.length > 0 && <ShortProse blocks={intro} layout={layout} className={full ? "mb-10 md:mb-12" : "mb-8"} />}
      {variant === "leaderboard" && <Leaderboard items={items} />}
      {variant === "rows" && <Rows items={items} layout={layout} />}
      {variant === "tabs" && (
        <>
          <Leaderboard items={items} className="sm:hidden" />
          <DataTabs
            className="hidden sm:block"
            tabs={items.map((it) => ({ n: it.n, label: it.name, panel: <Panel it={it} layout={layout} /> }))}
          />
        </>
      )}
    </DataFrame>
  );
}
