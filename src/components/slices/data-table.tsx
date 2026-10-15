"use client";
// Borderless data tables, static by design. Three looks, picked by content and position on the page:
//   bars   a two-column "label / single-unit number" table drawn as proportional bars
//   banded tone-banded rows on the page background
//   tile   the whole table on one tone tile with a raised header row
// Sticky first column while scrolling sideways, right-aligned tabular numbers, the X1 row or column picked out by tone.
// Tables with three or more columns reflow into stacked cards on phones.
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import { barValues, isX1, numericColumns, type TableBlock, type TableVariant } from "./data-table-utils";

export type { TableVariant };

export function DataTable({
  block,
  title,
  caption,
  source,
  layout = "full",
  variant = "banded",
  className,
}: {
  block: TableBlock;
  title?: string;
  caption?: string;
  source?: string;
  layout?: "full" | "article";
  variant?: TableVariant;
  className?: string;
}) {
  const note = [block.caption, source].filter(Boolean).join(" ");
  const bars = variant === "bars" ? barValues(block) : null;

  return (
    <figure className={cn("flex flex-col", className)}>
      {(title || caption) && (
        <figcaption className="mb-5 flex flex-col gap-1">
          {title && <span className="font-display text-title font-medium text-foreground text-balance">{title}</span>}
          {caption && <span className="text-[0.9375rem] text-muted-foreground text-pretty">{caption}</span>}
        </figcaption>
      )}
      {bars ? <Bars block={block} values={bars} /> : <Grid block={block} layout={layout} variant={variant === "tile" ? "tile" : "banded"} />}
      {note && <p className="mt-4 px-1 font-mono text-[0.6875rem] leading-relaxed text-subtle text-pretty sm:px-5">{note}</p>}
    </figure>
  );
}

