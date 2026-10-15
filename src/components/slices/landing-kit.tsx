// Shared plumbing for the landing slices (prose, statement, features, steps, checklist, faq, pillars).
// Server-safe: no hooks, no "use client". Motion lives in landing-motion.tsx.
import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Container, Eyebrow } from "@/components/brand/primitives";
import { SplitHeading } from "@/components/motion/split-heading";
import type { Block, Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";

export type Layout = "full" | "article";
export type Group = { title: string; blocks: Block[] };
type P = Extract<Block, { text: string }> & { t: "p" };
type List = Extract<Block, { t: "list" }>;

const isP = (b: Block | undefined): b is P => !!b && b.t === "p";
/** Prices and counts ("$0", "$499/month", "3 seats") are content, never UI noise. */
export const isFigure = (s: string) =>
  s.length <= 40 && /^[$€£]?\d[\d,.]*(\s?(%|\/\s?[a-z]+|[a-zA-Z]+))*\s*$/.test(s.trim());
/** Label-like paragraph: short, unpunctuated. Usually scraped UI from an illustration. */
export const isFragment = (b: Block | undefined): b is P =>
  isP(b) && b.text.length < 48 && !/[.?!:)”"]$/.test(b.text) && !/[$€£]|:\s/.test(b.text) && !isFigure(b.text);

/**
 * Cleans a chunk's blocks for display. The scraper picks up labels from product illustrations
 * ("Smart Reminders", "Ready", "Loading…"). Those that trail a list are dropped; a run of short labels
 * that introduces real copy becomes a small subheading ("Mat Silverstein · Founder").
 */
export function tidy(blocks: Block[]): Block[] {
  const out: Block[] = [];
  let afterList = false;
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    // Scraped run-ons where two lines lost their break: "1 professional seat10 client households".
    if (isP(b) && /[a-z]\d+\s[a-z]/.test(b.text)) b = { ...b, text: b.text.replace(/([a-z])(\d+\s[a-z])/g, "$1 · $2") };
    if (b.t === "list" || b.t === "dl" || b.t === "table") afterList = true;
    if (b.t === "h2" || b.t === "h3") afterList = false;
    if (isP(b) && /…$/.test(b.text)) continue;
    if (isFragment(b)) {
      if (afterList) continue;
      const run = [b.text];
      while (isFragment(blocks[i + 1])) run.push((blocks[++i] as P).text);
      const next = blocks[i + 1];
      // A detail line right before a price ("3 seats · 18 households", then "$899/month") is content, not a label.
      if (isP(next) && isFigure(next.text)) out.push({ t: "p", text: run.join(" · ") });
      else if (next && (next.t === "p" || next.t === "list")) out.push({ t: "h4", text: run.join(" · ") });
      continue;
    }
    out.push(b);
  }
  return out;
}

/** Split blocks at each h3: intro (before the first h3) and titled groups. */
export function splitGroups(blocks: Block[]) {
  const intro: Block[] = [];
  const groups: Group[] = [];
  for (const b of blocks) {
    if (b.t === "h3") groups.push({ title: b.text, blocks: [] });
    else if (groups.length) groups[groups.length - 1].blocks.push(b);
    else intro.push(b);
  }
  return { intro, groups };
}

export const firstOrderedList = (blocks: Block[]) =>
  blocks.findIndex((b) => b.t === "list" && b.ordered && b.items.length >= 3);

export const isQuestion = (s: string) => /\?\s*$/.test(s);

export const pad = (n: number) => String(n).padStart(2, "0");

/** Scraped kickers like "Download" are noise; real eyebrows are a few words. */
export const usableEyebrow = (c: Chunk) => (c.eyebrow && /\s/.test(c.eyebrow.trim()) ? c.eyebrow : undefined);

export const textOf = (blocks: Block[]) =>
  blocks
    .map((b) => (b.t === "p" || b.t === "h4" ? b.text : b.t === "list" ? b.items.map((i) => i.join(" ")).join(" ") : ""))
    .join(" ");

const LANDING_MOTION_CSS = `
.js [data-lm]:not([data-lm-ready]) [data-lm-item]{visibility:hidden}
@media (prefers-reduced-motion: reduce){.js [data-lm]:not([data-lm-ready]) [data-lm-item]{visibility:visible}}
`;

/** Pre-animation hiding rules. React dedupes this by href, so it ships once per page. */
export function MotionStyle() {
  return (
    <style href="x1-landing-motion" precedence="default">
      {LANDING_MOTION_CSS}
    </style>
  );
}

/**
 * Every slice renders inside a shell. "full" owns its section, container and rhythm;
 * "article" is a bare block that fits the article column.
 */
