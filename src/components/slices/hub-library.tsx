"use client";
// Resources hub: an editorial, left-aligned masthead with search right in it, then a reading list
// with a sticky topic rail. Motion: the masthead entrance and Flip on filter. Rows are static.
import { useRef } from "react";
import { Container } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { HubRow } from "@/components/slices/hub-card";
import { HubChips, HubEmpty, HubSearch, type Topic } from "@/components/slices/hub-controls";
import { useHubFilter } from "@/components/slices/hub-flip";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import type { HubItem } from "@/components/slices/hub-topics";
import { cn } from "@/lib/utils";

export function HubLibrary({
  h1,
  lede,
  meta,
  items,
  topics,
  searchLabel,
}: {
  h1: string;
  lede?: string;
  meta?: string;
  items: HubItem[];
  topics: Topic[];
  searchLabel: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const f = useHubFilter(items);
  useHubEntrance(root);

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className="pt-20 md:pt-32">
        <div className="grid-12 gap-y-10 lg:items-end">
          <div className="col-span-4 md:col-span-12 lg:col-span-7">
            {meta && (
              <p data-hub-pending className="mb-6 text-data text-subtle">
                {meta}
              </p>
            )}
            <BlurHeading className="font-display text-display-xl font-medium">{h1}</BlurHeading>
            {lede && (
              <p data-hub-pending className="mt-6 max-w-lg text-lede text-muted-foreground text-pretty">
                {lede}
              </p>
            )}
          </div>
          <div data-hub-pending className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
            <HubSearch value={f.q} onChange={f.setQ} label={searchLabel} />
          </div>
        </div>
      </Container>

      <Container className="pt-14 pb-[var(--section-y-tight)] md:pt-20">
        <div className="grid-12 gap-y-6">
          <aside className="col-span-4 md:col-span-12 lg:col-span-3">
            <div data-hub-pending className="lg:sticky lg:top-24">
              <HubChips topics={topics} total={items.length} value={f.topic} onChange={f.setTopic} stack />
            </div>
          </aside>
          <div className="col-span-4 md:col-span-12 lg:col-span-9">
            <ul ref={(el) => void (f.ref.current = el)} className="relative -mx-5 flex flex-col gap-1 sm:-mx-6">
              {items.map((item, n) => (
                <li key={item.path} data-flip className={cn(!f.visible[n] && "hidden")}>
                  <HubRow item={item} />
                </li>
              ))}
            </ul>
            <HubEmpty shown={f.shown} total={items.length} onReset={f.reset} />
          </div>
        </div>
      </Container>
    </div>
  );
}
