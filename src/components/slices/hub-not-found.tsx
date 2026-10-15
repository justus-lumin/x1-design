"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { Container } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { HubRevealStyle } from "@/components/slices/hub-reveal";
import { Button } from "@/components/ui/button";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/** 404: one calm shader field, one sentence, two ways back. */
export function NotFoundStage() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const stage = el.querySelector("[data-nf-stage]");
      const fades = el.querySelectorAll("[data-nf-fade]");
      if (prefersReducedMotion()) {
        gsap.set([stage, ...fades], { autoAlpha: 1 });
        return;
      }
      gsap
        .timeline({ defaults: { ease: motion.ease } })
        .fromTo(stage, { autoAlpha: 0, y: 40, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.4 }, 0.1)
        .fromTo(fades, { autoAlpha: 0, y: 14, filter: "blur(6px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.1, stagger: 0.1, clearProps: "filter" }, 0.6);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="pt-6 pb-[var(--section-y-tight)] md:pt-10">
      <HubRevealStyle />
      <Container>
        <div
          data-nf-stage
          data-hub-pending
          className="dark relative isolate flex min-h-[min(44rem,calc(100svh-8rem))] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-tile)] bg-background px-6 py-24 text-center text-foreground"
        >
          <GrainShader angle={60} light={0.32} folds={0.8} interactive />
          <span data-nf-fade data-hub-pending className="relative mb-8 rounded-full bg-card/80 px-3.5 py-1.5 font-mono text-data text-muted-foreground">
            404
          </span>
          <BlurHeading className="relative max-w-2xl font-display text-display-lg font-medium" delay={0.5}>
            This page isn&rsquo;t here.
          </BlurHeading>
          <p data-nf-fade data-hub-pending className="relative mt-6 max-w-sm text-lede text-muted-foreground text-pretty">
            It may have moved, or the link may be wrong.
          </p>
          <div data-nf-fade data-hub-pending className="relative mt-9 flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Magnetic>
              <Button size="lg" asChild>
                <Link href="/">
                  Back to home
                  <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
                </Link>
              </Button>
            </Magnetic>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/resources">Browse resources</Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
