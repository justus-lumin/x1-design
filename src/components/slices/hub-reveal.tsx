"use client";

import type { RefObject } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * Elements marked [data-hub-pending] stay hidden until the hero entrance reveals them, so nothing
 * flashes before it runs. Only applies when JS is on (.js on <html>) and motion is allowed.
 */
export function HubRevealStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: ".js [data-hub-pending]:not([data-hub-done]){visibility:hidden}@media (prefers-reduced-motion: reduce){.js [data-hub-pending]{visibility:visible}}",
      }}
    />
  );
}

/**
 * Hero entrance, the one load moment on a hub: [data-hub-pending] children fade, rise and un-blur in
 * document order. Pass `extra` to chain one more beat onto the same timeline.
 */
export function useHubEntrance(scope: RefObject<HTMLElement | null>, extra?: (tl: gsap.core.Timeline, el: HTMLElement) => void) {
  useGSAP(
    () => {
      const el = scope.current;
      if (!el) return;
      const items = el.querySelectorAll("[data-hub-pending]");
      const done = () => items.forEach((i) => i.setAttribute("data-hub-done", ""));
      if (prefersReducedMotion()) return done();
      const tl = gsap.timeline({ defaults: { ease: motion.ease }, delay: 0.35 });
      tl.fromTo(
        items,
        { autoAlpha: 0, y: 14, filter: "blur(6px)" },
        { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1, stagger: 0.09, clearProps: "filter" }
      );
      extra?.(tl, el);
      // The timeline now owns visibility; a revert can never leave these hidden.
      done();
    },
    { scope }
  );
}
