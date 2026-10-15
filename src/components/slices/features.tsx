// h3 groups. Variants (the composer picks by content; a page never shows the same one twice):
//   bento     one large tile and smaller ones on a 6-col subgrid; small tiles show their first sentence
//   tabs      titles on the left, one panel on the right (many groups, longer bodies)
//   contrast  two groups side by side, e.g. "X1 can" and "X1 can't"
//   list      compact two-column index of titles and first sentences, no cards
//   plans     tiles that lead with a figure (pricing)
//   ledger    figure-led groups as rows: name and detail on the left, the figure set large on the right
// Groups titled as questions follow as an accordion. Disclaimers trailing the last group are returned by
// featureParts() so the landing page can move them into its footnotes.
import { Check, Minus } from "lucide-react";
import { ItemText } from "@/components/slices/blocks";
import type { SliceProps } from "@/components/slices/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Block, Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";
import { isFigure, isFragment, isQuestion, lead, More, pad, SliceShell, SliceTitle, splitGroups, tidy, type Group } from "./landing-kit";
import { Enter, VerticalTabs } from "./landing-motion";

export type FeaturesVariant = "bento" | "tabs" | "contrast" | "list" | "plans" | "ledger";
type Props = SliceProps & { variant?: FeaturesVariant; motion?: boolean };

/** Within a group, short label-like lines are UI residue unless they carry a figure. */
const groupBlocks = (blocks: Block[]) => tidy(blocks.filter((b, i) => !(i > 0 && isFragment(b))));

export function featureParts(chunk: Chunk) {
  const { intro, groups } = splitGroups(chunk.blocks);
  const all: Group[] = groups.map((g) => ({ title: g.title, blocks: groupBlocks(g.blocks) }));
  const questions = all.filter((g) => isQuestion(g.title));
  const tiles = all.filter((g) => !isQuestion(g.title));
  let notes: string[] = [];
  const last = tiles[tiles.length - 1];
  if (last && tiles.length > 2 && last.blocks.every((b) => b.t === "p")) {
    const ps = last.blocks.filter((b): b is Extract<Block, { text: string }> => b.t === "p" && !isFigure(b.text));
    if (ps.length > 1) {
      notes = ps.slice(1).map((b) => b.text);
      tiles[tiles.length - 1] = { ...last, blocks: last.blocks.filter((b) => !(b.t === "p" && notes.includes(b.text))) };
    }
  }
  return { intro: tidy(intro), tiles, questions, notes };
}

const textLen = (blocks: Block[]) =>
  blocks.reduce((a, b) => a + (b.t === "p" || b.t === "h4" ? b.text.length : b.t === "list" ? b.items.flat().join(" ").length : 0), 0);

/** Which variants fit this chunk, best first. */
export function featureFits(chunk: Chunk): FeaturesVariant[] {
  const { tiles } = featureParts(chunk);
  const n = tiles.length;
  const avg = tiles.reduce((a, g) => a + textLen(g.blocks), 0) / Math.max(n, 1);
  const fits: FeaturesVariant[] = [];
  // Figure-led groups (prices) must keep their figures visible: only the two looks that show them.
  if (tiles.some((g) => g.blocks.some((b) => b.t === "p" && isFigure(b.text)))) return ["plans", "ledger"];
  if (n === 2) fits.push("contrast");
  if (n >= 4 && avg > 140) fits.push("tabs");
  if (n >= 3 && n <= 6) fits.push("bento");
  if (n >= 3) fits.push("list", "tabs");
  fits.push("list");
  return [...new Set(fits)];
}

/* ---------- Bodies ---------- */

function FullBody({ blocks, size = "base" }: { blocks: Block[]; size?: "base" | "sm" }) {
  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((b, i) => {
        if (b.t === "p" && isFigure(b.text) && b.text.length <= 24)
          return (
            <p key={i} className="font-display text-[1.75rem] leading-none font-medium tracking-[-0.03em] tabular-nums">
              {b.text}
            </p>
          );
        if (b.t === "p" || b.t === "h4")
          return (
            <p key={i} className={cn("text-pretty text-muted-foreground", size === "sm" ? "text-[0.875rem] leading-relaxed" : "text-[0.9375rem] leading-relaxed")}>
              {b.text}
            </p>
          );
        if (b.t === "list")
          return (
            <ul key={i} className="mt-1 flex flex-col gap-2 text-[0.875rem] leading-relaxed">
              {b.items.map((it, k) => (
                <li key={k} className="flex gap-3">
                  <Check className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
                  <ItemText lines={it} className="text-foreground/85" />
                </li>
              ))}
            </ul>
          );
        return null;
      })}
    </div>
  );
}

