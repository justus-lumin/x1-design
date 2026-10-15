"use client";
// Compare hub: a typographic "A vs B" masthead built from the hub's own comparisons, then compact,
// table-like rows grouped the way the scraped hub groups them. Motion: masthead + Flip on filter.
import Link from "next/link";
import { useMemo, useRef } from "react";
import { Container } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Arrow } from "@/components/slices/hub-card";
import { HubChips, HubEmpty, HubSearch } from "@/components/slices/hub-controls";
import { useHubFilter } from "@/components/slices/hub-flip";
import { HubRevealStyle, useHubEntrance } from "@/components/slices/hub-reveal";
import type { HubItem } from "@/components/slices/hub-topics";
import { motion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Group = { key: string; label: string; rows: { item: HubItem; name: string; bestFor: string }[] };

export function HubCompare({ h1, lede, meta, groups, searchLabel }: { h1: string; lede?: string; meta?: string; groups: Group[]; searchLabel: string }) {
  const root = useRef<HTMLDivElement>(null);

  // One flat list for filtering; each row is tagged with its group.
  const rows = useMemo(
    () =>
      groups.flatMap((g) =>
        g.rows.map((r) => ({ ...r, group: g.key, title: r.name, description: `${r.bestFor} ${r.item.title}`, tags: [g.key] }))
      ),
    [groups]
  );
  const f = useHubFilter(rows);
  const topics = groups.map((g) => ({ key: g.key, label: g.label, count: g.rows.length }));

  // Masthead motif: head-to-head names, straight from the comparison rows.
  const seen = new Set<string>();
  const pairs = rows
    .map((r) => r.name.split(/\s+vs\.?\s+/i))
    .filter((p) => p.length === 2 && p.every((s) => s.length <= 16 && !seen.has(s)) && p.every((s) => seen.add(s)))
    .slice(0, 4);

  useHubEntrance(root, (tl, el) => {
    tl.fromTo(el.querySelectorAll("[data-vs-line]"), { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.08, ease: motion.ease }, 0.15);
  });

  return (
    <div ref={root}>
      <HubRevealStyle />
      <Container className="pt-20 md:pt-32">
        <div className="grid-12 gap-y-12 lg:items-end">
          <div className="col-span-4 md:col-span-12 lg:col-span-6">
            {meta && (
              <p data-hub-pending className="mb-6 text-data text-subtle">
                {meta}
              </p>
            )}
            <BlurHeading className="font-display text-display-lg font-medium">{h1}</BlurHeading>
            {lede && (
              <p data-hub-pending className="mt-6 max-w-md text-lede text-muted-foreground text-pretty">
                {lede}
              </p>
            )}
            <div data-hub-pending className="mt-9 max-w-md">
              <HubSearch value={f.q} onChange={f.setQ} label={searchLabel} />
            </div>
          </div>
          <div aria-hidden className="col-span-4 hidden select-none md:col-span-12 md:block lg:col-span-6">
            <ul data-hub-pending className="flex flex-col items-start gap-1 lg:items-end">
              {pairs.map(([a, b], i) => (
                <li key={i} className="-mb-[0.12em] overflow-hidden pb-[0.12em]">
                  <span
                    data-vs-line
                    className={cn(
                      "block font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-medium tracking-[-0.04em] whitespace-nowrap",
                      i === 0 ? "text-foreground" : "text-subtle"
                    )}
                  >
                    {a} <span className="font-sans text-[0.5em] font-normal tracking-normal text-muted-foreground align-middle">vs</span> {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <Container className="pt-14 pb-[var(--section-y-tight)] md:pt-20">
        <div data-hub-pending>
          <HubChips topics={topics} total={rows.length} value={f.topic} onChange={f.setTopic} />
        </div>
        <div aria-hidden className="mt-10 hidden grid-cols-[minmax(0,5fr)_minmax(0,6fr)_7rem_2rem] gap-6 px-5 text-data text-subtle md:mt-12 md:grid">
          <span>Comparison</span>
          <span>Best for</span>
          <span>Updated</span>
        </div>
        <div ref={(el) => void (f.ref.current = el)} className="relative mt-8 flex flex-col gap-10 md:mt-6">
          {groups.map((g) => {
            const idx = rows.map((r, n) => (r.group === g.key ? n : -1)).filter((n) => n >= 0);
            const count = idx.filter((n) => f.visible[n]).length;
            return (
              <section key={g.key} className={cn(!count && "hidden")} aria-label={g.label}>
                <div className="mb-3 flex items-baseline justify-between gap-4 px-5">
                  <h2 className="text-eyebrow font-medium">{g.label}</h2>
                  <span className="font-mono text-data text-subtle tabular-nums">{count}</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {idx.map((n) => {
                    const r = rows[n];
                    return (
                      <li key={r.item.path} data-flip className={cn(!f.visible[n] && "hidden")}>
                        <Link
                          href={r.item.path}
                          className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-[var(--radius)] bg-card px-5 py-4 transition-colors duration-500 ease-[var(--ease-out)] hover:bg-raised focus-visible:bg-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_7rem_2rem] md:gap-6"
                        >
                          <span className="font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.015em]">{r.name}</span>
                          <Arrow className="-mr-1.5 md:order-last md:mr-0" />
                          <span className="col-span-2 text-sm text-muted-foreground md:col-span-1">{r.bestFor || r.item.description}</span>
                          <span className="col-span-2 font-mono text-data text-subtle md:col-span-1">{r.item.date}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        <HubEmpty shown={f.shown} total={rows.length} onReset={f.reset} />
      </Container>
    </div>
  );
}
