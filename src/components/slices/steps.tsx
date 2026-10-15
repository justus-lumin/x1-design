// An ordered list as steps. Variants:
//   carousel  a horizontal snap row of step cards; swipeable on phones, a plain row when it fits
//   timeline  heading on cols 1-4, a vertical sequence on cols 6-12 with small mono numbers
//   numerals  large static numerals in a row; at most once per page and only for short steps
// Every step shows its title and first sentence; the rest of its text waits behind "More".
// Text after the list (caveats, illustration notes) is returned by stepParts() for the page's footnotes.
import type { SliceProps } from "@/components/slices/types";
import type { Block, Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";
import { firstOrderedList, lead, More, pad, SliceShell, SliceTitle, tidy, type List } from "./landing-kit";

export type StepsVariant = "carousel" | "timeline" | "numerals";
type Props = SliceProps & { variant?: StepsVariant; motion?: boolean };

export function stepParts(chunk: Chunk) {
  const blocks = tidy(chunk.blocks);
  const at = firstOrderedList(blocks);
  const list = (at >= 0 ? blocks[at] : blocks.find((b) => b.t === "list")) as List | undefined;
  const intro: Block[] = at >= 0 ? blocks.slice(0, at) : blocks.filter((b) => b !== list);
  const outro: Block[] = at >= 0 ? blocks.slice(at + 1) : [];
  const notes = outro.flatMap((b) => (b.t === "p" || b.t === "h4" ? [b.text] : b.t === "list" ? b.items.map((i) => i.join(" ")) : []));
  return { intro, items: list?.items ?? [], notes };
}

export function stepFits(chunk: Chunk): StepsVariant[] {
  const { items } = stepParts(chunk);
  const short = items.length <= 5 && items.every((it) => it.join(" ").length <= 200);
  return short ? ["numerals", "carousel", "timeline"] : ["timeline", "carousel"];
}

function StepBody({ lines }: { lines: string[] }) {
  const [title, ...rest] = lines;
  const { first, rest: more } = lead(rest.join(" "), 260);
  return (
    <>
      <p className={cn("text-lg tracking-tight text-balance", rest.length ? "font-medium" : "")}>{title}</p>
      {first && <p className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">{first}</p>}
      {more && (
        <More className="mt-1">
          <p className="text-[0.875rem] leading-relaxed text-pretty text-muted-foreground">{more}</p>
        </More>
      )}
    </>
  );
}

function Intro({ blocks, className }: { blocks: Block[]; className?: string }) {
  const p = blocks.find((b) => b.t === "p");
  if (!p || p.t !== "p") return null;
  return <p className={cn("max-w-xl text-pretty text-muted-foreground", className)}>{lead(p.text).first}</p>;
}

export function StepsSlice({ chunk, layout = "full", variant, motion }: Props) {
  const { intro, items, notes } = stepParts(chunk);

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        <SliceTitle chunk={chunk} layout="article" />
        <Intro blocks={intro} className="mt-4" />
        <ol className="mt-6 flex flex-col gap-6">
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span className="pt-1.5 font-mono text-data text-subtle">{pad(i + 1)}</span>
              <div>
                <StepBody lines={it} />
              </div>
            </li>
          ))}
        </ol>
        {notes.length > 0 && <p className="mt-5 text-data leading-relaxed text-subtle">{notes.join(" ")}</p>}
      </SliceShell>
    );
  }

  const v = variant ?? stepFits(chunk)[0];

  if (v === "timeline") {
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-5 lg:col-span-4">
            <div className="md:sticky md:top-28">
              <SliceTitle chunk={chunk} animate={motion} />
              <Intro blocks={intro} className="mt-5" />
            </div>
          </div>
          <ol className="col-span-4 flex flex-col gap-3 md:col-span-7 md:col-start-6 lg:col-start-6">
            {items.map((it, i) => (
              <li key={i} className={cn("grid grid-cols-[2.75rem_1fr] gap-2 rounded-[var(--radius)] px-5 py-6 md:grid-cols-[3.5rem_1fr] md:px-7", i % 2 ? "bg-card/50" : "bg-card")}>
                <span className="pt-1.5 font-mono text-data text-subtle">{pad(i + 1)}</span>
                <div>
                  <StepBody lines={it} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </SliceShell>
    );
  }

  if (v === "numerals") {
    const cols: Record<number, string> = { 3: "lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4", 5: "sm:grid-cols-2 lg:grid-cols-5" };
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 gap-y-6">
          <div className="col-span-4 md:col-span-5">
            <SliceTitle chunk={chunk} animate={motion} />
          </div>
          <Intro blocks={intro} className="col-span-4 md:col-span-6 md:col-start-7 md:pt-2" />
        </div>
        <ol className={cn("mt-12 grid grid-cols-1 gap-x-[var(--grid-gap)] gap-y-8 md:mt-20", cols[items.length] ?? "sm:grid-cols-2 lg:grid-cols-3")}>
          {items.map((it, i) => (
            <li key={i} className="grid grid-cols-[3.75rem_1fr] items-start gap-3 sm:flex sm:flex-col sm:gap-6 sm:pr-4">
              <span aria-hidden className="font-display text-[2.5rem] leading-none font-medium tracking-[-0.05em] tabular-nums text-foreground sm:text-[clamp(3rem,5vw,4.5rem)]">
                {pad(i + 1)}
              </span>
              <div className="pt-1 sm:pt-0">
                <StepBody lines={it} />
              </div>
            </li>
          ))}
        </ol>
      </SliceShell>
    );
  }

  // Carousel: native scroll-snap, bleeds to the screen edge on phones. No JS.
  return (
    <SliceShell chunk={chunk}>
      <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center md:mb-14">
        <SliceTitle chunk={chunk} align="center" animate={motion} />
        <Intro blocks={intro} className="mt-5" />
      </div>
      <ol
        aria-label={chunk.heading}
        className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}
      >
        {items.map((it, i) => (
          <li key={i} className="flex w-[82%] shrink-0 snap-start flex-col rounded-[var(--radius-tile)] bg-card p-6 sm:w-[46%] md:p-7 lg:w-auto">
            <span className="text-data text-muted-foreground">
              Step <span className="font-mono">{pad(i + 1)}</span>
              <span className="text-subtle"> / {pad(items.length)}</span>
            </span>
            <div className="mt-10 md:mt-14">
              <StepBody lines={it} />
            </div>
          </li>
        ))}
      </ol>
    </SliceShell>
  );
}
