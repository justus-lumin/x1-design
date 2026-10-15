"use client";
// Minimal tabs for the ranked slice. Every panel is in the HTML (inactive ones are hidden), so nothing is lost to crawlers.
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DataTabs({ tabs, className }: { tabs: { label: ReactNode; n: string; panel: ReactNode }[]; className?: string }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = (active + d + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div role="tablist" aria-orientation="horizontal" onKeyDown={onKey} className="flex flex-wrap gap-1.5 rounded-[var(--radius-tile)] bg-card p-1.5">
        {tabs.map((t, i) => (
          <button
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`${id}-t${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-p${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "flex min-h-10 items-center gap-2.5 rounded-[var(--radius)] px-3.5 text-left text-[0.875rem] transition-colors duration-300",
              active === i ? "bg-raised text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="font-mono text-[0.6875rem] text-subtle tabular-nums">{t.n}</span>
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={i} role="tabpanel" id={`${id}-p${i}`} aria-labelledby={`${id}-t${i}`} hidden={active !== i} className="pt-8">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
