// Pure helpers for the article template: meta parsing, reading time, and chunk shaping.
// Everything here reshapes scraped copy; nothing adds words that were not on the page.
import { CATEGORY_LABEL, hasPage, statFigure, type Block, type Chunk, type Page } from "@/lib/content";

/** Hidden before hydration so GSAP entrances never flash. ArticleMotion reveals it. */
// Hidden before hydration by the [data-ar-hero]:not([data-ar-done]) rule in globals.css (with a failsafe).
export const hideUntilReady = "";

export type TocItem = { id: string; label: string; num?: string; group: "main" | "notes" };

/** Back matter: collapsed into compact notes at the end so long pages stay scannable. */
const NOTES = /^(sources?|references|citations?|methodology|data files|compliance note|disclaimers?|disclosures?|update cadence)\b/i;
/** A "sources" chunk kind (data agent) renders through its own slice; matched here so it lands in the notes area once. */
export const isSourcesKind = (c: Chunk) => (c.kind as string) === "sources";
export const isNotes = (c: Chunk) => isSourcesKind(c) || (!!c.heading && NOTES.test(c.heading.trim()));
export const isTakeaways = (c: Chunk) => !!c.heading && /^key takeaways?$/i.test(c.heading.trim());

/** "1. Orion: best when..." → num "1", title "Orion: best when...", short "Orion". */
export function splitNumbered(heading: string) {
  const m = heading.match(/^(\d{1,2})[.)]\s+(.+)$/);
  if (!m) return { title: heading, short: heading };
  const title = m[2];
  const short = title.split(/:\s/)[0];
  return { num: m[1], title, short: short.length < title.length && short.length <= 48 ? short : title };
}

// ---------- meta ----------

const fmtDate = (raw: string) => {
  const s = raw.trim().replace(/\.$/, "");
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const local = iso ? null : new Date(s);
  if (local && Number.isNaN(local.getTime())) return { text: s };
  // Calendar date only: pin to UTC noon so no timezone moves it a day.
  const d = iso ? new Date(Date.UTC(+iso[1], +iso[2] - 1, +iso[3], 12)) : new Date(Date.UTC(local!.getFullYear(), local!.getMonth(), local!.getDate(), 12));
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    iso: d.toISOString().slice(0, 10),
  };
};

export type ArticleMeta = { author?: { name: string; href?: string }; updated?: { text: string; iso?: string }; extraLede?: string };

