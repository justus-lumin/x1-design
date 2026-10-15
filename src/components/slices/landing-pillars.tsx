// A run of short statements (heading + one line each) as one calm unit instead of a stack of giant lines.
// Variants:
//   grid  tiles in a 2/3/4-col grid; as a signature moment they wipe up in sequence
//   rows  a two-column index with small mono numbers, no cards
// Each item keeps its chunk id as an anchor and its h2. When an item's heading names a page we have
// (e.g. a calculator on /tools/tax), it links there.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/brand/primitives";
import type { Chunk, Page } from "@/lib/content";
import { hasPage } from "@/lib/content";
import { cn } from "@/lib/utils";
import { MotionStyle, pad, textOf, tidy } from "./landing-kit";
import { Enter } from "./landing-motion";

export type PillarsVariant = "grid" | "rows";

/** Heading plus a short paragraph: eligible to join a run. */
export const isPillar = (c: Chunk) =>
  c.kind === "statement" && !!c.heading && c.blocks.every((b) => b.t === "p") && textOf(c.blocks).length < 260;

const COLS: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" };

function hrefFor(c: Chunk, page: Page) {
  const section = page.path.split("/").filter(Boolean)[0];
  return [`/${section}/${c.id}`, `/${c.id}`].find((h) => h !== page.path && hasPage(h));
}

const textFor = (c: Chunk) => tidy(c.blocks).flatMap((b) => (b.t === "p" ? [b.text] : []));

export function PillarsSlice({ chunks, page, variant = "grid", motion }: { chunks: Chunk[]; page: Page; variant?: PillarsVariant; motion?: boolean }) {
  if (variant === "rows") {
    return (
      <section className="section-y-tight">
        <Container>
          <ol className="grid grid-cols-1 gap-x-[var(--grid-gap)] gap-y-10 md:grid-cols-2 lg:gap-x-24">
            {chunks.map((c, i) => {
              const href = hrefFor(c, page);
              const title = <h2 className="text-lg font-medium tracking-tight text-balance">{c.heading}</h2>;
              return (
                <li key={c.id} id={c.id} className="grid scroll-mt-24 grid-cols-[2.5rem_1fr] gap-x-2">
                  <span className="pt-1.5 font-mono text-data text-subtle">{pad(i + 1)}</span>
                  <div>
                    {href ? (
                      <Link href={href} className="group inline-flex items-start gap-2 transition-colors hover:text-foreground/70">
                        {title}
                        <ArrowUpRight className="mt-1.5 size-3.5 shrink-0 text-subtle transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </Link>
                    ) : (
                      title
                    )}
                    {textFor(c).map((t, k) => (
                      <p key={k} className="mt-2 text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
                        {t}
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>
    );
  }

  const tiles = chunks.map((c, i) => {
    const href = hrefFor(c, page);
    const inner = (
      <>
        <span className="font-mono text-data text-subtle">{pad(i + 1)}</span>
        <h2 className="mt-5 text-lg font-medium tracking-tight text-balance sm:mt-8 md:mt-10">{c.heading}</h2>
        <div className="mt-2 flex flex-col gap-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {textFor(c).map((t, k) => (
            <p key={k} className="text-pretty">
              {t}
            </p>
          ))}
        </div>
        {href && (
          <ArrowUpRight className="absolute top-6 right-6 size-4 text-subtle transition-[color,transform] duration-500 ease-[var(--ease-out)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        )}
      </>
    );
    const tile = "group relative flex h-full flex-col rounded-[var(--radius)] bg-card p-5 sm:p-6 md:p-7";
    return (
      <div key={c.id} id={c.id} data-lm-item className="scroll-mt-24">
        {href ? (
          <Link href={href} className={cn(tile, "transition-colors duration-500 hover:bg-raised/70")}>
            {inner}
          </Link>
        ) : (
          <div className={tile}>{inner}</div>
        )}
      </div>
    );
  });
  const cls = cn("grid grid-cols-1 gap-2", COLS[chunks.length] ?? "md:grid-cols-2 lg:grid-cols-3");
  return (
    <section className="section-y-tight">
      <MotionStyle />
      <Container>
        {motion ? (
          <Enter kind="wipe" stagger={0.08} className={cls}>
            {tiles}
          </Enter>
        ) : (
          <div className={cls}>{tiles}</div>
        )}
      </Container>
    </section>
  );
}
