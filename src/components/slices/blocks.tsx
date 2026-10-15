import { Fragment } from "react";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * List item text arrives as lines. The scraper splits on inline elements, so lines are either
 * [title, ...body] ("Retention Intent:" + sentence) or one sentence broken around bold/linked words
 * ("Pick the app based on your" + "budgeting style" + "(passive vs hands-on)."). Tell them apart.
 */
const continues = (s: string | undefined) => !!s && /^[a-z(,.;:!?)'"’”-]/.test(s.trim());

function joinInline(lines: string[]) {
  return lines.map((l, i) => {
    const text = l.trim();
    const space = i > 0 && !/^[,.;:!?)’”]/.test(text) ? " " : "";
    return (
      <Fragment key={i}>
        {space}
        {i % 2 === 1 ? <span className="text-foreground">{text}</span> : text}
      </Fragment>
    );
  });
}

export function ItemText({ lines, className }: { lines: string[]; className?: string }) {
  const [first, ...rest] = lines;
  if (!rest.length) return <span className={className}>{first}</span>;
  const titled = /:$/.test(first.trim()) || (/[.?!]$/.test(first.trim()) && !continues(rest[0])) || (!continues(rest[0]) && first.length <= 64 && !/[,;]$/.test(first));
  if (!titled) return <span className={className}>{joinInline(lines)}</span>;
  return (
    <span className={cn("flex flex-col gap-1", className)}>
      <span className="font-medium text-foreground">{first.replace(/:$/, "")}</span>
      <span className="text-muted-foreground">{rest.length > 1 && continues(rest[1]) ? joinInline(rest) : rest.join(" ")}</span>
    </span>
  );
}

export function DataTable({ block, className }: { block: Extract<Block, { t: "table" }>; className?: string }) {
  const cols = Math.max(block.head.length, block.rows[0]?.length ?? 0);
  return (
    <figure className={cn("overflow-hidden rounded-[var(--radius-tile)] bg-card", className)}>
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full text-left text-[0.8125rem]" style={{ minWidth: `${Math.min(cols * 9, 48)}rem` }}>
          {block.head.length > 0 && (
            <thead className="bg-raised/70">
              <tr>
                {block.head.map((h, i) => (
                  <th key={i} scope="col" className="px-5 py-3.5 align-bottom font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} className="transition-colors duration-300 even:bg-raised/25 hover:bg-raised/50">
                {r.map((c, j) => (
                  <td key={j} className={cn("px-5 py-3.5 align-top leading-relaxed tabular-nums", j === 0 ? "font-medium text-foreground" : "text-foreground/80")}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && <figcaption className="px-5 py-3.5 text-data text-muted-foreground">{block.caption}</figcaption>}
    </figure>
  );
}

/** "Answer: ...", "Context: ...", "Last reviewed: ..." → the label reads as a label. */
function Para({ text }: { text: string }) {
  const m = text.match(/^([A-Z][A-Za-z ]{1,22}):\s+([\s\S]+)$/);
  if (!m) return <p className="text-pretty">{text}</p>;
  return (
    <p className="text-pretty">
      <span className="font-medium text-foreground">{m[1]}:</span> {m[2]}
    </p>
  );
}

/** Long-form renderer used by articles and prose slices. Same type roles everywhere. */
export function Prose({ blocks, className }: { blocks: Block[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-5 text-[1rem] leading-[1.75] text-foreground/80", className)}>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h1":
          case "h2":
            return null;
          case "h3":
            return (
              <h3 key={i} className="mt-5 font-display text-title font-medium text-foreground text-balance">
                {b.text}
              </h3>
            );
          case "h4":
            return (
              <h4 key={i} className="mt-2 font-medium text-foreground">
                {b.text}
              </h4>
            );
          case "p":
            return <Para key={i} text={b.text} />;
          case "quote":
            return (
              <blockquote key={i} className="rounded-[var(--radius-tile)] bg-card px-6 py-5 font-display text-title font-medium text-foreground text-balance">
                {b.text}
              </blockquote>
            );
          case "list":
            return b.ordered ? (
              <ol key={i} className="flex flex-col gap-3">
                {b.items.map((it, k) => (
                  <li key={k} className="flex gap-4">
                    <span className="mt-[0.2rem] w-5 shrink-0 font-mono text-data leading-[1.75] text-subtle tabular-nums">{String(k + 1).padStart(2, "0")}</span>
                    <ItemText lines={it} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="flex flex-col gap-2.5">
                {b.items.map((it, k) => (
                  <li key={k} className="flex gap-3.5">
                    <span aria-hidden className="mt-[0.72em] size-1.5 shrink-0 rounded-full bg-subtle" />
                    <ItemText lines={it} />
                  </li>
                ))}
              </ul>
            );
          case "table":
            return <DataTable key={i} block={b} className="my-3" />;
          case "dl":
            return (
              <dl key={i} className="flex flex-col gap-2">
                {b.items.map((d, k) => (
                  <div key={k} className="rounded-[var(--radius)] bg-card px-5 py-4">
                    <dt className="font-medium text-foreground">{d.term}</dt>
                    <dd className="mt-1 text-[0.9375rem] text-muted-foreground">{d.def}</dd>
                  </div>
                ))}
              </dl>
            );
        }
      })}
    </div>
  );
}
