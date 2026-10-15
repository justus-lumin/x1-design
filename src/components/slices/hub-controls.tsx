"use client";
// Search field, topic chips and the empty state shared by the filterable hubs.
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Topic = { key: string; label: string; count: number };

export function HubSearch({ value, onChange, label, className }: { value: string; onChange: (v: string) => void; label: string; className?: string }) {
  return (
    <label className={cn("group relative block w-full", className)}>
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" strokeWidth={1.75} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="h-12 w-full rounded-full bg-card pr-11 pl-11 text-[0.9375rem] outline-none transition-[background-color,box-shadow] duration-300 placeholder:text-muted-foreground hover:bg-raised focus-visible:bg-raised focus-visible:ring-4 focus-visible:ring-ring/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </label>
  );
}

/** Pill chips. `stack` lays them out as a vertical list from lg up (sticky sidebar). */
export function HubChips({
  topics,
  total,
  value,
  onChange,
  stack = false,
  className,
}: {
  topics: Topic[];
  total: number;
  value: string;
  onChange: (k: string) => void;
  stack?: boolean;
  className?: string;
}) {
  return (
    <div role="group" aria-label="Filter by topic" className={cn("flex flex-wrap gap-1.5", stack && "lg:flex-col lg:flex-nowrap lg:gap-0.5", className)}>
      {[{ key: "all", label: "All", count: total }, ...topics].map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-300 ease-[var(--ease-out)] outline-none focus-visible:ring-4 focus-visible:ring-ring/25",
              stack && "lg:h-9 lg:justify-between lg:rounded-[var(--radius-control)] lg:px-3",
              active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-raised hover:text-foreground",
              stack && !active && "lg:bg-transparent lg:hover:bg-card"
            )}
          >
            {t.label}
            <span className={cn("font-mono text-data tabular-nums", active ? "opacity-60" : "text-subtle")}>{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HubEmpty({ shown, total, onReset }: { shown: number; total: number; onReset: () => void }) {
  return (
    <div aria-live="polite" className="mt-8 flex min-h-10 items-center justify-center gap-3 text-sm text-muted-foreground">
      {shown === 0 ? (
        <>
          <span>Nothing matches that yet.</span>
          <button type="button" onClick={onReset} className="h-10 rounded-full bg-card px-4 text-foreground transition-colors hover:bg-raised">
            Clear filters
          </button>
        </>
      ) : (
        shown < total && (
          <span className="font-mono text-data text-subtle">
            {shown} of {total}
          </span>
        )
      )}
    </div>
  );
}
