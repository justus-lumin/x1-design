// Statistic lists, three looks so a page never repeats itself:
//   strip  key-figure strip on one tone band (2 to 4 figures)
//   hero   one large lead figure with supporting figures beside it
//   ledger two-column figure / claim rows
// Each figure gets one short line; citations move out of the sentence into small mono text.
import { statFigure, type StatFigure } from "@/lib/content";
import { cn } from "@/lib/utils";
import { CountUp } from "./data-motion";

export type StatVariant = "strip" | "hero" | "ledger";

type Stat = { s: StatFigure | null; lines: string[]; line: string; cite?: string };

/** Splits a trailing "(Deloitte 2024)" style citation off the caption. */
function prepare(lines: string[]): Stat {
  const s = statFigure(lines);
  let line = s ? (s.before ? `${s.before} ${s.figure} ${s.after}` : s.after) : lines.join(" ");
  line = line.replace(/\s+/g, " ").trim();
  let cite: string | undefined;
  const m = line.match(/^(.*?)[\s,]*\(([^()]{3,80})\)\.?$/);
  if (m && /\d{4}|[A-Z]/.test(m[2])) {
    line = m[1];
    cite = m[2];
  }
  return { s, lines, line, cite };
}

export function pickStatVariant(items: string[][], ordinal: number, layout: "full" | "article"): StatVariant {
  const stats = items.map(prepare);
  const allStats = stats.every((x) => x.s);
  const n = items.length;
  const order: StatVariant[] = ["strip", "hero", "ledger"];
  let v = order[ordinal % 3];
  if (v === "strip" && (!allStats || n > 4 || n < 2)) v = n >= 3 && stats[0].s ? "hero" : "ledger";
  if (v === "hero" && (n < 3 || !stats[0].s)) v = "ledger";
  if (layout === "article" && v === "strip" && n === 3) v = "ledger";
  return v;
}

function Cite({ children }: { children?: string }) {
  if (!children) return null;
  return <span className="mt-2 block font-mono text-[0.6875rem] leading-snug text-subtle">{children}</span>;
}

export function StatGrid({
  items,
  layout = "full",
  variant,
  animate = false,
  className,
}: {
  items: string[][];
  layout?: "full" | "article";
  variant: StatVariant;
  /** Count up the figures. Only the first stats block on a page should. */
  animate?: boolean;
  className?: string;
}) {
  const stats = items.map(prepare);
  const full = layout === "full";

  if (variant === "strip") {
    const n = stats.length;
    return (
      <ul
        className={cn(
          "grid grid-cols-1 gap-x-8 gap-y-8 rounded-[var(--radius-tile)] bg-card p-6 sm:grid-cols-2 sm:p-8",
          full && n >= 3 && (n === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"),
          full && "md:p-10",
          className
        )}
      >
        {stats.map((x, i) => (
          <li key={i} className="flex min-w-0 flex-col">
            {x.s?.label && <span className="mb-3 text-data text-muted-foreground">{x.s.label}</span>}
            <CountUp
              animate={animate}
              value={x.s!.figure}
              className={cn("font-display font-medium leading-none tracking-[-0.04em]", full ? "text-[clamp(2.25rem,3.2vw,2.875rem)]" : "text-[2.25rem]")}
            />
            {x.line && <span className="mt-3 text-[0.875rem] leading-snug text-muted-foreground text-pretty">{x.line}</span>}
            <Cite>{x.cite}</Cite>
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "hero") {
    const [lead, ...rest] = stats;
    return (
      <div className={cn("grid-12 gap-y-10", className)}>
        <div className={cn("col-span-4 flex flex-col", full ? "md:col-span-5" : "md:col-span-12")}>
          {lead.s?.label && <span className="mb-4 text-data text-muted-foreground">{lead.s.label}</span>}
          <CountUp
            animate={animate}
            value={lead.s!.figure}
            className={cn("font-display font-medium leading-[0.9] tracking-[-0.05em]", full ? "text-[clamp(3.25rem,6vw,5.5rem)]" : "text-[clamp(3rem,10vw,4.25rem)]")}
          />
          {lead.line && <p className="mt-5 max-w-sm text-lede text-muted-foreground text-pretty">{lead.line}</p>}
          <Cite>{lead.cite}</Cite>
        </div>
        <ul className={cn("col-span-4 flex flex-col gap-2", full ? "md:col-span-6 md:col-start-7" : "md:col-span-12")}>
          {rest.map((x, i) => (
            <li key={i} className="flex flex-col gap-1.5 rounded-[var(--radius)] bg-card px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5">
              {x.s ? (
                <span className="shrink-0 font-display text-[1.375rem] font-medium leading-none tracking-[-0.03em] whitespace-nowrap tabular-nums sm:min-w-32 sm:text-[1.5rem]">
                  {x.s.figure}
                </span>
              ) : null}
              <span className="min-w-0 text-[0.875rem] leading-snug text-muted-foreground text-pretty">
                {x.s?.label && <span className="text-foreground">{x.line ? `${x.s.label}. ` : x.s.label}</span>}
                {x.line}
                <Cite>{x.cite}</Cite>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // ledger
  return (
    <ul className={cn("flex flex-col", className)}>
      {stats.map((x, i) => (
        <li
          key={i}
          className={cn(
            "grid grid-cols-1 gap-x-8 gap-y-2 rounded-[var(--radius)] px-5 py-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-baseline",
            i % 2 === 0 ? "bg-card" : "bg-transparent"
          )}
        >
          {x.s ? (
            <CountUp
              animate={animate}
              value={x.s.figure}
              className="font-display text-[1.75rem] font-medium leading-none tracking-[-0.035em] sm:text-[2rem]"
            />
          ) : (
            <span className="hidden sm:block" />
          )}
          <span className="min-w-0 text-[0.9375rem] leading-relaxed text-muted-foreground text-pretty">
            {x.s?.label && <span className="text-foreground">{x.line ? `${x.s.label}. ` : x.s.label}</span>}
            {x.line}
            <Cite>{x.cite}</Cite>
          </span>
        </li>
      ))}
    </ul>
  );
}
