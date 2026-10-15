"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** A thin fill across the top of the viewport that tracks reading through the article body. */
export function ArticleProgress({ target }: { target: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = document.getElementById(target);
    if (!el || !ref.current) return;
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 30%", end: "bottom bottom", scrub: 0.3 } }
    );
  });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div ref={ref} className="h-full origin-left scale-x-0 bg-foreground/70" />
    </div>
  );
}
