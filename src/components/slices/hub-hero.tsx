"use client";

import { useRef } from "react";
import { Container } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import { cn } from "@/lib/utils";

/**
 * Plain hub masthead. "center": the homepage voice (blog). "column": left-aligned on a narrow
 * reading column, so it lines up with a list below it (authors).
 */
export function HubHero({
  eyebrow,
  h1,
  lede,
  meta,
  align = "center",
}: {
  eyebrow?: string;
  h1: string;
  lede?: string;
  meta?: string;
  align?: "center" | "column";
}) {
  const root = useRef<HTMLDivElement>(null);
  useHubEntrance(root);
  const center = align === "center";

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className={cn("pt-20 md:pt-32", center && "flex flex-col items-center text-center md:pt-36")}>
        <div className={cn(!center && "mx-auto max-w-4xl")}>
          {(eyebrow || (!center && meta)) && (
            <p data-hub-pending className="mb-6 text-data text-subtle">
              {eyebrow ?? meta}
            </p>
          )}
          <BlurHeading className={cn("font-display font-medium", center ? "mx-auto max-w-4xl text-display-xl" : "text-display-lg")}>{h1}</BlurHeading>
          {lede && (
            <p data-hub-pending className={cn("mt-6 max-w-xl text-lede text-muted-foreground text-pretty", center && "mx-auto")}>
              {lede}
            </p>
          )}
          {center && meta && (
            <p data-hub-pending className="mt-6 text-data text-subtle">
              {meta}
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}
