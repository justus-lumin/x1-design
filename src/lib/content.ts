// Content model for the SEO pages. Source: src/content/pages.json (scraped from x1wealth.com by scripts/scrape.mjs).
// Pages are normalized into a hero + "chunks" (one per h2), and each chunk is assigned a slice kind.
import raw from "@/content/pages.json";

export type Block =
  | { t: "h1" | "h2" | "h3" | "h4" | "p" | "quote"; text: string }
  | { t: "list"; ordered: boolean; items: string[][] }
  | { t: "table"; caption: string; head: string[]; rows: string[][] }
  | { t: "dl"; items: { term: string; def: string }[] };

export type RawPage = {
  path: string;
  category: string;
  title: string;
  description: string;
  h1: string;
  sections: { blocks: Block[]; ctas: { text: string; href: string }[] }[];
};

export type SliceKind = "prose" | "features" | "steps" | "checklist" | "table" | "faq" | "quote" | "stats" | "ranked" | "statement" | "sources";

export type Chunk = { id: string; eyebrow?: string; heading?: string; blocks: Block[]; kind: SliceKind };

export type Template = "landing" | "article" | "hub";

export type Page = {
  path: string;
  category: string;
  label: string;
  template: Template;
  title: string;
  description: string;
  eyebrow?: string;
  h1: string;
  lede?: string;
  meta?: string;
  ctas: { text: string; href: string }[];
  chunks: Chunk[];
};

const pages = raw as RawPage[];
const byPath = new Map(pages.map((p) => [p.path, p]));

export const CATEGORY_LABEL: Record<string, string> = {
  features: "Product",
  integrations: "Integrations",
  connect: "Assistants",
  tools: "Free tools",
  resources: "Resources",
  compare: "Compare",
  statistics: "Statistics",
  blog: "Blog",
  legal: "Legal",
  author: "Authors",
  extensions: "Extensions",
  hub: "",
  page: "",
};

const ARTICLE = new Set(["resources", "compare", "statistics", "blog", "legal", "author"]);
const HUBS = new Set(["/resources", "/compare", "/statistics", "/tools", "/integrations", "/features", "/connect", "/blog", "/resources/authors"]);

// Site-wide promos and footers that the scraper picked up inside <main>. The rebuild renders its own.
const DROP_HEADINGS = [/^your financial life goes beyond/i, /^wealth$/i, /^related( (resources|reading|guides|tools|pages|statistics|links|comparisons)\b.*)?$/i, /^further reading/i, /^keep reading/i, /^more (resources|guides)/i];

export const allPaths = () => pages.map((p) => p.path);
export const hasPage = (path: string) => byPath.has(path);

/** Internal links stay local when we have the page; everything else points at the live site. */
export function resolveHref(href: string) {
  if (!href) return "#";
  if (href.startsWith("#") || href.startsWith("mailto:")) return href;
  if (/^https?:\/\//.test(href)) {
    const u = new URL(href);
    return u.hostname === "x1wealth.com" && hasPage(u.pathname.replace(/\/$/, "")) ? u.pathname : href;
  }
  const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (path === "/" || path === "/design-system" || hasPage(path)) return href;
  return `https://x1wealth.com${href}`;
}

const isKicker = (b: Block | undefined): b is { t: "p"; text: string } =>
  !!b && b.t === "p" && b.text.length <= 48 && !/[.?!:]$/.test(b.text) && !/^by /i.test(b.text);

// ---- Stat figures (shared by classify() and the stats/table slices) ----
const WORD_NUM = "one|two|three|four|five|six|seven|eight|nine|ten";
/** A whole line that is just a figure: "$124 Trillion", "41%", "1 in 10", "one in three", "10+ hours/week". */
const FIGURE_LINE = new RegExp(
  `^(?:[~≈+\\-]|up to |over |about |nearly )?(?:[$€£]?\\d[\\d,.]*[^\\s]*(?:\\s?[-–]\\s?[$€£]?\\d[\\d,.]*\\S*)?(?:\\s(?:trillion|billion|million|thousand|hours?\\S*|minutes?|days?|years?|points?|bps|x))?\\+?|#\\d+|\\d+ in \\d+|(?:${WORD_NUM}) in (?:${WORD_NUM}))$`,
  "i"
);
/** A figure leading a sentence: "41% of family offices…", "$54 Trillion will transfer…". */
const LEADING_FIGURE = /^([~+]?[$€£]?\d[\d,.]*\+?(?:%|[kmbt]\b|x\b)?(?:\s(?:trillion|billion|million))?\+?)\s+(\S.*)$/i;
const isYear = (s: string) => /^(19|20)\d\d$/.test(s);
const isFigureLine = (s: string) => s.length <= 28 && FIGURE_LINE.test(s.trim()) && !isYear(s.trim());

