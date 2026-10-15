import { cn } from "@/lib/utils";
import { X1_MARK_PATHS, X1_MARK_VIEWBOX } from "./logo-paths";

// The X1 mark. Always currentColor so it follows the surface it sits on.
export function X1Mark({ className, title = "X1" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={X1_MARK_VIEWBOX} fill="currentColor" role="img" aria-label={title} className={cn("h-6 w-auto", className)}>
      {X1_MARK_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// Lockup: mark + "Wealth" set in the display face. Used only where the brand needs naming (footer, hero card).
export function X1Lockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-[0.35em]", className)}>
      <X1Mark className="h-[1em] w-auto" />
      <span className="font-display text-[0.22em] font-medium tracking-[0.02em]">Wealth</span>
    </span>
  );
}
