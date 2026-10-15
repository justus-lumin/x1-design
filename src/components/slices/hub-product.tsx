"use client";
// Product hubs (integrations, connect, features): split hero with a small product fragment on the
// shader stage, built only from the hub's scraped copy. The index below changes shape per hub.
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { X1Mark } from "@/components/brand/logo";
import { Container } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { HUB_ICONS, HubIconCard, HubToolCard } from "@/components/slices/hub-card";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import type { HubIconKey, HubItem } from "@/components/slices/hub-topics";
import { Button } from "@/components/ui/button";
import { motion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Cta = { text: string; href: string };
export type Fragment = {
  label?: string;
  rows: { icon?: HubIconKey; label: string; sub?: string }[];
  /** connect: an example question shown in the prompt bar */
  prompt?: string;
};

function Window({ variant, fragment }: { variant: "integrations" | "connect" | "features"; fragment: Fragment }) {
  return (
    <div data-window className="w-full overflow-hidden rounded-[var(--radius-tile)] bg-background shadow-[0_40px_120px_-30px_rgb(0_0_0/0.7)]">
      <div className="flex h-11 items-center gap-3 bg-card/60 px-4">
        <X1Mark className="h-3" />
        {fragment.label && <span className="truncate text-data text-subtle">{fragment.label}</span>}
      </div>
      <div className="p-3 sm:p-4">
        {variant === "connect" ? (
          <>
            <div className="flex flex-wrap gap-1.5">
              {fragment.rows.map((r, i) => {
                const Icon = HUB_ICONS[r.icon ?? "mcp"];
                return (
                  <span
                    key={r.label}
                    data-frag
                    className={cn(
                      "inline-flex h-8 items-center gap-2 rounded-full px-3 text-[0.8125rem]",
                      i === 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={1.75} />
                    {r.label}
                  </span>
                );
              })}
            </div>
            {fragment.prompt && (
              <div data-frag className="mt-8 flex items-end gap-3 rounded-[var(--radius)] bg-card p-3 sm:mt-14">
                <p className="flex-1 px-1 pb-0.5 text-[0.875rem] leading-relaxed text-pretty">{fragment.prompt}</p>
                <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] bg-primary text-primary-foreground">
                  <ArrowUp className="size-3.5" />
                </span>
              </div>
            )}
          </>
        ) : (
          <ul className="flex flex-col gap-1">
            {fragment.rows.map((r, i) => {
              const Icon = r.icon ? HUB_ICONS[r.icon] : null;
              return (
                <li key={r.label} data-frag className="flex items-center gap-3 rounded-[var(--radius-control)] bg-card px-3 py-2.5">
                  {Icon ? (
                    <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] bg-raised text-foreground/75">
                      <Icon className="size-4" strokeWidth={1.5} />
                    </span>
                  ) : (
                    <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-control)] bg-raised font-mono text-data text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.8125rem] font-medium sm:truncate">{r.label}</span>
                    {r.sub && <span className="block text-data text-muted-foreground sm:truncate">{r.sub}</span>}
                  </span>
                  {variant === "integrations" && <span className="size-1.5 shrink-0 rounded-full bg-foreground/50" aria-hidden />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function HubProduct({
  variant,
  eyebrow,
  h1,
  lede,
  primary,
  secondary,
  items,
  fragment,
}: {
  variant: "integrations" | "connect" | "features";
  eyebrow?: string;
  h1: string;
  lede?: string;
  primary?: Cta;
  secondary?: Cta;
  items: HubItem[];
  fragment: Fragment;
}) {
  const root = useRef<HTMLDivElement>(null);
  useHubEntrance(root, (tl, el) => {
    tl.fromTo(el.querySelectorAll("[data-frag]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.06, ease: motion.ease }, 0.7);
  });

  // Balance a 3-up grid when two tiles would be left alone on the last row.
  const wide = variant === "integrations" && items.length % 3 === 2;

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className="pt-16 md:pt-28">
        <div className="grid-12 gap-y-12 lg:items-center">
          <div className="col-span-4 md:col-span-10 lg:col-span-5">
            {eyebrow && (
              <p data-hub-pending className="mb-6 text-eyebrow text-muted-foreground">
                {eyebrow}
              </p>
            )}
            <BlurHeading className="font-display text-display-lg font-medium">{h1}</BlurHeading>
            {lede && (
              <p data-hub-pending className="mt-6 max-w-md text-lede text-muted-foreground text-pretty">
                {lede}
              </p>
            )}
            {primary && (
              <div data-hub-pending className="mt-9 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Magnetic>
                  <Button size="lg" asChild>
                    <Link href={primary.href}>
                      {primary.text}
                      <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
                    </Link>
                  </Button>
                </Magnetic>
                {secondary && (
                  <Button size="lg" variant="ghost" asChild className="-ml-5 sm:ml-0">
                    <Link href={secondary.href}>{secondary.text}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          <div
            data-hub-pending
            className="relative isolate col-span-4 overflow-hidden rounded-[var(--radius-tile)] px-4 py-10 sm:px-10 sm:py-16 md:col-span-12 lg:col-span-7 lg:px-14 lg:py-20"
          >
            <GrainShader angle={25} light={0.5} folds={0.75} interactive />
            <div className="relative mx-auto max-w-md">
              <Window variant={variant} fragment={fragment} />
            </div>
          </div>
        </div>
      </Container>

      <Container className="pt-16 pb-[var(--section-y-tight)] md:pt-24">
        {variant === "connect" ? (
          <ul className="grid gap-[var(--grid-gap)] md:grid-cols-2">
            {items.map((item) => (
              <li key={item.path}>
                <HubToolCard item={{ ...item, description: item.title }} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className={cn("grid gap-[var(--grid-gap)] sm:grid-cols-2", variant === "features" ? "lg:grid-cols-4" : "lg:grid-cols-6")}>
            {items.map((item, n) => (
              <li key={item.path} className={cn(variant === "integrations" && (wide && n < 2 ? "lg:col-span-3" : "lg:col-span-2"))}>
                <HubIconCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