/** First sentence visible; everything else behind "More". */
function BriefBody({ blocks }: { blocks: Block[] }) {
  const firstP = blocks.find((b) => b.t === "p");
  if (!firstP || firstP.t !== "p") return <FullBody blocks={blocks} size="sm" />;
  const { first, rest } = lead(firstP.text);
  const remaining: Block[] = [...(rest ? [{ t: "p" as const, text: rest }] : []), ...blocks.filter((b) => b !== firstP)];
  return (
    <>
      <p className="text-[0.875rem] leading-relaxed text-pretty text-muted-foreground">{first}</p>
      {remaining.length > 0 && (
        <More className="mt-1">
          <FullBody blocks={remaining} size="sm" />
        </More>
      )}
    </>
  );
}

/* ---------- Variants ---------- */

// Bento spans on a 6-col subgrid, by tile count. The first tile is the large one.
const BENTO: Record<number, string[]> = {
  3: ["md:col-span-6 lg:col-span-3 lg:row-span-2", "md:col-span-3", "md:col-span-3"],
  4: ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"],
  5: ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-2"],
  6: ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4", "md:col-span-3", "md:col-span-3"],
};

function Bento({ tiles, motion }: { tiles: Group[]; motion?: boolean }) {
  const spans = BENTO[tiles.length] ?? [];
  const cells = tiles.map((g, i) => {
    const big = i === 0;
    return (
      <div key={g.title + i} data-lm-item className={cn("h-full", spans[i])}>
        <div className={cn("flex h-full flex-col rounded-[var(--radius)] p-6 md:p-8", big ? "bg-raised/70" : "bg-card")}>
          <span className="font-mono text-data text-subtle">{pad(i + 1)}</span>
          <h3 className={cn("font-medium tracking-tight text-balance", big ? "mt-auto pt-12 font-display text-display-md md:pt-20" : "mt-6 text-lg md:mt-10")}>
            {g.title}
          </h3>
          <div className={cn(big ? "mt-4 max-w-md" : "mt-2")}>{big ? <FullBody blocks={g.blocks} /> : <BriefBody blocks={g.blocks} />}</div>
        </div>
      </div>
    );
  });
  const cls = "grid grid-cols-1 gap-2 md:grid-cols-6";
  return motion ? (
    <Enter kind="wipe" stagger={0.09} className={cls}>
      {cells}
    </Enter>
  ) : (
    <div className={cls}>{cells}</div>
  );
}

