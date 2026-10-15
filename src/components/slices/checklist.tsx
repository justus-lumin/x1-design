// Unordered lists. Variants:
//   rows     two columns of short lines with a small check, no cards; long lists show six and fold the rest
//   prompts  questions set as X1 prompts ("Ask X1" rows with a send glyph), when the items are questions
//   pills    single words or short labels as pills
// Paragraphs around the list: the first becomes the intro, the rest go to the page's footnotes via checklistParts().
import { ArrowUp, Check } from "lucide-react";
import type { SliceProps } from "@/components/slices/types";
import type { Block, Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";
import { lead, More, SliceShell, SliceTitle, tidy, type List } from "./landing-kit";

export type ChecklistVariant = "rows" | "prompts" | "pills";
type Props = SliceProps & { variant?: ChecklistVariant; motion?: boolean };

export function checklistParts(chunk: Chunk) {
  const blocks = tidy(chunk.blocks);
  const lists = blocks.filter((b): b is List => b.t === "list");
  const items = lists.flatMap((l) => l.items);
  const paras = blocks.filter((b): b is Extract<Block, { text: string }> => b.t === "p" || b.t === "h4");
  const firstList = blocks.findIndex((b) => b.t === "list");
  const before = paras.filter((p) => p.t === "p" && blocks.indexOf(p) < firstList).map((p) => p.text);
  const notes = paras.filter((p) => p.t === "p" && blocks.indexOf(p) > firstList).map((p) => p.text);
  const subhead = paras.find((p) => p.t === "h4" && blocks.indexOf(p) < firstList)?.text;
  return { intro: before[0], extra: before.slice(1), subhead, items, notes };
}

const isShort = (items: string[][]) => items.every((it) => it.length === 1 && it[0].split(/\s+/).length <= 3);
const questionShare = (items: string[][]) => items.filter((it) => /\?\s*$/.test(it[0])).length / Math.max(items.length, 1);

export function checklistFits(chunk: Chunk): ChecklistVariant[] {
  const { items } = checklistParts(chunk);
  if (isShort(items)) return ["pills", "rows"];
  if (questionShare(items) >= 0.5) return ["prompts", "rows"];
  return ["rows", "prompts"];
}

function Rows({ items }: { items: string[][] }) {
  const shown = items.slice(0, 6);
  const rest = items.slice(6);
  const row = (it: string[], k: number) => {
    const { first, rest: more } = lead(it.join(" "));
    return (
      <li key={k} className="grid grid-cols-[1.25rem_1fr] gap-3 text-[0.9375rem] leading-relaxed">
        <Check className="mt-1 size-3.5 text-muted-foreground" />
        <span className="text-pretty">
          {it.length > 1 ? (
            <>
              <span className="font-medium">{it[0]}</span> <span className="text-muted-foreground">{lead(it.slice(1).join(" ")).first}</span>
            </>
          ) : (
            <>
              {first}
              {more && <span className="text-muted-foreground"> {more}</span>}
            </>
          )}
        </span>
      </li>
    );
  };
  return (
    <>
      <ul className="grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">{shown.map(row)}</ul>
      {rest.length > 0 && (
        <More label={`${rest.length} more`} className="mt-4">
          <ul className="grid grid-cols-1 gap-x-12 gap-y-5 pt-3 md:grid-cols-2">{rest.map((it, k) => row(it, k + 6))}</ul>
        </More>
      )}
    </>
  );
}

function Prompts({ items }: { items: string[][] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, k) => (
        <li key={k} className="flex items-start gap-4 rounded-[var(--radius)] bg-card px-5 py-4 transition-colors duration-300 hover:bg-raised/60">
          <span className="min-w-0 flex-1 text-[0.9375rem] leading-relaxed text-pretty">
            {it[0]}
            {it[1] && <span className="mt-1 block text-[0.8125rem] text-muted-foreground">{lead(it.slice(1).join(" ")).first}</span>}
          </span>
          <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[var(--radius-control)] bg-raised text-muted-foreground">
            <ArrowUp className="size-3.5" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Pills({ items }: { items: string[][] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((it, k) => (
        <li key={k} className="rounded-full bg-card px-4 py-2 text-[0.8125rem]">
          {it[0]}
        </li>
      ))}
    </ul>
  );
}

export function ChecklistSlice({ chunk, layout = "full", variant, motion }: Props) {
  const { intro, extra, subhead, items, notes } = checklistParts(chunk);
  const v = variant ?? checklistFits(chunk)[0];
  const body = v === "prompts" ? <Prompts items={items} /> : v === "pills" ? <Pills items={items} /> : <Rows items={items} />;

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        <SliceTitle chunk={chunk} layout="article" className="mb-4" />
        {intro && <p className="mb-6 text-pretty text-muted-foreground">{intro}</p>}
        {body}
        {notes.length > 0 && <p className="mt-5 text-data leading-relaxed text-subtle">{notes.join(" ")}</p>}
      </SliceShell>
    );
  }

  if (v === "prompts") {
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-5">
            <SliceTitle chunk={chunk} animate={motion} />
            {intro && <p className="mt-5 max-w-md text-pretty text-muted-foreground">{lead(intro).first}</p>}
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">{body}</div>
        </div>
      </SliceShell>
    );
  }

  return (
    <SliceShell chunk={chunk}>
      {(chunk.heading || intro || subhead) && (
        <div className="mb-10 max-w-2xl md:mb-12">
          <SliceTitle chunk={chunk} animate={motion} />
          {subhead && <p className="mt-5 font-medium tracking-tight">{subhead}</p>}
          {intro && <p className={cn("max-w-xl text-pretty text-muted-foreground", subhead ? "mt-2" : "mt-5")}>{subhead ? intro : lead(intro).first}</p>}
          {extra.length > 0 && (
            <More label="Read more" className="mt-3">
              <div className="flex max-w-xl flex-col gap-3 pt-1 text-pretty text-muted-foreground">
                {extra.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>
            </More>
          )}
        </div>
      )}
      {body}
    </SliceShell>
  );
}