export function SliceShell({
  chunk,
  layout = "full",
  spacing = "tight",
  className,
  containerClassName,
  children,
}: {
  chunk: Chunk;
  layout?: Layout;
  spacing?: "tight" | "default";
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  if (layout === "article") {
    return (
      <div id={chunk.id} data-slice={chunk.kind} className={cn("scroll-mt-24", className)}>
        <MotionStyle />
        {children}
      </div>
    );
  }
  return (
    <section
      id={chunk.id}
      data-slice={chunk.kind}
      className={cn("relative scroll-mt-8", spacing === "tight" ? "section-y-tight" : "section-y", className)}
    >
      <MotionStyle />
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

/** Eyebrow + h2 for a chunk. Display size on landing pages, a calmer size inside articles. */
export function SliceTitle({
  chunk,
  layout = "full",
  align = "left",
  className,
  size = "md",
  animate = false,
}: {
  chunk: Chunk;
  layout?: Layout;
  align?: "left" | "center";
  className?: string;
  size?: "md" | "lg";
  /** Masked line rise. Reserved for a page's signature moments; most headings are static. */
  animate?: boolean;
}) {
  if (!chunk.heading) return null;
  const eyebrow = usableEyebrow(chunk);
  if (layout === "article") {
    return (
      <div className={cn(align === "center" && "text-center", className)}>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 className="font-display text-[clamp(1.5rem,2vw,1.875rem)] leading-[1.15] font-medium tracking-[-0.03em] text-balance">
          {chunk.heading}
        </h2>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col", align === "center" && "items-center text-center", className)}>
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      {animate ? (
        <SplitHeading className={cn("font-display font-medium", size === "lg" ? "text-display-lg" : "text-display-md")}>
          {chunk.heading}
        </SplitHeading>
      ) : (
        <h2 className={cn("font-display font-medium text-balance", size === "lg" ? "text-display-lg" : "text-display-md")}>{chunk.heading}</h2>
      )}
    </div>
  );
}

/** Internal routes use next/link; anything else is a plain anchor. */
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className} rel="noopener">
      {children}
    </a>
  );
}

/* ---------- Editing by presentation: show the strongest line, demote the rest. ---------- */

/** Sentence split that keeps abbreviations like "U.S." and decimals intact well enough for display copy. */
export function sentences(text: string) {
  const raw = text.split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/).map((t) => t.trim()).filter(Boolean);
  // Re-join splits after initials and abbreviations ("J.P. Morgan", "U.S. Treasury", "Rev. 12").
  const out: string[] = [];
  for (const piece of raw) {
    const prev = out[out.length - 1];
    if (prev && (/(\b[A-Z]\.|\b(?:Rev|No|Inc|Corp|Co|vs|St|Mr|Ms|Dr|Jr|Sr)\.)$/.test(prev) || prev.length < 24)) out[out.length - 1] = `${prev} ${piece}`;
    else out.push(piece);
  }
  return out;
}

/** First sentence and the remainder. Short text stays whole: folding one extra sentence is just noise. */
export function lead(text: string, keep = 170) {
  if (text.length <= keep) return { first: text, rest: "" };
  const s = sentences(text);
  if (s.length < 2 || s[0].length < 24) return { first: text, rest: "" };
  return { first: s[0], rest: s.slice(1).join(" ") };
}

/** The line worth lifting big: a sentence of readable length, preferring the opening one. */
export function strongestSentence(blocks: Block[]) {
  const all = blocks.flatMap((b) => (b.t === "p" ? sentences(b.text) : []));
  return all.find((t, i) => i === 0 && t.length >= 40 && t.length <= 150) ?? all.filter((t) => t.length >= 50 && t.length <= 150).sort((a, b) => a.length - b.length)[0];
}

/** Quiet disclosure. Native details element: no JS, keyboard and screen-reader friendly. */
export function More({ label = "More", children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <details className={cn("group/more", className)}>
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[0.8125rem] text-muted-foreground transition-colors duration-300 select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="grid size-5 place-items-center rounded-full bg-raised transition-transform duration-500 ease-[var(--ease-out)] group-open/more:rotate-45">
          <Plus className="size-3" />
        </span>
        <span className="group-open/more:hidden">{label}</span>
        <span className="hidden group-open/more:inline">Less</span>
      </summary>
      <div className="pt-1">{children}</div>
    </details>
  );
}

/** Headings whose sections are reference material, not story: they move to the footnotes. */
export const LOW_VALUE = /^(sources?|methodology|methods?|notes?|assumptions|assumptions and limits|limits|disclaimers?|references|footnotes|data sources?|how we (calculated|measured)[^.]*)\.?$/i;

export type { List, P };
