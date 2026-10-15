"use client";
// Motion for the data slices is deliberately scarce: one count-up per page (the first stats block), nothing else.
import { useRef } from "react";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const NUM = /^(\D{0,12}?)(\d[\d,]*(?:\.\d+)?)(\D*)$/;

/**
 * A display figure that counts up once when it scrolls into view, then settles on the exact source string.
 * Only simple figures animate ("$124 Trillion", "8,030", "41%", "~$5.8T"); ranges and ratios stay static.
 * Server HTML always carries the exact source string.
 */
export function CountUp({ value, className, animate = true }: { value: string; className?: string; animate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const m = value.match(NUM);

  useGSAP(
    () => {
      const el = ref.current;
      if (!animate || !el || !m || prefersReducedMotion()) return;
      const [, pre, num, post] = m;
      const target = parseFloat(num.replace(/,/g, ""));
      if (!isFinite(target) || target === 0) return;
      const decimals = (num.split(".")[1] ?? "").length;
      const grouped = num.includes(",");
      const fmt = (v: number) =>
        pre + v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: grouped }) + post;
      const o = { v: 0 };
      gsap.to(o, {
        v: target,
        duration: motion.dur.slow * 1.3,
        ease: motion.ease,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () => {
            el.textContent = fmt(0);
          },
        },
        onUpdate: () => {
          el.textContent = fmt(o.v);
        },
        onComplete: () => {
          el.textContent = value;
        },
      });
    },
    { scope: ref }
  );

  // A hidden copy reserves the final width, so counting never shifts the layout.
  return (
    <span className={cn("relative inline-grid whitespace-nowrap tabular-nums", className)}>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span ref={ref} className="col-start-1 row-start-1">
        {value}
      </span>
    </span>
  );
}
