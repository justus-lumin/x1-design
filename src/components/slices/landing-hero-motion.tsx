"use client";
// Client half of PageHero: the entrance timeline (same timing as the homepage hero) and the shader stage
// with its floating "On this page" card. Links scroll smoothly to their section and keep the URL hash.
import { useRef, type MouseEvent, type ReactNode } from "react";
import { GrainShader } from "@/components/brand/grain-shader";
import { Container } from "@/components/brand/primitives";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function HeroMotion({ className, children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current!;
      const ready = () => void (el.dataset.heroReady = "true");
      if (prefersReducedMotion()) return ready();
      const tl = gsap.timeline({ defaults: { ease: motion.ease } });
      tl.from("[data-hero-fade]", { autoAlpha: 0, y: 14, filter: "blur(6px)", duration: 1.1, stagger: 0.1, clearProps: "filter" }, 0.55);
      if (el.querySelector("[data-card]")) tl.from("[data-card]", { autoAlpha: 0, y: 48, duration: 1.5 }, 0.8);
      if (el.querySelector("[data-stage]") && !el.querySelector("[data-toc]")) tl.from("[data-stage]", { autoAlpha: 0, scale: 0.985, duration: 1.6 }, 0);
      if (el.querySelector("[data-toc]")) {
        tl.from("[data-stage]", { autoAlpha: 0, y: 80, duration: 1.6 }, 0.85)
          .from("[data-toc]", { autoAlpha: 0, y: 40, scale: 0.98, duration: 1.4 }, 1.15)
          .from("[data-toc-item]", { autoAlpha: 0, y: 10, duration: 0.9, stagger: 0.05 }, 1.45);
        // The card drifts a little slower than the page, so it floats over the field.
        gsap.fromTo(
          "[data-toc-float]",
          { yPercent: 6 },
          { yPercent: -6, ease: "none", scrollTrigger: { trigger: "[data-stage]", start: "top bottom", end: "bottom top", scrub: 0.8 } }
        );
      }
      ready();
    },
    { scope: root }
  );
  return (
    <div ref={root} data-hero className={className}>
      {children}
    </div>
  );
}

/** Anchor that smooth-scrolls to its section and keeps the hash. */
export function TocLink({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <a href={`#${id}`} onClick={(e) => scrollToId(e, id)} className={className}>
      {children}
    </a>
  );
}

function scrollToId(e: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

export function HeroStage({ items }: { items: { id: string; label: string }[] }) {
  const go = scrollToId;
  const wide = items.length > 6;
  return (
    <Container className="mt-16 md:mt-24">
      <div
        data-stage
        className="relative isolate flex justify-center overflow-hidden rounded-[var(--radius-tile)] px-3 py-10 sm:px-6 md:py-24"
      >
        <GrainShader angle={20} light={0.55} folds={0.75} interactive />
        <div data-toc-float className={cn("relative w-full", wide ? "max-w-3xl" : "max-w-xl")}>
          <nav
            data-toc
            aria-label="On this page"
            className="rounded-[var(--radius-tile)] bg-background/85 p-3 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)] backdrop-blur-xl sm:p-4 md:p-5"
          >
            <p className="flex items-baseline justify-between px-3 pt-2 pb-3 text-data text-muted-foreground">
              <span>On this page</span>
              <span className="font-mono text-subtle">{String(items.length).padStart(2, "0")}</span>
            </p>
            <ol className={cn("grid grid-cols-1 gap-0.5", wide && "md:grid-cols-2 md:gap-x-2")}>
              {items.map((it, i) => (
                <li key={it.id} data-toc-item>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => go(e, it.id)}
                    className="group flex min-h-11 items-baseline gap-4 rounded-[var(--radius-control)] px-3 py-2.5 text-[0.9375rem] leading-snug transition-colors duration-300 hover:bg-card"
                  >
                    <span className="w-5 shrink-0 font-mono text-data text-subtle transition-colors duration-300 group-hover:text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-foreground/85 transition-colors duration-300 group-hover:text-foreground">{it.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </Container>
  );
}
