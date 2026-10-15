"use client";
// Tools hub: a compact header that runs straight into the tool grid. Motion: header + Flip on filter.
import { useRef } from "react";
import { Container } from "@/components/brand/primitives";
import { HubToolCard } from "@/components/slices/hub-card";
import { HubChips, HubEmpty, type Topic } from "@/components/slices/hub-controls";
import { useHubFilter } from "@/components/slices/hub-flip";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import type { HubItem } from "@/components/slices/hub-topics";
import { cn } from "@/lib/utils";

export function HubTools({ h1, lede, items, topics }: { h1: string; lede?: string; items: HubItem[]; topics: Topic[] }) {
  const root = useRef<HTMLDivElement>(null);
  const f = useHubFilter(items);
  useHubEntrance(root);

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className="pt-16 pb-[var(--section-y-tight)] md:pt-28">
        <div className="grid-12 gap-y-5 md:items-end">
          <h1 data-hub-pending className="col-span-4 font-display text-display-lg font-medium md:col-span-7">
            {h1}
          </h1>
          {lede && (
            <p data-hub-pending className="col-span-4 text-muted-foreground text-pretty md:col-span-5 md:pb-2 lg:col-span-4 lg:col-start-9">
              {lede}
            </p>
          )}
        </div>
        <div data-hub-pending className="mt-10 md:mt-14">
          <HubChips topics={topics} total={items.length} value={f.topic} onChange={f.setTopic} />
        </div>
        <ul ref={(el) => void (f.ref.current = el)} className="relative mt-6 grid gap-[var(--grid-gap)] md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, n) => (
            <li key={item.path} data-flip className={cn(!f.visible[n] && "hidden")}>
              <HubToolCard item={item} />
            </li>
          ))}
        </ul>
        <HubEmpty shown={f.shown} total={items.length} onReset={f.reset} />
      </Container>
    </div>
  );
}
