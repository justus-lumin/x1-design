"use client";
// Statistics hub: leads with one headline figure taken from a report title, counted up once on load.
// The reports follow as a quiet grid; cards carry their own figure when the title has one.
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/brand/primitives";
import { HubCard } from "@/components/slices/hub-card";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import { titleFigure } from "@/components/slices/hub-text";
import type { HubItem } from "@/components/slices/hub-topics";
import { gsap, motion } from "@/lib/gsap";

export function HubStats({ h1, lede, meta, items, lead }: { h1: string; lede?: string; meta?: string; items: HubItem[]; lead?: HubItem }) {
  const root = useRef<HTMLDivElement>(null);
  const fig = lead ? titleFigure(lead.title) : null;

  useHubEntrance(root, (tl, el) => {
    const num = el.querySelector<HTMLElement>("[data-count]");
    if (!num || !fig) return;
    const m = fig.value.match(/^(\$?)([\d,.]+)(.*)$/);
    if (!m) return;
    const target = parseFloat(m[2].replace(/,/g, ""));
    const decimals = (m[2].split(".")[1] ?? "").length;
    const o = { v: 0 };
    tl.to(
      o,
      {
        v: target,
        duration: 1.8,
        ease: motion.ease,
        onUpdate: () => {
          num.textContent = `${m[1]}${o.v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${m[3]}`;
        },
      },
      0.2
    );
    gsap.set(num, { textContent: `${m[1]}0${m[3]}` });
  });

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className="pt-20 md:pt-32">
        <div className="grid-12 gap-y-14 lg:items-end">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            {meta && (
              <p data-hub-pending className="mb-6 text-data text-subtle">
                {meta}
              </p>
            )}
            <h1 data-hub-pending className="font-display text-display-lg font-medium text-balance">
              {h1}
            </h1>
            {lede && (
              <p data-hub-pending className="mt-6 max-w-md text-lede text-muted-foreground text-pretty">
                {lede}
              </p>
            )}
          </div>
          {lead && fig && (
            <Link data-hub-pending href={lead.path} className="group col-span-4 block md:col-span-12 lg:col-span-6 lg:col-start-7 lg:justify-self-end">
              <span className="flex items-baseline gap-3">
                <span data-count className="font-display text-[clamp(4.5rem,12vw,9rem)] leading-[0.9] font-medium tracking-[-0.06em] tabular-nums">
                  {fig.value}
                </span>
                <span className="font-display text-title font-medium text-muted-foreground">{fig.unit}</span>
              </span>
              <span className="mt-5 flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                {lead.title.split(":")[0]}
                <ArrowUpRight className="size-4 shrink-0 transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} />
              </span>
            </Link>
          )}
        </div>
      </Container>

      <Container className="pt-16 pb-[var(--section-y-tight)] md:pt-24">
        <ul className="grid gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const figure = item.path === lead?.path ? null : titleFigure(item.title);
            return (
              <li key={item.path}>
                <HubCard item={{ ...item, label: "", title: titleFigure(item.title) ? item.title.split(":")[0] : item.title }} figure={figure} />
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
