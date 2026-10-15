// Quote slice, three looks:
//   testimonial  centered display quote with attribution; the one place this slice spends motion (masked line rise)
//   pair         two short quotes side by side on tone tiles (e.g. two example policies)
//   pull         a centered static pull quote under the section heading
import { SplitHeading } from "@/components/motion/split-heading";
import type { SliceProps } from "@/components/slices/types";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ShortProse } from "./data-body";
import { DataFrame } from "./data-frame";

const curl = (s: string) => `“${s.trim().replace(/^["“”]+|["“”]+$/g, "")}”`;
/** "Garrett Gunderson" style lines: short, no sentence punctuation. */
const isName = (b: Block | undefined): b is { t: "p"; text: string } => b?.t === "p" && b.text.length <= 60 && !/[.?!:]$/.test(b.text);
const isRole = (b: Block | undefined): b is { t: "p"; text: string } => b?.t === "p" && b.text.length <= 120;

function parse(blocks: Block[]) {
  const qi = blocks.findIndex((b) => b.t === "quote");
  const before = blocks.slice(0, Math.max(qi, 0));
  const quotes: string[] = [];
  let i = qi;
  while (blocks[i]?.t === "quote") quotes.push((blocks[i++] as { text: string }).text);
  let name: string | undefined;
  let role: string | undefined;
  const nb = blocks[i];
  if (isName(nb)) {
    name = nb.text;
    i++;
    const rb = blocks[i];
    if (isRole(rb)) {
      role = rb.text;
      i++;
    }
  }
  return { before, quotes, name, role, after: blocks.slice(i) };
}

export function QuoteSlice({ chunk, layout = "full" }: SliceProps) {
  const { before, quotes, name, role, after } = parse(chunk.blocks);
  const full = layout === "full";
  const variant = name ? "testimonial" : quotes.length === 2 ? "pair" : "pull";
  // A heading that only introduces the quote ("From an X1 customer") reads as an eyebrow.
  const kicker = !!chunk.heading && chunk.heading.length <= 48 && !before.length && variant === "testimonial";
  const bare = { ...chunk, heading: undefined, eyebrow: undefined };

  if (variant === "pair") {
    return (
      <DataFrame chunk={chunk} layout={layout}>
        {before.length > 0 && <ShortProse blocks={before} layout={layout} className="mb-8" />}
        <div className={cn("grid grid-cols-1 gap-2.5", full && "md:grid-cols-2")}>
          {quotes.map((q, k) => (
            <blockquote key={k} className="flex flex-col justify-between gap-8 rounded-[var(--radius-tile)] bg-card p-6 sm:p-8">
              <span className="font-mono text-[0.6875rem] text-subtle tabular-nums">{String(k + 1).padStart(2, "0")}</span>
              <p className="font-display text-[1.25rem] leading-snug font-medium tracking-[-0.02em] text-pretty md:text-[1.375rem]">{curl(q)}</p>
            </blockquote>
          ))}
        </div>
        {after.length > 0 && <ShortProse blocks={after} layout={layout} className="mt-8" />}
      </DataFrame>
    );
  }

  return (
    <DataFrame chunk={bare} layout={layout}>
      <figure className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {kicker && <h2 className={cn("text-eyebrow text-muted-foreground", full ? "mb-8" : "mb-5")}>{chunk.heading}</h2>}
        {!kicker && chunk.heading && (
          <h2 className={cn("font-display font-medium text-balance", full ? "mb-6 text-display-md" : "mb-4 text-[1.625rem] leading-[1.15] tracking-[-0.03em]")}>
            {chunk.heading}
          </h2>
        )}
        {before.length > 0 && <ShortProse blocks={before} layout="article" className="mb-10 max-w-xl" />}
        {quotes.map((q, k) =>
          variant === "testimonial" ? (
            <SplitHeading key={k} as="blockquote" className={cn("font-display font-medium", full ? "text-display-md" : "text-[1.75rem] leading-[1.15] tracking-[-0.03em]")}>
              {curl(q)}
            </SplitHeading>
          ) : (
            <blockquote
              key={k}
              className="font-display text-[1.5rem] leading-[1.2] font-medium tracking-[-0.03em] text-balance md:text-[clamp(1.5rem,2.2vw,2rem)]"
            >
              {curl(q)}
            </blockquote>
          )
        )}
        {name && (
          <figcaption className={cn("flex flex-col items-center gap-1", full ? "mt-10" : "mt-6")}>
            <span className="text-sm font-medium">{name}</span>
            {role && <span className="text-[0.8125rem] text-muted-foreground">{role}</span>}
          </figcaption>
        )}
        {after.length > 0 && <ShortProse blocks={after} layout="article" className={cn("max-w-xl", full ? "mt-10" : "mt-6")} />}
      </figure>
    </DataFrame>
  );
}