export type StatFigure = { label?: string; before: string; figure: string; after: string };

/** Pull the display figure out of a list item's lines. Returns null when the item isn't a statistic. */
export function statFigure(lines: string[]): StatFigure | null {
  let label: string | undefined;
  let rest = lines.map((l) => l.trim()).filter(Boolean);
  if (rest.length > 1 && /:$/.test(rest[0]) && rest[0].length <= 48) {
    label = rest[0].replace(/:$/, "");
    rest = rest.slice(1);
  }
  if (!rest.length) return null;
  const i = rest.findIndex(isFigureLine);
  if (i !== -1) return { label, before: rest.slice(0, i).join(" "), figure: rest[i], after: rest.slice(i + 1).join(" ") };
  if (rest.length === 1) {
    const kv = rest[0].match(/^(.{2,48}):\s*(.+)$/);
    if (kv && isFigureLine(kv[2])) return { label: kv[1], before: "", figure: kv[2], after: "" };
    const lead = rest[0].match(LEADING_FIGURE);
    if (lead && !isYear(lead[1])) return { label, before: "", figure: lead[1], after: lead[2] };
  }
  return null;
}

/** True when most items of the list are statistics. */
export const isStatList = (items: string[][], min = 2) => {
  const n = items.filter((it) => statFigure(it)).length;
  return n >= min && n >= Math.ceil(items.length * 0.6);
};

// Reference sections render as compact footnotes ("sources"); related-link lists stay plain lists.
const META_HEADING = /^(sources?|references|citations?|bibliography|methodology|data (files|sources)|compliance note|disclaimer|disclosures?|cite this|update cadence|research notes?)\b/i;
const RELATED_HEADING = /^related\b/i;
const FAQ_HEADING = /frequently asked|^faqs?\b|questions (people|about|we)|common questions/i;

