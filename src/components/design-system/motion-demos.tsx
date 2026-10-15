"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { ScrubWords } from "@/components/motion/scrub-words";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { motion } from "@/lib/gsap";
import { SpecTable } from "./parts";

function Demo({
  name,
  file,
  note,
  replay,
  children,
}: {
  name: string;
  file: string;
  note: string;
  replay?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--radius-tile)] bg-card">
      <div className="flex items-start justify-between gap-4 p-6 pb-0">
        <div className="flex flex-col gap-1">
          <p className="font-display text-title font-medium">{name}</p>
          <p className="font-mono text-data text-subtle">{file}</p>
        </div>
        {replay && (
          <Button variant="ghost" onClick={replay} aria-label={`Replay ${name}`}>
            <RotateCcw /> Replay
          </Button>
        )}
      </div>
      <div className="flex min-h-56 flex-1 items-center justify-center px-6 py-10">{children}</div>
      <p className="px-6 pb-6 text-[0.8125rem] leading-relaxed text-muted-foreground">{note}</p>
    </div>
  );
}

function useReplay() {
  const [n, setN] = useState(0);
  return [n, () => setN((v) => v + 1)] as const;
}

export function MotionDemos() {
  const [reveal, replayReveal] = useReplay();
  const [split, replaySplit] = useReplay();
  const [blur, replayBlur] = useReplay();

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Demo
        name="Reveal"
        file="components/motion/reveal.tsx"
        note="Fade and rise on scroll. Children marked data-reveal enter in sequence. Duration base, ease expo.out, stagger 0.08."
        replay={replayReveal}
      >
        <Reveal key={reveal} className="flex w-full max-w-xs flex-col gap-2">
          {["Schedule K-1 (Form 1065)", "Operating agreement", "Trust certificate"].map((d) => (
            <div key={d} data-reveal className="rounded-[var(--radius)] bg-raised px-4 py-3 text-[0.8125rem]">
              {d}
            </div>
          ))}
        </Reveal>
      </Demo>

      <Demo
        name="SplitHeading"
        file="components/motion/split-heading.tsx"
        note="Section headlines rise line by line out of a mask. Duration slow (1.4s), stagger 0.09. Used by SectionHeading."
        replay={replaySplit}
      >
        <SplitHeading key={split} className="max-w-sm text-center font-display text-display-md font-medium">
          Every answer points back to its source.
        </SplitHeading>
      </Demo>

      <Demo
        name="BlurHeading"
        file="components/motion/blur-heading.tsx"
        note="Hero only, once per page. Characters resolve out of a 14px blur like a lens finding focus. Plays on load, not on scroll."
        replay={replayBlur}
      >
        <BlurHeading key={blur} as="p" delay={0.1} className="text-center font-display text-display-lg font-medium">
          Built around you.
        </BlurHeading>
      </Demo>

      <Demo
        name="Magnetic"
        file="components/motion/magnetic.tsx"
        note="Primary CTAs only. A gentle pull toward the pointer, strength 0.22, elastic return. Hover the button."
      >
        <Magnetic>
          <Button size="lg">
            Start free <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
          </Button>
        </Magnetic>
      </Demo>

      <div className="flex flex-col overflow-hidden rounded-[var(--radius-tile)] bg-card md:col-span-2">
        <div className="flex flex-col gap-1 p-6 pb-0">
          <p className="font-display text-title font-medium">ScrubWords</p>
          <p className="font-mono text-data text-subtle">components/motion/scrub-words.tsx</p>
        </div>
        <div className="px-6 py-16 md:py-24">
          <ScrubWords
            className="mx-auto max-w-3xl text-center font-display text-display-md font-medium"
            text="Your financial life belongs to you. The work you do to understand it should keep helping you."
          />
        </div>
        <div className="px-6 pb-6">
          <p className="max-w-xl text-[0.8125rem] leading-relaxed text-muted-foreground">
            Scroll through it. Words ink from 14% to full opacity, scrubbed to the scrollbar (scrub 0.6). One statement per page at most.
          </p>
        </div>
      </div>
    </div>
  );
}

/** The motion tokens, read from the same `motion` object the components import. */
export function MotionTokens() {
  const rows: [string, string, string][] = [
    ["motion.ease", motion.ease, "Every entrance. CSS twin: var(--ease-out)"],
    ["motion.easeInOut", motion.easeInOut, "Scene swaps and scrubbed timelines"],
    ["motion.dur.fast", `${motion.dur.fast}s`, "Small UI feedback"],
    ["motion.dur.base", `${motion.dur.base}s`, "Reveal, cards, blocks"],
    ["motion.dur.slow", `${motion.dur.slow}s`, "Headlines (SplitHeading, BlurHeading)"],
    ["motion.stagger", `${motion.stagger}s`, "Between sequenced children"],
    ["motion.distance", `${motion.distance}px`, "Reveal rise distance"],
  ];
  return <SpecTable head={["Token", "Value", "Use"]} mono={[1]} rows={rows} />;
}
