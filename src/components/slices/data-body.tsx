// Renders a data chunk's blocks in order, upgrading the data parts:
// tables (with their h3 title, caption and "Source:" line), statistic lists, and prose kept short
// (the first paragraph shows, the rest sits behind a quiet disclosure).
import { Prose } from "@/components/slices/blocks";
import { isStatList, type Block, type Chunk, type Page } from "@/lib/content";
import { cn } from "@/lib/utils";
import { Disclosure } from "./data-frame";
import { pickStatVariant, StatGrid } from "./data-stats";
import { DataTable } from "./data-table";
import { pickTableVariant } from "./data-table-utils";

type TableBlock = Extract<Block, { t: "table" }>;
type Segment =
  | { k: "prose"; blocks: Block[] }
  | { k: "table"; block: TableBlock; title?: string; caption?: string; source?: string }
  | { k: "stats"; items: string[][] };

const text = (b: Block | undefined) => (b && "text" in b ? b.text : "");
const isSource = (b: Block | undefined) => b?.t === "p" && /^sources?:/i.test(b.text);
const isShortP = (b: Block | undefined) => b?.t === "p" && b.text.length <= 220;

export function segment(blocks: Block[]): Segment[] {
  const out: Segment[] = [];
  const prose = (b: Block) => {
    const last = out[out.length - 1];
    if (last?.k === "prose") last.blocks.push(b);
    else out.push({ k: "prose", blocks: [b] });
  };
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    // "Data Snapshot" introduces a chart the scrape could not capture; drop its orphaned title and caption.
    if (b.t === "p" && /^data snapshot$/i.test(b.text.trim())) {
      if (blocks[i + 1]?.t === "h3" && isShortP(blocks[i + 2]) && blocks[i + 3]?.t !== "table") i += 2;
      continue;
    }
    // h3 (+ short caption) directly above a table becomes the table's title.
    if (b.t === "h3") {
      const capIdx = isShortP(blocks[i + 1]) ? i + 1 : -1;
      const tIdx = capIdx === -1 ? i + 1 : i + 2;
      if (blocks[tIdx]?.t === "table") {
        const t = blocks[tIdx] as TableBlock;
        const src = isSource(blocks[tIdx + 1]) ? text(blocks[tIdx + 1]) : undefined;
        out.push({ k: "table", block: t, title: b.text, caption: capIdx === -1 ? undefined : text(blocks[capIdx]), source: src });
        i = tIdx + (src ? 1 : 0);
        continue;
      }
    }
    if (b.t === "table") {
      const src = isSource(blocks[i + 1]) ? text(blocks[i + 1]) : undefined;
      out.push({ k: "table", block: b, source: src });
      if (src) i++;
      continue;
    }
    if (b.t === "list" && isStatList(b.items)) {
      out.push({ k: "stats", items: b.items });
      continue;
    }
    prose(b);
  }
  return out;
}

const DATA_KINDS = new Set(["table", "stats"]);

/**
 * Where this chunk's first stats block and first table fall among all data blocks on the page.
 * Used to rotate variants (no two neighbours look alike) and to give only the page's first stats block a count-up.
 * Chunks are matched by their blocks array, so templates may rename ids or drop headings freely.
 */
export function dataOrdinals(page: Page, chunk: Chunk) {
  let stats = 0;
  let tables = 0;
  for (const c of page.chunks) {
    if (c.blocks === chunk.blocks) return { stats, tables };
    if (!DATA_KINDS.has(c.kind)) continue;
    for (const s of segment(c.blocks)) {
      if (s.k === "stats") stats++;
      if (s.k === "table") tables++;
    }
  }
  return { stats, tables };
}

const size = (bs: Block[]) => bs.reduce((n, b) => n + ("text" in b ? b.text.length : b.t === "list" ? b.items.flat().join(" ").length : 0), 0);

/** Prose kept short: the opening block (and an h3 lead-in) shows; longer explanation goes behind "More context". */
export function ShortProse({ blocks, layout, className }: { blocks: Block[]; layout: "full" | "article"; className?: string }) {
  let cut = blocks.findIndex((b) => b.t === "p" || b.t === "list") + 1;
  if (cut <= 0) cut = blocks.length;
  const head = blocks.slice(0, cut);
  const rest = blocks.slice(cut);
  const fold = rest.length > 1 || size(rest) > 240;
  return (
    <div className={cn(layout === "full" && "max-w-2xl", className)}>
      <Prose blocks={fold ? head : blocks} />
      {fold && (
        <Disclosure className="mt-5">
          <Prose blocks={rest} />
        </Disclosure>
      )}
    </div>
  );
}

export function DataBody({ chunk, page, layout = "full" }: { chunk: Chunk; page: Page; layout?: "full" | "article" }) {
  const segs = segment(chunk.blocks);
  const ord = dataOrdinals(page, chunk);
  let s = ord.stats;
  let t = ord.tables;
  return (
    <div className={cn("flex flex-col", layout === "full" ? "gap-12 md:gap-14" : "gap-10")}>
      {segs.map((seg, i) => {
        if (seg.k === "table") {
          const variant = pickTableVariant(seg.block, t++);
          return <DataTable key={i} block={seg.block} title={seg.title} caption={seg.caption} source={seg.source} layout={layout} variant={variant} />;
        }
        if (seg.k === "stats") {
          const n = s++;
          return <StatGrid key={i} items={seg.items} layout={layout} variant={pickStatVariant(seg.items, n, layout)} animate={n === 0} />;
        }
        return <ShortProse key={i} blocks={seg.blocks} layout={layout} />;
      })}
    </div>
  );
}
