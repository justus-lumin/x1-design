"use client";

import { useRef } from "react";
import { Container, SectionHeading } from "@/components/brand/primitives";
import { gsap, prefersReducedMotion, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const jobs = [
  { k: "Intake", t: "Someone reads each document when it arrives.", d: "X1 reads it and files it under the business, trust, property or person it belongs to." },
  { k: "Deadlines", t: "Someone owns the calendar.", d: "The next 90 days, what each item touches, and what's still missing." },
  { k: "Counsel", t: "Someone knows what Article IV says.", d: "Ask your record. The answer cites the page and the clause." },
  { k: "Review", t: "Someone notices when documents disagree.", d: "A K-1 against the operating agreement. A deed against the policy." },
];

/** The "someone" slice: family-office roles made concrete, as a calm grid of jobs. */
export function Someone() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-job]", {
        clipPath: "inset(100% 0% 0% 0% round var(--radius))",
        y: 30,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: "[data-jobs]", start: "top 80%", once: true },
      });

      // The closing line scrambles into place.
      const big = root.current!.querySelector<HTMLElement>("[data-big]")!;
      const split = SplitText.create(big, { type: "chars" });
      const glyphs = "X1#%/-_=+<>";
      split.chars.forEach((c, i) => {
        const final = c.textContent ?? "";
        if (final.trim() === "") return;
        gsap.fromTo(
          c,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.9,
            delay: 0.4 + i * 0.03,
            ease: "none",
            scrollTrigger: { trigger: big, start: "top 85%", once: true },
            onUpdate() {
              c.textContent = this.progress() < 0.85 ? glyphs[Math.floor(Math.random() * glyphs.length)] : final;
            },
            onComplete: () => void (c.textContent = final),
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="section-y">
      <Container>
        <SectionHeading
          title="Less remembering. More deciding."
          lede="A family can have the work of a family office long before it has the staff. X1 takes the parts that don't need a person."
        />
        <div data-jobs className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-2 md:mt-20 md:grid-cols-3">
          {jobs.map((j, i) => (
            <div key={j.k} data-job className={cn("rounded-[var(--radius)] bg-card p-6", i === 3 && "md:col-span-1")}>
              <p className="text-data text-muted-foreground">{j.k}</p>
              <p className="mt-3 font-medium tracking-tight">{j.t}</p>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{j.d}</p>
            </div>
          ))}
          <div data-job className="flex flex-col justify-between gap-6 rounded-[var(--radius)] bg-card p-6 md:col-span-2 md:flex-row md:items-center">
            <div>
              <p className="text-data text-muted-foreground">As it adds up</p>
              <p className="mt-3 font-medium tracking-tight">Someone remembers why you decided.</p>
              <p className="mt-2 text-[0.8125rem] text-muted-foreground">Decisions keep their reasons, so the next advisor doesn&rsquo;t start from zero.</p>
            </div>
            <p data-big className="font-display text-display-md font-medium whitespace-nowrap">One record.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
