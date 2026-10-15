// One idea, said once. Variants:
//   scrub   centered display line; as a signature moment its words ink in as you read
//   band    the line set on a slim shader strip, body to the right (uses the page's one spare shader)
//   quiet   left-aligned display line on cols 1-7, body set low on cols 8-12
//   note    heading-less statements: a short centered note
import { Check } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { ItemText } from "@/components/slices/blocks";
import type { SliceProps } from "@/components/slices/types";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/utils";
import { SliceShell, tidy } from "./landing-kit";
import { ScrubLine } from "./landing-motion";

export type StatementVariant = "scrub" | "band" | "quiet" | "note";
type Props = SliceProps & { variant?: StatementVariant; motion?: boolean };

function Body({ blocks, center, className }: { blocks: Block[]; center?: boolean; className?: string }) {
  if (!blocks.length) return null;
  return (
    <div className={cn("flex flex-col gap-4", center && "items-center", className)}>
      {blocks.map((b, i) => {
        if (b.t === "p" || b.t === "h4")
          return (
            <p key={i} className="max-w-xl text-pretty text-muted-foreground">
              {b.text}
            </p>
          );
        if (b.t === "list")
          return (
            <ul key={i} className={cn("flex flex-wrap gap-2", center && "justify-center")}>
              {b.items.map((it, k) => (
                <li key={k} className="inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-[0.8125rem] text-muted-foreground">
                  <Check className="size-3 shrink-0" />
                  <ItemText lines={it} />
                </li>
              ))}
            </ul>
          );
        return null;
      })}
    </div>
  );
}

export function StatementSlice({ chunk, layout = "full", variant, motion }: Props) {
  const blocks = tidy(chunk.blocks);

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        {chunk.heading && (
          <h2 className="font-display text-[clamp(1.625rem,2.4vw,2.125rem)] leading-[1.15] font-medium tracking-[-0.03em] text-balance">{chunk.heading}</h2>
        )}
        <Body blocks={blocks} className="mt-4" />
      </SliceShell>
    );
  }

  const v: StatementVariant = !chunk.heading ? "note" : (variant ?? "scrub");

  if (v === "note") {
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12">
          <Body blocks={blocks} className="col-span-4 md:col-span-6 md:col-start-7" />
        </div>
      </SliceShell>
    );
  }

  if (v === "band") {
    return (
      <SliceShell chunk={chunk}>
        <div className="dark relative isolate overflow-hidden rounded-[var(--radius-tile)] bg-background text-foreground">
          <GrainShader angle={160} light={0.4} folds={0.6} />
          <div className="relative grid-12 gap-y-6 px-6 py-14 md:px-12 md:py-20">
            <h2 className="col-span-4 font-display text-display-md font-medium text-balance md:col-span-7">{chunk.heading}</h2>
            <Body blocks={blocks} className="col-span-4 md:col-span-4 md:col-start-9 md:self-end [&_p]:text-foreground/70" />
          </div>
        </div>
      </SliceShell>
    );
  }

  if (v === "quiet") {
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 items-end gap-y-6">
          <h2 className="col-span-4 font-display text-display-md font-medium text-balance md:col-span-7">{chunk.heading}</h2>
          <Body blocks={blocks} className="col-span-4 md:col-span-4 md:col-start-9" />
        </div>
      </SliceShell>
    );
  }

  const Line = motion ? ScrubLine : "h2";
  return (
    <SliceShell chunk={chunk} spacing="default">
      <div className="flex flex-col items-center text-center">
        <Line className="max-w-4xl font-display text-display-lg font-medium text-balance">{chunk.heading}</Line>
        <Body blocks={blocks} center className="mt-8" />
      </div>
    </SliceShell>
  );
}