function Bars({ block, values }: { block: TableBlock; values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex flex-col gap-1 rounded-[var(--radius-tile)] bg-card p-3 sm:p-4">
      {block.head.length === 2 && (
        <div className="flex justify-between gap-4 px-3 pt-1 pb-2 text-data text-muted-foreground">
          <span>{block.head[0]}</span>
          <span>{block.head[1]}</span>
        </div>
      )}
      <ol className="flex flex-col gap-1">
        {block.rows.map((r, i) => {
          const x1 = isX1(r[0]);
          return (
            <li key={i} className={cn("rounded-[var(--radius)] px-3 py-2.5 transition-colors duration-300 hover:bg-raised/60", x1 && "bg-raised")}>
              <div className="flex items-baseline justify-between gap-4">
                <span className={cn("min-w-0 text-[0.875rem] text-pretty", x1 ? "text-foreground" : "text-foreground/85")}>{r[0]}</span>
                <span className="shrink-0 text-[0.875rem] font-medium tabular-nums">{r[1]}</span>
              </div>
              <div aria-hidden className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
                <div className="h-full rounded-full bg-foreground/60" style={{ width: `${Math.max((values[i] / max) * 100, 1.5)}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Grid({ block, layout, variant }: { block: TableBlock; layout: "full" | "article"; variant: "banded" | "tile" }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);
  const numeric = numericColumns(block.head, block.rows);
  const cols = numeric.length;
  const x1Col = block.head.findIndex((h, j) => j > 0 && isX1(h));
  const hasHead = block.head.length > 0;
  const stack = hasHead && cols >= 3;
  const tile = variant === "tile";
  const surface = tile ? "bg-card" : "bg-background";

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => setFade(el.scrollWidth - el.clientWidth - el.scrollLeft > 4);
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const minW = `${Math.max(cols * (layout === "article" ? 8.5 : 10), 20)}rem`;

  return (
    <>
      {stack && <MobileCards block={block} numeric={numeric} x1Col={x1Col} />}
      <div className={cn("relative", tile && "rounded-[var(--radius-tile)] bg-card p-2", stack && "hidden sm:block")}>
        <div
          ref={scroller}
          className="overflow-x-auto overscroll-x-contain rounded-[var(--radius)] [scrollbar-width:thin]"
          tabIndex={0}
          role="region"
          aria-label={block.head.join(", ") || "Data table"}
        >
          <table className="w-full border-separate border-spacing-0 text-left text-[0.875rem]" style={{ minWidth: minW }}>
            {hasHead && (
              <thead>
                <tr>
                  {block.head.map((h, j) => (
                    <th
                      key={j}
                      scope="col"
                      className={cn(
                        "px-4 align-bottom text-data font-medium text-muted-foreground first:pl-5 last:pr-5",
                        tile ? "bg-raised py-3 first:rounded-l-[var(--radius)] last:rounded-r-[var(--radius)]" : "pt-1 pb-3",
                        j === 0 && cn("sticky left-0 z-10", tile ? "bg-raised" : surface),
                        numeric[j] && "text-right",
                        numeric[j] && h.length <= 18 && "whitespace-nowrap",
                        j === x1Col && "bg-raised text-foreground",
                        j === x1Col && !tile && "rounded-t-[var(--radius)] pt-3"
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {block.rows.map((r, i) => {
                const x1Row = isX1(r[0] ?? "");
                const band = !tile && i % 2 === 0;
                const last = i === block.rows.length - 1;
                return (
                  <tr key={i} className="group">
                    {Array.from({ length: cols }, (_, j) => {
                      const tone = x1Row || j === x1Col ? "bg-raised" : band ? "bg-card" : surface;
                      return (
                        <td
                          key={j}
                          className={cn(
                            "px-4 align-top leading-relaxed transition-colors duration-300 first:pl-5 last:pr-5",
                            tile ? "py-3" : "py-3.5",
                            tone,
                            !x1Row && j !== x1Col && (tile ? "group-hover:bg-raised/50" : "group-hover:bg-raised/60"),
                            "first:rounded-l-[var(--radius)] last:rounded-r-[var(--radius)]",
                            j === x1Col && "rounded-none! group-hover:bg-raised",
                            j === x1Col && last && "rounded-b-[var(--radius)]!",
                            j === 0 && "sticky left-0 z-10 min-w-[9rem] max-w-[16rem] font-medium text-foreground",
                            j > 0 && "text-foreground/75",
                            (x1Row || j === x1Col) && "text-foreground",
                            numeric[j] && "text-right tabular-nums whitespace-nowrap"
                          )}
                          style={j === 0 ? undefined : { minWidth: numeric[j] ? "6rem" : "10rem" }}
                        >
                          {r[j] ?? ""}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-l to-transparent transition-opacity duration-500",
            tile ? "right-2 from-card" : "right-0 from-background",
            fade ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
    </>
  );
}

/** Phone layout: one card per row, the first cell as its title, then label/value pairs. */
function MobileCards({ block, numeric, x1Col }: { block: TableBlock; numeric: boolean[]; x1Col: number }) {
  return (
    <ul className="flex flex-col gap-2 sm:hidden">
      {block.rows.map((r, i) => {
        const x1Row = isX1(r[0] ?? "");
        return (
          <li key={i} className={cn("rounded-[var(--radius-tile)] p-5", x1Row ? "bg-raised" : "bg-card")}>
            <p className="font-medium text-foreground text-pretty">{r[0]}</p>
            <dl className="mt-3 flex flex-col gap-3">
              {block.head.slice(1).map((h, k) => {
                const j = k + 1;
                const v = r[j] ?? "";
                if (!v.trim()) return null;
                return numeric[j] ? (
                  <div key={j} className="flex items-baseline justify-between gap-4">
                    <dt className="min-w-0 text-[0.8125rem] text-muted-foreground">{h}</dt>
                    <dd className={cn("shrink-0 text-[0.9375rem] tabular-nums", j === x1Col ? "font-medium text-foreground" : "text-foreground/85")}>{v}</dd>
                  </div>
                ) : (
                  <div key={j} className={cn("flex flex-col gap-0.5", j === x1Col && "-mx-2 rounded-[var(--radius)] bg-raised px-2 py-1.5")}>
                    <dt className="text-[0.8125rem] text-muted-foreground">{h}</dt>
                    <dd className="text-[0.9375rem] leading-relaxed text-foreground/85 text-pretty">{v}</dd>
                  </div>
                );
              })}
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