function classify(blocks: Block[], heading = ""): SliceKind {
  const h3 = blocks.filter((b): b is { t: "h3"; text: string } => b.t === "h3");
  const lists = blocks.filter((b) => b.t === "list") as Extract<Block, { t: "list" }>[];
  const paras = blocks.filter((b): b is { t: "p"; text: string } => b.t === "p");
  const quotes = blocks.filter((b): b is { t: "quote"; text: string } => b.t === "quote");
  const listItems = lists.flatMap((l) => l.items);

  if (META_HEADING.test(heading)) return "sources";
  if (RELATED_HEADING.test(heading)) return lists.some((l) => l.items.length >= 2) ? "checklist" : "prose";
  // A dl is a FAQ only when it carries the chunk; a dl buried in a long essay stays prose.
  if (blocks.some((b) => b.t === "dl")) return blocks.filter((b) => b.t !== "dl" && b.t !== "p").length === 0 && paras.length <= 3 ? "faq" : "prose";
  // Question/answer pairs written as h3 + p.
  const qa = h3.length >= 2 && blocks.every((b) => b.t === "h3" || b.t === "p") && h3.filter((b) => /\?$/.test(b.text)).length >= h3.length * 0.75;
  if (qa && (FAQ_HEADING.test(heading) || h3.length >= 3)) return "faq";
  if (blocks.some((b) => b.t === "table")) return "table";
  const numbered = h3.filter((b) => /^\d+[.)]\s/.test(b.text)).length;
  if (numbered >= 2 && numbered >= h3.length * 0.5) return "ranked";
  // Short pull quotes and testimonials. Long prompt templates ("[name]" placeholders) stay prose.
  if (quotes.length && quotes.length <= 2 && blocks.length <= 6 && quotes.every((q) => q.text.length <= 320 && !/\[[^\]]+\]/.test(q.text))) return "quote";
  if (listItems.length >= 3 && isStatList(listItems, 2)) return "stats";
  if (quotes.length) return "prose";
  if (h3.length >= 2) return "features";
  if (lists.some((l) => l.ordered && l.items.length >= 3)) return "steps";
  if (lists.some((l) => l.items.length >= 3)) return "checklist";
  if (paras.length <= 1 && (paras[0]?.text.length ?? 0) < 220) return "statement";
  return "prose";
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export function getPage(path: string): Page | null {
  const p = byPath.get(path);
  if (!p) return null;

  const blocks = p.sections.flatMap((s) => s.blocks);
  const ctas = p.sections
    .flatMap((s) => s.ctas)
    .filter((c) => !c.href.startsWith("#") && c.text.length > 2)
    .filter((c, i, a) => a.findIndex((d) => d.text === c.text) === i)
    .slice(0, 2);

  // Hero: everything up to the first h2.
  const firstH2 = blocks.findIndex((b) => b.t === "h2");
  const head = firstH2 === -1 ? blocks : blocks.slice(0, firstH2);
  const body = firstH2 === -1 ? [] : blocks.slice(firstH2);
  const h1Idx = head.findIndex((b) => b.t === "h1");
  const eyebrow = isKicker(head[h1Idx - 1]) ? (head[h1Idx - 1] as { text: string }).text : undefined;
  const after = head.slice(h1Idx + 1).filter((b) => b.t === "p") as { t: "p"; text: string }[];
  const meta = after.find((b) => /^by |updated|reviewed|published/i.test(b.text))?.text;
  const lede = after.find((b) => b !== undefined && b.text !== meta && b.text.length > 40)?.text;
  const headRest = head.slice(h1Idx + 1).filter((b) => !(b.t === "p" && (b.text === lede || b.text === meta)));

  // Chunks: split body at each h2; a short paragraph right before an h2 becomes its eyebrow.
  const chunks: Chunk[] = [];
  let cur: Chunk | null = null;
  const pushCur = () => {
    if (cur && cur.blocks.length) chunks.push(cur);
  };
  if (headRest.some((b) => b.t !== "p" || b.text.length > 60)) {
    cur = { id: "overview", blocks: headRest.filter((b, i) => !(isKicker(b) && i === headRest.length - 1)), kind: "prose" };
  }
  for (let i = 0; i < body.length; i++) {
    const b = body[i];
    if (b.t === "h2") {
      pushCur();
      cur = { id: slug(b.text), heading: b.text, blocks: [], kind: "prose" };
      continue;
    }
    if (isKicker(b) && body[i + 1]?.t === "h2") {
      pushCur();
      cur = { id: slug((body[i + 1] as { text: string }).text), eyebrow: b.text, heading: (body[i + 1] as { text: string }).text, blocks: [], kind: "prose" };
      i++;
      continue;
    }
    cur?.blocks.push(b);
  }
  pushCur();

  const kept = chunks
    .filter((c) => !c.heading || !DROP_HEADINGS.some((r) => r.test(c.heading!)))
    .filter((c) => c.blocks.length || c.heading)
    .map((c) => ({ ...c, kind: classify(c.blocks, c.heading) }));

  // Deduplicate ids for anchors.
  const seen = new Map<string, number>();
  kept.forEach((c) => {
    const n = seen.get(c.id) ?? 0;
    seen.set(c.id, n + 1);
    if (n) c.id = `${c.id}-${n}`;
  });

  const template: Template = HUBS.has(p.path) ? "hub" : ARTICLE.has(p.category) ? "article" : "landing";

  return {
    path: p.path,
    category: p.category,
    label: CATEGORY_LABEL[p.category] ?? "",
    template,
    title: p.title,
    description: p.description,
    eyebrow,
    h1: p.h1,
    lede,
    meta,
    ctas,
    chunks: kept,
  };
}

/** Children of a hub, e.g. "/resources" → every "/resources/*" page except author pages. */
export function childrenOf(hub: string) {
  const prefix = hub === "/blog" ? "/blog/" : `${hub}/`;
  return pages
    .filter((p) => p.path.startsWith(prefix) && p.path !== hub)
    .filter((p) => hub === "/resources/authors" || !p.path.startsWith("/resources/authors"))
    .map((p) => ({ path: p.path, title: p.h1 || p.title, description: p.description, category: p.category }));
}

/** A few pages from the same section for the "Keep reading" slice. */
export function relatedTo(path: string, n = 3) {
  const p = byPath.get(path);
  if (!p) return [];
  const section = "/" + path.split("/").filter(Boolean)[0];
  const pool = pages.filter((q) => q.path !== path && q.path.startsWith(section + "/") && !HUBS.has(q.path));
  const start = Math.abs([...path].reduce((a, c) => a + c.charCodeAt(0), 0)) % Math.max(pool.length, 1);
  return [...pool.slice(start), ...pool.slice(0, start)].slice(0, n).map((q) => ({ path: q.path, title: q.h1 || q.title, description: q.description }));
}
