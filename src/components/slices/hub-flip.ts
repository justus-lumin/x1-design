"use client";
// Shared filter state for hub indexes: search + one topic, with GSAP Flip gliding tiles into place.
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Flip, gsap, motion, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";


const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s.-]/gu, " ");

export type Filterable = { title: string; description: string; label?: string; name?: string; tags: string[] };

/**
 * Items carry tags; `topic` "all" shows everything. Hidden items get display:none (the caller renders
 * them with `hidden`), and every change is animated with Flip from the previous layout.
 * The container passed as `ref` must hold every [data-flip] element.
 */
export function useHubFilter<T extends Filterable>(items: T[]) {
  const ref = useRef<HTMLElement | null>(null);
  const state = useRef<Flip.FlipState | null>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const prevHeight = useRef(0);
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");

  const hay = useMemo(() => items.map((i) => norm(`${i.title} ${i.name ?? ""} ${i.description} ${i.label ?? ""}`)), [items]);
  const visible = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    return items.map((i, n) => (topic === "all" || i.tags.includes(topic)) && terms.every((t) => hay[n].includes(t)));
  }, [items, hay, q, topic]);
  const shown = visible.filter(Boolean).length;

  const capture = () => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    tl.current?.progress(1).kill();
    prevHeight.current = el.offsetHeight;
    state.current = Flip.getState(el.querySelectorAll("[data-flip]"), { props: "opacity" });
  };

  useLayoutEffect(() => {
    const s = state.current;
    const el = ref.current;
    if (!s || !el) return;
    state.current = null;
    // Tiles go absolute while they glide; ease the container height so the page below doesn't jump.
    gsap.fromTo(el, { height: prevHeight.current }, { height: el.offsetHeight, duration: 0.9, ease: motion.ease, clearProps: "height", overwrite: true });
    tl.current = Flip.from(s, {
      targets: el.querySelectorAll("[data-flip]"),
      duration: 0.9,
      ease: motion.ease,
      absolute: true,
      stagger: { each: 0.01, amount: 0.12 },
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.08, stagger: { each: 0.03, amount: 0.25 }, ease: motion.ease }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: 0.2, ease: "power2.out" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [visible]);

  return {
    ref,
    q,
    topic,
    visible,
    shown,
    setQ: (v: string) => {
      capture();
      setQ(v);
    },
    setTopic: (v: string) => {
      if (v === topic) return;
      capture();
      setTopic(v);
    },
    reset: () => {
      capture();
      setQ("");
      setTopic("all");
    },
  };
}
