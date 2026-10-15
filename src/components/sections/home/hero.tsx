"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ArrowUp, Search } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { X1Mark } from "@/components/brand/logo";
import { Container, SourceChip } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { Button } from "@/components/ui/button";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const prompts = [
  "know what Article IV of the trust actually says",
  "check the K-1 against the operating agreement",
  "prepare questions for my CPA meeting",
];

/* --- Household surface, in miniature. Every line cites its source. --- */

function Widget({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div data-widget className={cn("flex flex-col rounded-[var(--radius)] bg-card p-4 sm:min-h-36", className)}>
      <p className="text-data text-muted-foreground">{label}</p>
      <div className="mt-3 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function AppWindow() {
  return (
    <div data-window className="overflow-hidden rounded-[var(--radius-tile)] bg-background shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]">
      <div className="flex h-12 items-center gap-3 bg-card/60 px-4">
        <X1Mark className="h-3.5" />
        <span className="flex items-center gap-2 text-data text-subtle">
          <Search className="size-3" /> Ask your record
        </span>
        <span className="ml-auto grid size-6 place-items-center rounded-full bg-raised text-[0.625rem] font-medium">MA</span>
      </div>
      <div className="p-4 sm:p-5 md:p-7">
        <p data-greet className="font-display text-xl font-medium tracking-tight md:text-2xl">
          Evening, <span className="text-muted-foreground">Morgan</span>
        </p>
        <p data-greet className="mt-1 text-data text-muted-foreground">Here&rsquo;s what changed in your record this week.</p>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Widget label="Weekly brief" className="hidden sm:flex">
            <p className="text-[0.8125rem] leading-relaxed">
              3 documents filed. <span className="text-muted-foreground">1 question is waiting for your approval.</span>
            </p>
          </Widget>
          <Widget label="Two documents disagree">
            <div className="flex items-baseline justify-between">
              <span className="text-data whitespace-nowrap text-muted-foreground">K-1</span>
              <span className="font-display text-lg font-medium tabular-nums">50.000%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-data whitespace-nowrap text-muted-foreground">Agreement</span>
              <span className="font-display text-lg font-medium tabular-nums text-muted-foreground">40.000%</span>
            </div>
            <SourceChip className="mt-3 self-start lg:mt-auto" doc="Ask your CPA" locator="draft" pending />
          </Widget>
          <Widget label="Next 90 days">
            <ul className="flex flex-col gap-1.5 text-[0.8125rem]">
              <li className="flex justify-between gap-3 whitespace-nowrap"><span>Extended K-1s</span><span className="font-mono text-data text-muted-foreground">Sep 15</span></li>
              <li className="flex justify-between gap-3 whitespace-nowrap"><span>Q3 estimate</span><span className="font-mono text-data text-muted-foreground">Sep 15</span></li>
              <li className="flex justify-between gap-3 whitespace-nowrap text-muted-foreground"><span>Trust review</span><span className="font-mono text-data">Oct 1</span></li>
            </ul>
          </Widget>
          <Widget label="Entities" className="hidden sm:flex">
            <p className="text-[0.8125rem] leading-relaxed">1 business · 1 trust · 1 property</p>
            <span className="hatch mt-auto self-start rounded-full bg-raised px-2.5 py-1 text-data text-muted-foreground">Life policy: unconfirmed</span>
          </Widget>
        </div>

        <div className="mx-auto mt-6 max-w-xl">
          <ul className="hidden flex-col gap-0.5 sm:flex">
            {prompts.map((p) => (
              <li key={p} data-prompt className="rounded-[var(--radius-control)] px-3 py-2 text-[0.8125rem] transition-colors hover:bg-card">
                I want to <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-3 rounded-[var(--radius)] bg-card px-4 py-3">
            <span className="flex-1 truncate text-[0.8125rem]">
              I want to <span data-typed className="text-muted-foreground" />
              <span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-foreground" />
            </span>
            <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius-control)] bg-primary text-primary-foreground">
              <ArrowUp className="size-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    (_, contextSafe) => {
      if (prefersReducedMotion() || !contextSafe) return;
      const tl = gsap.timeline({ defaults: { ease: motion.ease } });
      tl.from("[data-hero-fade]", { autoAlpha: 0, y: 14, filter: "blur(6px)", duration: 1.1, stagger: 0.1, clearProps: "filter" }, 0.6)
        .from("[data-stage]", { autoAlpha: 0, y: 80, duration: 1.6 }, 0.9)
        .from("[data-greet]", { autoAlpha: 0, y: 10, duration: 0.9, stagger: 0.08 }, 1.5)
        .from("[data-widget]", { autoAlpha: 0, y: 24, scale: 0.97, duration: 1, stagger: { each: 0.07, from: "random" } }, 1.6)
        .from("[data-prompt]", { autoAlpha: 0, x: -10, duration: 0.7, stagger: 0.07 }, 2);

      // The window lies back in 3D and stands up as you scroll into it.
      gsap.fromTo(
        "[data-window-wrap]",
        { rotateX: 22, scale: 0.9, yPercent: 6 },
        {
          rotateX: 0,
          scale: 1,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-stage]", start: "top 85%", end: "top 15%", scrub: 0.8 },
        }
      );

      // Pointer tilt: the window leans toward the cursor, a few degrees at most.
      const win = root.current!.querySelector<HTMLElement>("[data-window]")!;
      const rx = gsap.quickTo(win, "rotateX", { duration: 1, ease: "power3.out" });
      const ry = gsap.quickTo(win, "rotateY", { duration: 1, ease: "power3.out" });
      const stage = root.current!.querySelector<HTMLElement>("[data-stage]")!;
      const move = contextSafe((e: PointerEvent) => {
        const r = stage.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 5);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 4);
      });
      const leave = contextSafe(() => {
        rx(0);
        ry(0);
      });
      stage.addEventListener("pointermove", move);
      stage.addEventListener("pointerleave", leave);

      // The prompt types through the suggestions.
      const typed = root.current!.querySelector<HTMLElement>("[data-typed]")!;
      const cycle = gsap.timeline({ repeat: -1, delay: 2.6 });
      prompts.forEach((p) => {
        const o = { n: 0 };
        const render = () => {
          typed.textContent = p.slice(0, Math.round(o.n));
        };
        cycle
          .to(o, { n: p.length, duration: p.length * 0.035, ease: "none", onUpdate: render })
          .to({}, { duration: 1.8 })
          .to(o, { n: 0, duration: 0.4, ease: "power1.in", onUpdate: render });
      });

      return () => {
        stage.removeEventListener("pointermove", move);
        stage.removeEventListener("pointerleave", leave);
      };
    },
    { scope: root }
  );

  return (
    <div ref={root}>
      <Container className="flex flex-col items-center pt-24 text-center md:pt-36">
        <Link
          data-hero-fade
          href="/connect"
          className="group mb-8 inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-data text-muted-foreground transition-colors hover:text-foreground"
        >
          Use your record in Claude and ChatGPT
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <BlurHeading className="max-w-4xl font-display text-display-xl font-medium">A family office built around you.</BlurHeading>
        <p data-hero-fade className="mt-6 max-w-xl text-lede text-muted-foreground text-pretty">
          X1 keeps the whole record, reads the documents, and tells you which professional needs to hear about what, before
          the deadline instead of after.
        </p>
        <div data-hero-fade className="mt-9 flex flex-col items-center gap-3">
          <Magnetic>
            <Button size="lg" asChild>
              <Link href="/pricing">
                Start free
                <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
              </Link>
            </Button>
          </Magnetic>
          <p className="text-data text-subtle">Free to start · Nothing is sent without your approval</p>
        </div>
      </Container>

      <Container className="mt-20 md:mt-28">
        <div data-stage className="relative isolate overflow-hidden rounded-[var(--radius-tile)] px-3 pt-10 pb-0 sm:px-6 sm:pt-16 md:h-[min(54rem,92vh)] md:px-0 md:pt-0">
          <GrainShader angle={20} light={0.55} folds={0.75} interactive />
          <div className="[perspective:1600px] md:absolute md:top-[15%] md:left-[18%] md:w-[74%]">
            <div data-window-wrap className="relative w-full origin-bottom" style={{ transformStyle: "preserve-3d" }}>
              <AppWindow />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
