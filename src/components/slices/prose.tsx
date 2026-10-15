// Long-form copy, edited by presentation: the opening line carries the section, the rest waits behind "Read more".
// Variants (the landing composer picks one; registry callers get a sensible default):
//   split   heading cols 1-5, opening paragraph cols 7-12
//   quote   the section's strongest sentence lifted large and centered, heading small above it
//   column  heading across cols 1-8, text offset to cols 5-12
//   lead    heading-less intro copy in a centered reading column
// layout="article" renders the full text in the article column.
import { Prose } from "@/components/slices/blocks";
import type { SliceProps } from "@/components/slices/types";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/utils";
import { lead, More, SliceShell, SliceTitle, strongestSentence, tidy } from "./landing-kit";
import { ScrubLine } from "./landing-motion";

export type ProseVariant = "split" | "quote" | "column" | "lead";
type Props = SliceProps & { variant?: ProseVariant; motion?: boolean };

/** Split blocks into what shows and what waits. Keeps at least one paragraph visible. */
function cut(blocks: Block[], show = 1) {
  let seen = 0;
  const at = blocks.findIndex((b) => b.t === "p" && ++seen > show);
  return at === -1 ? { shown: blocks, rest: [] as Block[] } : { shown: blocks.slice(0, at), rest: blocks.slice(at) };
}

export function ProseBody({ blocks, lead, className }: { blocks: Block[]; lead?: boolean; className?: string }) {
  return (
    <Prose
      blocks={blocks}
      className={cn("[&>p:first-child]:text-foreground", lead && "[&>p:first-child]:text-lede", className)}
    />
  );
}

function Rest({ blocks }: { blocks: Block[] }) {
  if (!blocks.length) return null;
  return (
    <More label="Read more" className="mt-4">
      <Prose blocks={blocks} className="pt-2 text-[0.9375rem]" />
    </More>
  );
}

export function ProseSlice({ chunk, index, layout = "full", variant, motion }: Props) {
  const blocks = tidy(chunk.blocks);

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        <SliceTitle chunk={chunk} layout="article" className="mb-6" />
        <ProseBody blocks={blocks} />
      </SliceShell>
    );
  }

  const v: ProseVariant = !chunk.heading ? "lead" : (variant ?? (index % 2 ? "column" : "split"));

  if (v === "lead") {
    // Intro copy before the first section: one paragraph in the right-hand reading column, the rest folded.
    // Label runs here are usually captions from a product illustration, so they are left out.
    const clean = blocks.filter((b) => b.t !== "h4");
    const firstP = clean.find((b) => b.t === "p");
    const opening = firstP && firstP.t === "p" ? lead(firstP.text, 240) : undefined;
    const shown: Block[] = opening ? [{ t: "p", text: opening.first }] : [];
    const rest: Block[] = [...(opening?.rest ? [{ t: "p" as const, text: opening.rest }] : []), ...clean.filter((b) => b !== firstP)];
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12">
          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <ProseBody blocks={shown} lead />
            <Rest blocks={rest} />
          </div>
        </div>
      </SliceShell>
    );
  }

  if (v === "quote") {
    const line = strongestSentence(blocks);
    const remaining = line
      ? blocks.map((b) => (b.t === "p" && b.text.includes(line) ? { ...b, text: b.text.replace(line, "").trim() } : b)).filter((b) => !(b.t === "p" && !b.text))
      : blocks;
    return (
      <SliceShell chunk={chunk} spacing="default">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <h2 className="text-eyebrow text-muted-foreground">{chunk.heading}</h2>
          {line &&
            (motion ? (
              <ScrubLine as="p" className="mt-8 font-display text-display-md font-medium">
                {line}
              </ScrubLine>
            ) : (
              <p className="mt-8 font-display text-display-md font-medium text-balance">{line}</p>
            ))}
        </div>
        {remaining.length > 0 && (
          <div className="mx-auto mt-10 max-w-2xl">
            <More label="Read the section">
              <Prose blocks={remaining} className="pt-2 text-[0.9375rem]" />
            </More>
          </div>
        )}
      </SliceShell>
    );
  }

  if (v === "column") {
    const { shown, rest } = cut(blocks, 2);
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-8">
            <SliceTitle chunk={chunk} animate={motion} />
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-6">
            <ProseBody blocks={shown} />
            <Rest blocks={rest} />
          </div>
        </div>
      </SliceShell>
    );
  }

  const { shown, rest } = cut(blocks, 1);
  return (
    <SliceShell chunk={chunk}>
      <div className="grid-12 gap-y-8">
        <div className="col-span-4 md:col-span-5">
          <SliceTitle chunk={chunk} animate={motion} />
        </div>
        <div className="col-span-4 md:col-span-6 md:col-start-7 md:pt-2">
          <ProseBody blocks={shown} lead />
          <Rest blocks={rest} />
        </div>
      </div>
    </SliceShell>
  );
}
