"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { HubRevealStyle } from "@/components/slices/hub-reveal";
import type { HubItem } from "@/components/slices/hub-topics";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** The newest page in a hub, given room: text on a card, a soft shader field beside it. */
export function HubFeatured({ item, kicker }: { item: HubItem; kicker: string }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const text = el.querySelectorAll("[data-feat-line]");
      const tile = el.querySelector("[data-feat-tile]");
      const field = el.querySelector("[data-feat-field]");
      if (prefersReducedMotion()) {
        gsap.set([tile, field, ...text], { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: motion.ease },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      tl.fromTo(tile, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2 })
        .fromTo(field, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 100% round 0.5rem)" }, { clipPath: "inset(0% 0% 0% 0% round 0.5rem)", duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" }, 0.15)
        .fromTo(text, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.35);
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Link
        href={item.path}
        data-feat-tile
        data-hub-pending
        className="group grid overflow-hidden rounded-[var(--radius-tile)] bg-card p-2 transition-colors duration-500 ease-[var(--ease-out)] hover:bg-raised focus-visible:bg-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 md:grid-cols-12"
      >
        <div className="flex flex-col p-5 md:col-span-6 md:p-9 lg:p-11">
          <div data-feat-line data-hub-pending className="flex items-center gap-2 text-data text-muted-foreground">
            <span className="rounded-full bg-background px-2.5 py-1 text-foreground">{kicker}</span>
            {item.label && <span>{item.label}</span>}
            {item.date && (
              <>
                <span className="text-subtle" aria-hidden>·</span>
                <span className="font-mono text-subtle">{item.date}</span>
              </>
            )}
          </div>
          <h2 data-feat-line data-hub-pending className="mt-8 max-w-xl font-display text-display-md font-medium text-balance md:mt-14">
            {item.title}
          </h2>
          {item.description && (
            <p data-feat-line data-hub-pending className="mt-5 max-w-lg text-lede text-muted-foreground text-pretty">
              {item.description}
            </p>
          )}
        </div>
        <div data-feat-field data-hub-pending className="relative isolate min-h-56 overflow-hidden rounded-[var(--radius)] md:col-span-6 md:min-h-[26rem]">
          <GrainShader angle={30} light={0.42} folds={0.7} grain={0.08} interactive />
          <span className="absolute right-5 bottom-5 grid size-11 place-items-center rounded-full bg-background text-foreground transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </span>
        </div>
      </Link>
    </div>
  );
}
