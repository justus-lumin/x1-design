"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { afterFonts, gsap, motion, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Display headline that rises line by line out of a mask. */
export function SplitHeading({
  as: Comp = "h2",
  children,
  className,
  start = "top 85%",
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  start?: string;
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
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit(self) {
              return gsap.from(self.lines, {
                yPercent: 105,
                duration: motion.dur.slow,
                ease: motion.ease,
                stagger: 0.09,
                delay,
                scrollTrigger: start === "load" ? undefined : { trigger: el, start, once: true },
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
