"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { gsap, motion, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { TocItem } from "./article-utils";

/** Scroll to a section, opening it first when it is a collapsed note. */
function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el instanceof HTMLDetailsElement) el.open = true;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

function useActive(items: TocItem[]) {
  const [active, setActive] = useState(-1);
  useGSAP(
    () => {
      const triggers = items.map((it, i) => {
        const el = document.getElementById(it.id);
        if (!el) return null;
        return ScrollTrigger.create({
          trigger: el,
          start: "top 38%",
          end: "bottom 38%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
            else if (i === 0 && self.direction === -1) setActive(-1);
          },
        });
      });
      // Notes can expand and change page height.
      const refresh = () => ScrollTrigger.refresh();
      document.addEventListener("toggle", refresh, true);
      return () => {
        triggers.forEach((t) => t?.kill());
        document.removeEventListener("toggle", refresh, true);
      };
    },
    { dependencies: [items] }
  );

  // Deep links into collapsed notes.
  useEffect(() => {
    const open = () => {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el instanceof HTMLDetailsElement && !el.open) {
        el.open = true;
        requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  return active;
}

function Label({ item }: { item: TocItem }) {
  return (
    <>
      {item.num && <span className="w-5 shrink-0 font-mono text-data text-subtle tabular-nums">{item.num.padStart(2, "0")}</span>}
      <span className="line-clamp-2">{item.label}</span>
    </>
  );
}

/** Desktop: sticky list in cols 1-3 with a tone-filled pill that glides to the active section. */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const active = useActive(items);
  const listRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      const list = listRef.current;
      const pill = pillRef.current;
      if (!list || !pill) return;
      const link = list.querySelector<HTMLElement>(`[data-toc="${active}"]`);
      const instant = first.current || prefersReducedMotion();
      first.current = false;
      if (!link) {
        gsap.to(pill, { autoAlpha: 0, duration: instant ? 0 : motion.dur.fast, ease: motion.ease });
        return;
      }
      gsap.to(pill, {
        y: link.offsetTop,
        height: link.offsetHeight,
        autoAlpha: 1,
        duration: instant ? 0 : motion.dur.base,
        ease: motion.ease,
      });
      // Keep the active entry in view when the list is taller than the viewport.
      const scroller = list.parentElement!;
      const target = link.offsetTop - scroller.clientHeight / 2 + link.offsetHeight / 2;
      if (scroller.scrollHeight > scroller.clientHeight) gsap.to(scroller, { scrollTop: target, duration: instant ? 0 : motion.dur.base, ease: motion.ease });
    },
    { dependencies: [active], scope: listRef }
  );

  const notesStart = items.findIndex((i) => i.group === "notes");

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden lg:block">
      <p className="mb-4 pl-3 text-eyebrow text-muted-foreground">On this page</p>
      <div className="-ml-1 max-h-[calc(100svh-11rem)] overflow-y-auto pl-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div ref={listRef} className="relative pb-2">
          <span ref={pillRef} aria-hidden className="invisible absolute inset-x-0 top-0 rounded-[var(--radius-control)] bg-card" />
          <ul className="relative flex flex-col gap-0.5">
            {items.map((it, i) => (
              <li key={it.id} className={cn(i === notesStart && "mt-5")}>
                {i === notesStart && <p className="mb-2 pl-3 text-data text-subtle">Notes</p>}
                <a
                  data-toc={i}
                  href={`#${it.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(it.id);
                  }}
                  aria-current={i === active ? "location" : undefined}
                  className={cn(
                    "flex gap-2 rounded-[var(--radius-control)] px-3 py-1.5 text-[0.8125rem] leading-snug transition-colors duration-500",
                    i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Label item={it} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

/** Mobile and tablet: a compact floating "On this page" disclosure that names the current section. */
export function ArticleTocMobile({ items }: { items: TocItem[] }) {
  const active = useActive(items);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = items[active];

  useGSAP(
    () => {
      const el = panelRef.current;
      if (!el || !open || prefersReducedMotion()) return;
      gsap.from(el, { autoAlpha: 0, y: -8, duration: motion.dur.fast, ease: motion.ease });
      gsap.from(el.querySelectorAll("li"), { autoAlpha: 0, y: 6, duration: motion.dur.fast, ease: motion.ease, stagger: 0.02, delay: 0.05 });
    },
    { dependencies: [open] }
  );

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div className="sticky top-20 z-40 lg:hidden">
      <div className="rounded-[var(--radius)] bg-card/85 backdrop-blur-xl">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.8125rem]"
        >
          <span className="shrink-0 text-muted-foreground">On this page</span>
          <span className="min-w-0 flex-1 truncate text-foreground">{current?.label ?? ""}</span>
          <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-[var(--ease-out)]", open && "rotate-180")} />
        </button>
        {open && (
          <div ref={panelRef} className="max-h-[60svh] overflow-y-auto px-2 pb-2">
            <ul className="flex flex-col gap-0.5">
              {items.map((it, i) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      go(it.id);
                    }}
                    className={cn(
                      "flex gap-2 rounded-[var(--radius-control)] px-3 py-2 text-[0.875rem] leading-snug",
                      i === active ? "bg-raised text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <Label item={it} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
