"use client";
// Client helpers for /design-system: values read live from CSS custom properties, the section nav, the grid overlay.
import { useEffect, useRef, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Re-runs `read` now and whenever the theme class on <html> flips. */
function useThemeEffect(read: () => void) {
  useEffect(() => {
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", read);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", read);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** The computed value of a custom property, read from the element's own scope (so light/dark scopes differ). */
export function LiveValue({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");
  useThemeEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).getPropertyValue(name).trim().toLowerCase());
  });
  return (
    <span ref={ref} className={cn("font-mono text-data tabular-nums", className)}>
      {value || " "}
    </span>
  );
}

/** Measures a length token (clamp() etc.) at the current viewport by applying it to a probe. */
export function MeasuredVar({ name, className }: { name: string; className?: string }) {
  const probe = useRef<HTMLSpanElement>(null);
  const [px, setPx] = useState<number | null>(null);
  useThemeEffect(() => {
    if (probe.current) setPx(Math.round(probe.current.getBoundingClientRect().width));
  });
  return (
    <span className={cn("relative inline-block overflow-hidden align-baseline font-mono text-data tabular-nums", className)}>
      <span ref={probe} aria-hidden className="pointer-events-none invisible absolute top-0 left-0 h-px" style={{ width: `var(${name})` }} />
      {px === null ? " " : `${px}px`}
    </span>
  );
}

/** Sticky in-page navigation with the active section highlighted. */
export function DsNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="Design system sections" className="sticky top-24 flex flex-col gap-0.5">
      {items.map((i, k) => (
        <a
          key={i.id}
          href={`#${i.id}`}
          className={cn(
            "flex items-baseline gap-3 rounded-[var(--radius-control)] px-3 py-1.5 text-[0.8125rem] transition-colors",
            active === i.id ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="font-mono text-data text-subtle">{String(k + 1).padStart(2, "0")}</span>
          {i.label}
        </a>
      ))}
    </nav>
  );
}

/** Toggles a fixed 12-column overlay (4 columns under 768px) over the whole page. */
export function GridOverlayToggle() {
  const [on, setOn] = useState(false);
  return (
    <>
      <Button variant={on ? "default" : "secondary"} onClick={() => setOn((v) => !v)} aria-pressed={on}>
        <Grid3x3 />
        {on ? "Hide grid overlay" : "Show grid overlay"}
      </Button>
      {on && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40">
          <div className="container-x1 h-full">
            <div className="grid-12 h-full">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={cn("h-full bg-primary/[0.06]", i >= 4 && "hidden md:block")} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
