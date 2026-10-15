// Plans a landing page from its chunks. Rules (from the brief):
//   - one hero variant per page, neighbour-aware (pickHeroVariant)
//   - never the same slice variant twice on a page, never two slices of the same kind back to back
//   - at most MAX_SLICES full slices; the rest fold into "More on this"
//   - sources, methodology, caveats and illustration notes move to one footnote list at the end
//   - a closing statement becomes the page's CTA band copy instead of another big line
//   - motion budget: the hero's entrance plus at most 3 signature moments, spaced apart; everything else is static
//   - at most 2 shaders per page: the CTA band always has one, so the hero or one statement band may use the other
import type { Chunk, Page, SliceKind } from "@/lib/content";
import { resolveHref } from "@/lib/content";
import { checklistFits, checklistParts } from "./checklist";
import { faqFits } from "./faq";
import { featureFits, featureParts } from "./features";
import { LOW_VALUE, strongestSentence, textOf, tidy } from "./landing-kit";
import type { Note } from "./landing-more";
import { isPillar, type PillarsVariant } from "./landing-pillars";
import { pickHeroVariant, type HeroVariant } from "./page-hero";
import { stepFits, stepParts } from "./steps";

export type Unit =
  | { t: "slice"; chunk: Chunk; index: number; kind: SliceKind; variant?: string; motion: boolean; key: string }
  | { t: "pillars"; chunks: Chunk[]; variant: PillarsVariant; motion: boolean; key: string };

export type Plan = {
  hero: HeroVariant;
  units: Unit[];
  more: Chunk[];
  notes: Note[];
  /** Chunks of kind "sources": rendered by the data agent's sources slice at the end of the page. */
  sources: Chunk[];
  closing?: { title: string; body?: string; primary?: { label: string; href: string } };
};

const MAX_SLICES = 6;
const MAX_SIGNATURES = 3;
const SIGNATURE = new Set(["statement:scrub", "prose:quote", "features:bento", "pillars:grid"]);
// Variants that read as a field of cards. Two of these back to back feel repetitive, so the second
// prefers a lighter variant when its kind has one.
const TILES = new Set(["pillars:grid", "features:bento", "features:plans", "features:contrast", "steps:carousel", "steps:timeline", "faq:glossary", "checklist:prompts"]);
const FIGURES = new Set(["plans", "ledger"]);
const DATA_KINDS = new Set<SliceKind>(["table", "stats", "quote", "ranked"]);

const paras = (c: Chunk) => tidy(c.blocks).flatMap((b) => (b.t === "p" ? [b.text] : []));

function lowValueNotes(c: Chunk): Note[] {
  const out: Note[] = [];
  for (const b of tidy(c.blocks)) {
    if (b.t === "p") out.push({ text: b.text });
    if (b.t === "list") out.push(...b.items.map((it) => ({ text: it.join(" ") })));
  }
  if (out[0]) out[0] = { ...out[0], label: c.heading };
  return out;
}

