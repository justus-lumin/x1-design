"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { afterFonts, gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Hero headline: characters resolve out of a soft blur, left to right, like a lens finding focus. */
export function BlurHeading({
  as: Comp = "h1",
  children,
  className,
  delay = 0.2,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el) return;
      const ready = () => void (el.dataset.splitReady = "true");
      if (prefersReducedMotion() || !contextSafe) return ready();
      // Split inside the GSAP context so a re-mount reverts it cleanly (no double split, no orphaned hidden text).
      const split = contextSafe(() => {
        try {
          SplitText.create(el, {
            type: "words,chars",
            charsClass: "split-char",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.chars, {
                autoAlpha: 0,
                filter: "blur(14px)",
                yPercent: 30,
                scale: 1.08,
                duration: 1.4,
                ease: "expo.out",
                stagger: { each: 0.025, from: "start" },
                delay,
                clearProps: "filter",
              });
            },
          });
        } finally {
          ready();
        }
      });
      return afterFonts(split);
    },
    { scope: ref },
  );
  return (
    <Comp ref={ref} data-split className={cn("text-balance", className)}>
      {children}
    </Comp>
  );
}
