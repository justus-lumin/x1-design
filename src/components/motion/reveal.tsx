"use client";

import { useRef, type ElementType, type ComponentPropsWithoutRef } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Animate direct children marked [data-reveal] in sequence; otherwise the element itself. */
  stagger?: number;
  delay?: number;
  y?: number;
  /** ScrollTrigger start. "load" animates immediately (hero). */
  start?: string;
} & ComponentPropsWithoutRef<T>;

/** Fade-and-rise entrance. Wrap any block; mark sequenced children with data-reveal. */
export function Reveal<T extends ElementType = "div">({
  as,
  stagger = motion.stagger,
  delay = 0,
  y = motion.distance,
  start = "top 85%",
  children,
  ...rest
}: RevealProps<T>) {
  const Comp = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const items = ref.current.querySelectorAll(":scope [data-reveal]");
      const targets = items.length ? items : [ref.current];
      gsap.from(targets, {
        autoAlpha: 0,
        y,
        duration: motion.dur.base,
        ease: motion.ease,
        stagger,
        delay,
        scrollTrigger: start === "load" ? undefined : { trigger: ref.current, start, once: true },
      });
    },
    { scope: ref }
  );

  return (
    <Comp ref={ref} {...rest}>
      {children}
    </Comp>
  );
}
