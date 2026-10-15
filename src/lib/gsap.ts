"use client";
// Single place GSAP plugins are registered. Import gsap from here, never from "gsap" directly.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP);

// Motion tokens. Mirror of --ease-out / durations in globals.css and tokens.json.
export const motion = {
  ease: "expo.out",
  easeInOut: "power3.inOut",
  dur: { fast: 0.45, base: 0.9, slow: 1.4 },
  stagger: 0.08,
  distance: 28,
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Run `fn` once web fonts are ready, or after `timeout` ms, whichever comes first.
 * Returns a cancel function for effect cleanup. Never waits forever.
 */
export function afterFonts(fn: () => void, timeout = 700) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    clearTimeout(t);
    fn();
  };
  const t = setTimeout(run, timeout);
  if (typeof document !== "undefined" && document.fonts?.ready) document.fonts.ready.then(run, run);
  else run();
  return () => {
    done = true;
    clearTimeout(t);
  };
}

export { gsap, Flip, ScrollTrigger, SplitText, useGSAP };
