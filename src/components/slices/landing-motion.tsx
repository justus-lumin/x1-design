"use client";
// Motion wrappers for the landing slices. Same vocabulary as the homepage: expo.out, 0.9 to 1.4s,
// small distances, once-only entrances, scrubbed fills for reading progress. All of it skips for reduced motion.
//
// Flash control: anything marked [data-lm] is hidden by the stylesheet below until its wrapper has run,
// so content never shows, vanishes and then animates in. Reduced motion and no-JS both show it immediately.
import { useRef, useState, type ElementType, type ReactNode } from "react";
import { afterFonts, gsap, motion, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";


type Kind = "rise" | "wipe" | "scale";

/**
 * Entrance for a group of items. Children marked data-lm-item animate in sequence when the wrapper
 * scrolls into view. "rise" = fade and rise, "wipe" = clip-path reveal from below (tiles), "scale" = soft settle.
 */
export function Enter({
  as,
  kind = "rise",
  stagger = motion.stagger,
  start = "top 82%",
  delay = 0,
  targets,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  kind?: Kind;
  /** Animate these descendants instead of [data-lm-item] (they are still hidden via their data-lm-item ancestor). */
  targets?: string;
  stagger?: number;
  start?: string;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const Comp = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const done = () => void (el.dataset.lmReady = "true");
      if (prefersReducedMotion()) return done();
      const items = el.querySelectorAll<HTMLElement>(targets ?? "[data-lm-item]");
      if (!items.length) return done();
      const from: gsap.TweenVars =
        kind === "wipe"
          ? { clipPath: "inset(100% 0% 0% 0% round var(--radius))", y: 32 }
          : kind === "scale"
            ? { autoAlpha: 0, scale: 0.96, y: 18 }
            : { autoAlpha: 0, y: motion.distance };
      const to: gsap.TweenVars =
        kind === "wipe"
          ? { clipPath: "inset(0% 0% 0% 0% round var(--radius))", y: 0, clearProps: "clipPath,transform" }
          : { autoAlpha: 1, scale: 1, y: 0, clearProps: "transform" };
      gsap.set(items, from);
      done();
      gsap.to(items, {
        ...to,
        duration: kind === "wipe" ? 1.3 : motion.dur.base + 0.2,
        ease: motion.ease,
        stagger,
        delay,
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref }
  );
  return (
    <Comp ref={ref} data-lm="" className={className} {...rest}>
      {children}
    </Comp>
  );
}

/** A display line whose words ink in from muted to full as you read it. Keeps the real heading tag. */
export function ScrubLine({ as: Comp = "h2", children, className }: { as?: ElementType; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || prefersReducedMotion() || !contextSafe) return;
      // Inside the GSAP context, with a font timeout: a re-mount reverts it cleanly.
      return afterFonts(contextSafe(() => {
        SplitText.create(el, {
          type: "words",
          autoSplit: true,
          onSplit(self) {
            return gsap.fromTo(
              self.words,
              { opacity: 0.14 },
              { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.6 } }
            );
          },
        });
      }));
    },
    { scope: ref }
  );
  return (
    <Comp ref={ref} className={cn("text-balance", className)}>
      {children}
    </Comp>
  );
}

/**
 * Vertical tabs: titles on the left (cols 1-5), one panel on the right. On phones the titles become a
 * swipeable row of chips above the panel. The panel swaps with a short cross-fade, nothing more.
 */
export function VerticalTabs({ items }: { items: { title: string; body: ReactNode }[] }) {
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const select = (i: number) => {
    if (i === active) return;
    setActive(i);
    if (panel.current && !prefersReducedMotion()) gsap.fromTo(panel.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: motion.ease });
  };
  return (
    <div className="grid-12 gap-y-6">
      <div
        role="tablist"
        aria-orientation="vertical"
        className="col-span-4 -mx-[var(--gutter)] flex snap-x scroll-px-[var(--gutter)] gap-2 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] md:col-span-5 md:mx-0 md:flex-col md:gap-0.5 md:overflow-visible md:px-0"
      >
        {items.map((it, i) => (
          <button
            key={it.title}
            role="tab"
            type="button"
            aria-selected={i === active}
            onClick={() => select(i)}
            className={cn(
              "group flex min-h-11 shrink-0 snap-start items-baseline gap-4 rounded-[var(--radius-control)] px-4 py-3 text-left text-[0.9375rem] transition-colors duration-300 md:shrink md:px-4 md:py-3.5",
              i === active ? "bg-card text-foreground" : "bg-card/50 text-muted-foreground hover:text-foreground md:bg-transparent md:hover:bg-card/60"
            )}
          >
            <span className="hidden font-mono text-data text-subtle md:inline">{String(i + 1).padStart(2, "0")}</span>
            <span className="whitespace-nowrap md:whitespace-normal">{it.title}</span>
          </button>
        ))}
      </div>
      <div className="col-span-4 md:col-span-7 md:col-start-6">
        <div ref={panel} role="tabpanel" className="min-h-full rounded-[var(--radius-tile)] bg-card p-6 md:p-10">
          <p className="font-display text-title font-medium">{items[active].title}</p>
          <div className="mt-4">{items[active].body}</div>
        </div>
      </div>
    </div>
  );
}
