"use client";

import { useRef, type ReactNode } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Article motion budget: the hero entrance, the progress fill and the TOC pill. Nothing else in the body moves.
 * Hero parts carry [data-ar-hero] and `hideUntilReady`, so they never flash before this runs.
 */
export function ArticleHeroMotion({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const parts = gsap.utils.toArray<HTMLElement>("[data-ar-hero]", ref.current);
      if (!parts.length) return;
      const done = () => parts.forEach((p) => p.setAttribute("data-ar-done", ""));
      if (prefersReducedMotion()) return done();
      gsap.fromTo(
        parts,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: motion.dur.slow, ease: motion.ease, stagger: motion.stagger, delay: 0.15 }
      );
      // The tween now owns visibility; if it is ever reverted the parts stay visible.
      done();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