export function planLanding(page: Page): Plan {
  const hero = pickHeroVariant(page);
  let spareShader = hero === "stage" || hero === "shader" ? 0 : 1;
  const notes: Note[] = [];
  let chunks = [...page.chunks];

  // A short closing statement becomes the CTA band's copy.
  let closing: Plan["closing"];
  const last = chunks[chunks.length - 1];
  if (last && chunks.length > 1 && last.kind === "statement" && last.heading && last.blocks.every((b) => b.t === "p") && textOf(last.blocks).length < 260) {
    const cta = page.ctas[0];
    closing = { title: last.heading, body: paras(last)[0], primary: cta ? { label: cta.text, href: resolveHref(cta.href) } : undefined };
    chunks = chunks.slice(0, -1);
  }

  // "sources" chunks have their own slice; they render once, at the end.
  const sources = chunks.filter((c) => (c.kind as string) === "sources");
  chunks = chunks.filter((c) => (c.kind as string) !== "sources");

  // Other reference material goes to the footnotes.
  chunks = chunks.filter((c) => {
    if (c.heading && LOW_VALUE.test(c.heading.trim())) {
      notes.push(...lowValueNotes(c));
      return false;
    }
    return true;
  });

  // Group runs of short statements.
  type Item = { chunks: Chunk[]; index: number };
  const items: Item[] = [];
  for (let i = 0; i < chunks.length; i++) {
    let j = i;
    while (j < chunks.length && isPillar(chunks[j])) j++;
    if (j - i >= 2) {
      items.push({ chunks: chunks.slice(i, j), index: page.chunks.indexOf(chunks[i]) });
      i = j - 1;
    } else items.push({ chunks: [chunks[i]], index: page.chunks.indexOf(chunks[i]) });
  }

  const used = new Set<string>();
  const units: Unit[] = [];
  const more: Chunk[] = [];
  let prevFamily = "";
  let signatures = 0;
  let sinceSignature = 99;
  let prevTile = false;
  let prevVariant = "";
  const seenHeadings = new Set<string>();

  const fold = (cs: Chunk[]) => cs.forEach((c) => c.heading && more.push(c));

  for (const item of items) {
    const isRun = item.chunks.length > 1;
    const chunk = item.chunks[0];
    const kind = chunk.kind;
    let family: string = isRun ? "pillars" : kind;
    let candidates: string[];

    if (isRun) candidates = ["grid", "rows"];
    else if (DATA_KINDS.has(kind)) candidates = [kind];
    else if (kind === "prose") {
      if (!chunk.heading) {
        family = "intro";
        candidates = ["lead"];
      } else candidates = ["split", ...(strongestSentence(tidy(chunk.blocks)) ? ["quote"] : []), "column"];
    } else if (kind === "statement") {
      if (!chunk.heading) {
        family = "intro";
        candidates = ["note"];
      } else candidates = ["scrub", ...(spareShader > 0 ? ["band"] : []), "quiet"];
    } else if (kind === "features") candidates = featureFits(chunk);
    else if (kind === "steps") candidates = stepFits(chunk);
    else if (kind === "checklist") candidates = checklistFits(chunk);
    else if (kind === "faq") candidates = faqFits(chunk);
    else candidates = [kind];

    // The scrape sometimes repeats a heading (an illustration and its section); show it once.
    const heading = chunk.heading?.toLowerCase();
    if (!isRun && heading && seenHeadings.has(heading)) {
      fold(item.chunks);
      continue;
    }
    if (heading) seenHeadings.add(heading);
    const open = candidates.filter((v) => !used.has(`${family}:${v}`));
    const sigFamily = isRun ? "pillars" : kind;
    const variant = (prevTile ? open.find((v) => !TILES.has(`${sigFamily}:${v}`)) : undefined) ?? open[0];
    const count = units.length;
    // Same kind back to back is folded, except figure-led sections (pricing tiers then add-ons) in two different looks.
    const figurePair = FIGURES.has(variant ?? "") && FIGURES.has(prevVariant);
    // Pricing is the exception: household plans then professional plans both have to stay visible.
    const keepPair = figurePair || page.path === "/pricing";
    if ((family === prevFamily && !keepPair) || count >= MAX_SLICES || !variant) {
      fold(item.chunks);
      continue;
    }
    used.add(`${family}:${variant}`);
    prevFamily = family;
    prevVariant = variant;
    prevTile = TILES.has(`${sigFamily}:${variant}`);

    const sigKey = `${sigFamily}:${variant}`;
    let motion = false;
    if (SIGNATURE.has(sigKey) && signatures < MAX_SIGNATURES && sinceSignature >= 2) {
      motion = true;
      signatures++;
      sinceSignature = 0;
    } else sinceSignature++;
    if (variant === "band") spareShader--;

    // Collect the notes each slice sets aside.
    const label = chunk.heading;
    const push = (texts: string[]) => texts.forEach((text, i) => notes.push({ text, label: i === 0 ? label : undefined }));
    if (!isRun && kind === "features") push(featureParts(chunk).notes);
    if (!isRun && kind === "steps") push(stepParts(chunk).notes);
    if (!isRun && kind === "checklist") push(checklistParts(chunk).notes);

    units.push(
      isRun
        ? { t: "pillars", chunks: item.chunks, variant: variant as PillarsVariant, motion, key: chunk.id }
        : { t: "slice", chunk, index: item.index, kind, variant: DATA_KINDS.has(kind) ? undefined : variant, motion, key: chunk.id }
    );
  }

  return { hero, units, more, notes, sources, closing };
}