function Contrast({ tiles }: { tiles: Group[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {tiles.slice(0, 2).map((g, i) => {
        const negative = i === 1 && /n['’]t\b|\bnot\b|\bnever\b/i.test(g.title);
        const Icon = negative ? Minus : Check;
        const hasList = g.blocks.some((b) => b.t === "list");
        const lines = g.blocks.flatMap((b) => (b.t === "list" ? b.items.map((it) => it.join(" ")) : !hasList && b.t === "p" ? [b.text] : []));
        const aside = hasList ? g.blocks.flatMap((b) => (b.t === "p" ? [b.text] : [])) : [];
        return (
          <div key={g.title} className={cn("rounded-[var(--radius-tile)] p-6 md:p-10", i === 0 ? "bg-card" : "bg-card/50")}>
            <h3 className="font-display text-title font-medium">{g.title}</h3>
            <ul className="mt-6 flex flex-col gap-4">
              {lines.map((t, k) => (
                <li key={k} className="flex gap-4 text-[0.9375rem] leading-relaxed">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", negative ? "bg-raised/60 text-muted-foreground" : "bg-raised text-foreground")}>
                    <Icon className="size-3.5" />
                  </span>
                  <span className={cn("pt-0.5 text-pretty", negative && "text-muted-foreground")}>{t}</span>
                </li>
              ))}
            </ul>
            {aside.map((t, k) => (
              <p key={k} className="mt-6 text-[0.8125rem] leading-relaxed text-pretty text-muted-foreground">
                {t}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function IndexList({ tiles }: { tiles: Group[] }) {
  return (
    <ol className="grid grid-cols-1 gap-x-[var(--grid-gap)] gap-y-10 lg:grid-cols-2">
      {tiles.map((g, i) => (
        <li key={g.title + i} className="grid grid-cols-[2.5rem_1fr] gap-x-2 lg:pr-8">
          <span className="pt-1 font-mono text-data text-subtle">{pad(i + 1)}</span>
          <div>
            <h3 className="text-lg font-medium tracking-tight text-balance">{g.title}</h3>
            <div className="mt-2">
              <BriefBody blocks={g.blocks} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Plans({ tiles }: { tiles: Group[] }) {
  const five = tiles.length === 5;
  const cols: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2" };
  return (
    <div className={cn("grid grid-cols-1 gap-2", five ? "md:grid-cols-6" : (cols[tiles.length] ?? "md:grid-cols-2 lg:grid-cols-3"))}>
      {tiles.map((g, i) => (
        <div key={g.title + i} className={cn("flex h-full flex-col rounded-[var(--radius)] bg-card p-5 sm:p-6 md:p-7", five && (i < 2 ? "md:col-span-3" : "md:col-span-2"))}>
          <h3 className="text-lg font-medium tracking-tight text-balance">{g.title}</h3>
          <div className="mt-3">
            <FullBody blocks={g.blocks} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Ledger({ tiles }: { tiles: Group[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {tiles.map((g, i) => {
        const fig = g.blocks.find((b) => b.t === "p" && isFigure(b.text));
        const rest = g.blocks.filter((b) => b !== fig);
        return (
          <li key={g.title + i} className={cn("grid-12 items-baseline gap-y-3 rounded-[var(--radius)] px-5 py-6 md:px-8", i % 2 ? "bg-card/50" : "bg-card")}>
            <h3 className="col-span-4 text-lg font-medium tracking-tight md:col-span-3">{g.title}</h3>
            <div className="col-span-4 md:col-span-6">
              <BriefBody blocks={rest} />
            </div>
            {fig && fig.t === "p" && (
              <p className="col-span-4 font-display text-[1.75rem] leading-none font-medium tracking-[-0.03em] tabular-nums md:col-span-3 md:text-right">
                {fig.text}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Questions({ items, className }: { items: Group[]; className?: string }) {
  if (!items.length) return null;
  return (
    <Accordion type="single" collapsible className={cn("flex flex-col gap-2", className)}>
      {items.map((q) => (
        <AccordionItem key={q.title} value={q.title}>
          <AccordionTrigger>{q.title}</AccordionTrigger>
          <AccordionContent>
            <FullBody blocks={q.blocks} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function Intro({ blocks, center }: { blocks: Block[]; center?: boolean }) {
  const ps = blocks.filter((b): b is Extract<Block, { text: string }> => b.t === "p" || b.t === "h4");
  if (!ps.length) return null;
  return <p className={cn("mt-5 max-w-xl text-lede text-pretty text-muted-foreground", center && "mx-auto")}>{lead(ps[0].text).first}</p>;
}

export function FeaturesSlice({ chunk, layout = "full", variant, motion }: Props) {
  const { intro, tiles, questions, notes } = featureParts(chunk);

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        <SliceTitle chunk={chunk} layout="article" />
        <Intro blocks={intro} />
        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {tiles.map((g, i) => (
            <div key={g.title + i} className="rounded-[var(--radius)] bg-card p-5">
              <h3 className="font-medium tracking-tight">{g.title}</h3>
              <div className="mt-2">
                <FullBody blocks={g.blocks} size="sm" />
              </div>
            </div>
          ))}
        </div>
        <Questions items={questions} className="mt-6" />
        {notes.length > 0 && (
          <div className="mt-5 flex flex-col gap-2 text-data leading-relaxed text-subtle">
            {notes.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        )}
      </SliceShell>
    );
  }

  const v = variant ?? featureFits(chunk)[0] ?? "list";
  const header = (center: boolean) =>
    (chunk.heading || intro.length > 0) && (
      <div className={cn("mb-12 md:mb-16", center ? "mx-auto max-w-2xl text-center" : "max-w-2xl")}>
        <SliceTitle chunk={chunk} align={center ? "center" : "left"} animate={motion} />
        <Intro blocks={intro} center={center} />
      </div>
    );

  return (
    <SliceShell chunk={chunk}>
      {v === "tabs" ? (
        <>
          {header(false)}
          <VerticalTabs items={tiles.map((g) => ({ title: g.title, body: <FullBody blocks={g.blocks} /> }))} />
        </>
      ) : v === "contrast" ? (
        <>
          {header(true)}
          <Contrast tiles={tiles} />
        </>
      ) : v === "list" ? (
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-12 lg:col-span-4">
            <SliceTitle chunk={chunk} animate={motion} />
            <Intro blocks={intro} />
          </div>
          <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6">
            <IndexList tiles={tiles} />
          </div>
        </div>
      ) : v === "ledger" ? (
        <>
          {header(false)}
          <Ledger tiles={tiles} />
        </>
      ) : v === "plans" ? (
        <>
          {header(true)}
          <Plans tiles={tiles} />
        </>
      ) : (
        <>
          {header(false)}
          <Bento tiles={tiles} motion={motion} />
        </>
      )}
      <Questions items={questions} className="mx-auto mt-14 max-w-3xl md:mt-16" />
    </SliceShell>
  );
}