export function parseMeta(meta: string | undefined): ArticleMeta {
  if (!meta) return {};
  const by = meta.match(/^by\s+([^·|]+?)(?:\s*[·|]|$)/i);
  const up = meta.match(/(?:updated|reviewed|published):?\s+([^·|]+)$/i);
  if (!by && !up) return meta.length > 60 ? { extraLede: meta } : {};
  const out: ArticleMeta = {};
  if (by) {
    const name = by[1].trim();
    const href = `/resources/authors/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    out.author = { name, href: hasPage(href) ? href : undefined };
  }
  if (up) out.updated = fmtDate(up[1]);
  return out;
}

// ---------- reading time ----------

const blockText = (b: Block): string => {
  switch (b.t) {
    case "list":
      return b.items.flat().join(" ");
    case "table":
      return [b.caption, ...b.head, ...b.rows.flat()].join(" ");
    case "dl":
      return b.items.map((d) => `${d.term} ${d.def}`).join(" ");
    default:
      return b.text;
  }
};

export function readingMinutes(page: Page, chunks: Chunk[]) {
  const text = [page.lede ?? "", ...chunks.flatMap((c) => [c.heading ?? "", ...c.blocks.map(blockText)])].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

// ---------- chunk shaping ----------

/** FAQ sections arrive as h3/p pairs or alternating question/answer paragraphs. Shape them into a dl for the FAQ slice. */
function asFaq(c: Chunk): Chunk {
  if (!c.heading || !/frequently asked|^faqs?$/i.test(c.heading)) return c;
  if (c.blocks.some((b) => b.t === "dl")) return c;
  const items: { term: string; def: string }[] = [];
  const lead: Block[] = [];
  let cur: { term: string; def: string[] } | null = null;
  const flush = () => {
    if (cur && cur.def.length) items.push({ term: cur.term, def: cur.def.join(" ") });
    cur = null;
  };
  for (const b of c.blocks) {
    const isQ = (b.t === "h3" || b.t === "h4" || b.t === "p") && /\?$/.test(b.text.trim()) && b.text.length < 200;
    if (isQ) {
      flush();
      cur = { term: (b as { text: string }).text, def: [] };
    } else if (cur && (b.t === "p" || b.t === "list")) {
      cur.def.push(b.t === "list" ? b.items.map((i) => i.join(" ")).join(" ") : b.text);
    } else if (!cur && !items.length) {
      lead.push(b);
    } else {
      return c; // shape we don't understand: leave it alone
    }
  }
  flush();
  if (items.length < 2) return c;
  return { ...c, blocks: [...lead, { t: "dl", items }], kind: "faq" };
}

/** Eyebrows that are really trailing link text from the previous section ("Learn more about X →"). */
const cleanEyebrow = (c: Chunk): Chunk => (c.eyebrow && /→|learn more|see how/i.test(c.eyebrow) ? { ...c, eyebrow: undefined } : c);

// ---------- hero variants ----------

export type HeroKind = "resources" | "compare" | "statistics" | "legal" | "person";

export const heroKind = (page: Page): HeroKind =>
  page.category === "compare" ? "compare" : page.category === "statistics" ? "statistics" : page.category === "legal" ? "legal" : page.category === "blog" || page.category === "author" ? "person" : "resources";

/** "Addepar vs Orion (2026): Which…" or "7 Best Addepar Alternatives in 2026: …" → a typographic lockup. Null when the title is neither. */
export type CompareLockup = { kind: "vs"; a: string; b: string; rest?: string } | { kind: "alt"; product: string; count?: string; rest?: string };

export function compareLockup(h1: string): CompareLockup | null {
  // "(2026): Which platform…" → "2026 · Which platform…"
  const tidy = (s?: string) =>
    s
      ?.replace(/\((\d{4})\)/g, "$1")
      .replace(/^[\s:,–-]+|\s+$/g, "")
      .replace(/^in\s+(?=\d{4})/i, "")
      .replace(/:\s+/, " · ")
      .trim() || undefined;
  const vs = h1.match(/^(.+?)\s+vs\.?\s+(.+?)(\s*(?:\(|\bin\s+|:|\bfor\s+).*)?$/i);
  if (vs && vs[1].length <= 32 && vs[2].length <= 24) return { kind: "vs", a: vs[1].trim(), b: vs[2].trim(), rest: tidy(vs[3]) };
  const alt = h1.match(/^(?:(\d+)\s+)?(?:best\s+)?(.+?)\s+alternatives\b(.*)$/i);
  if (alt && alt[2].length <= 24) return { kind: "alt", count: alt[1], product: alt[2].trim(), rest: tidy(alt[3]) };
  return null;
}

/** First sentence of a string, when there is a clean one. Avoids splitting on "U.S." style abbreviations. */
export function firstSentence(text: string, min = 40, max = 220) {
  const m = text.match(/^([\s\S]+?(?<!\b[A-Z]|\b(?:e\.g|i\.e|vs|etc|Inc|U\.S))[.!?])(?:\s+(?=[A-Z"“(])|$)/);
  if (!m) return null;
  const s = m[1].trim();
  return s.length >= min && s.length <= max ? { sentence: s, rest: text.slice(m[0].length).trim() } : null;
}

/** Statistics hero: the first figure on the page that names its source, e.g. "41% … (Deloitte 2024)". */
export type LeadFigure = { figure: string; text: string; source?: string; locator?: string };

export function leadFigure(chunks: Chunk[]): LeadFigure | null {
  // A named source with a year: "(Deloitte 2024)", "(Deloitte, 2025)". Not "(+9.4% in 2025)".
  const SRC = /\(([A-Z][A-Za-z.&'’ /-]{1,30},?\s(?:19|20)\d\d)\)\.?$/;
  let fallback: LeadFigure | null = null;
  for (const c of chunks) {
    if (isNotes(c)) continue;
    for (const b of c.blocks) {
      if (b.t !== "list") continue;
      for (const it of b.items) {
        const f = statFigure(it);
        if (!f) continue;
        // Caption keeps the figure in place when it sits mid-sentence ("Only 1 in 10 consumers…").
        const text = f.before ? `${f.before} ${f.figure} ${f.after}` : [f.label && `${f.label}:`, f.after].filter(Boolean).join(" ");
        const src = text.match(SRC);
        if (src) return { figure: f.figure, text: text.replace(SRC, "").trim().replace(/[,;:]$/, ""), source: src[1].trim(), locator: c.heading };
        // No named source: still usable, the chip then points at the page's own sources.
        if (!fallback && text.length >= 24) fallback = { figure: f.figure, text: text.replace(/[,;:]$/, ""), locator: c.heading };
      }
    }
  }
  return fallback;
}

// ---------- rhythm ----------

const wordsIn = (blocks: Block[]) => blocks.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;

/** Long prose chunks show their first two paragraphs; the rest sits behind "Continue reading". */
export function splitLong(blocks: Block[], limit = 350): { head: Block[]; tail: Block[] } {
  if (wordsIn(blocks) <= limit) return { head: blocks, tail: [] };
  let paras = 0;
  const cut = blocks.findIndex((b) => b.t === "p" && ++paras === 2);
  if (cut === -1 || cut >= blocks.length - 1) return { head: blocks, tail: [] };
  return { head: blocks.slice(0, cut + 1), tail: blocks.slice(cut + 1) };
}

export type PullQuote = { chunkId: string; sentence: string };

/** One strong sentence per long article: the first clean opening sentence from the 3rd body section on. */
function pickPullQuote(body: Chunk[], minutes: number): PullQuote | null {
  if (minutes < 5) return null;
  for (const c of body.slice(2)) {
    if (c.kind !== "prose" && c.kind !== "statement") continue;
    if (/x1|compliance|disclaimer|about|methodology/i.test(c.heading ?? "")) continue;
    const p = c.blocks[0];
    if (p?.t !== "p") continue;
    const s = firstSentence(p.text, 60, 200);
    // A quotable line: no label prefix, no parentheticals, no self-reference.
    if (s && !/[:()]/.test(s.sentence) && !/^(this|these|the following|run|review|see|pick|match|explore|try|start|use|read|ask)\b|\b(guide|advice|reviewed in|our|X1|see how)\b/i.test(s.sentence)) return { chunkId: c.id, sentence: s.sentence };
  }
  return null;
}

/** Drop the quoted sentence from its paragraph so nothing is read twice. */
export function withoutPullQuote(blocks: Block[], q: PullQuote): Block[] {
  const [p, ...rest] = blocks;
  if (p?.t !== "p" || !p.text.startsWith(q.sentence)) return blocks;
  const remainder = p.text.slice(q.sentence.length).trim();
  return remainder ? [{ t: "p", text: remainder }, ...rest] : rest;
}

export type ShapedArticle = {
  kind: HeroKind;
  intro?: Chunk; // the un-headed overview
  takeaways?: Chunk;
  body: Chunk[];
  notes: Chunk[];
  toc: TocItem[];
  minutes: number;
  meta: ArticleMeta;
  hub?: { label: string; href: string };
  pull: PullQuote | null;
};

/** Lists of other statistics pages duplicate RelatedSlice. */
const isRelatedList = (c: Chunk) => !!c.heading && /^related (statistics|stats|articles|comparisons)$/i.test(c.heading.trim());

export function shapeArticle(page: Page): ShapedArticle {
  let chunks = page.chunks.map(cleanEyebrow).map(asFaq).filter((c) => !isRelatedList(c));

  // The site's closing promo (e.g. "Build a picture of your own household.") follows the back matter. CtaBand replaces it.
  const last = chunks.at(-1);
  if (last?.heading && /[.?]$/.test(last.heading) && !/^\d/.test(last.heading) && chunks.slice(0, -1).some(isNotes)) {
    chunks = chunks.slice(0, -1);
  }

  const kind = heroKind(page);
  const intro = chunks.find((c) => !c.heading);
  const takeaways = chunks.find(isTakeaways);
  const notes = chunks.filter(isNotes);
  const body = chunks.filter((c) => c !== intro && c !== takeaways && !isNotes(c));
  const minutes = readingMinutes(page, chunks);

  const toc: TocItem[] = [
    ...(takeaways ? [{ id: takeaways.id, label: takeaways.heading!, group: "main" as const }] : []),
    ...body.map((c) => {
      const { num, short } = splitNumbered(c.heading!);
      return { id: c.id, label: short, num, group: "main" as const };
    }),
    ...notes.map((c) => ({ id: c.id, label: c.heading!, group: "notes" as const })),
  ];

  const meta = parseMeta(page.meta);
  const label = CATEGORY_LABEL[page.category] || page.label;
  const hubPath = page.category === "author" ? "/resources/authors" : `/${page.category}`;

  return {
    kind,
    intro,
    takeaways,
    body,
    notes,
    toc,
    minutes,
    meta,
    hub: label ? { label, href: hasPage(hubPath) ? hubPath : "" } : undefined,
    pull: kind === "legal" ? null : pickPullQuote(body, minutes),
  };
}
