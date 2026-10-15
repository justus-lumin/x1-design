"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, Bot, CalendarClock, FileSearch, FolderLock, Network, Newspaper, Send, Share2 } from "lucide-react";
import { Container, SectionHeading } from "@/components/brand/primitives";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const items = [
  { icon: FolderLock, t: "Vault", d: "Every document, filed", href: "/features/vault" },
  { icon: FileSearch, t: "Ask X1", d: "Answers with sources", href: "/features/ask-x1" },
  { icon: Network, t: "Entities", d: "Who owns what", href: "/features/family-wealth" },
  { icon: CalendarClock, t: "Next 90 days", d: "Deadlines, in context", href: "/features/pulse" },
  { icon: Send, t: "Handoffs", d: "Questions to professionals", href: "/professionals" },
  { icon: Newspaper, t: "Weekly Brief", d: "What changed", href: "/pricing" },
  { icon: Share2, t: "Export", d: "Your record, portable", href: "/security" },
  { icon: Bot, t: "Assistants", d: "Claude, ChatGPT, Codex", href: "/connect" },
];

/** "Everything a family office keeps track of": a quiet 4x2 grid that assembles from the center. */
export function Capabilities() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-cap]", {
        autoAlpha: 0,
        scale: 0.6,
        y: 20,
        duration: 1.1,
        ease: "expo.out",
        stagger: { each: 0.06, grid: [2, 4], from: "center" },
        scrollTrigger: { trigger: "[data-caps]", start: "top 80%", once: true },
      });
      gsap.from("[data-cap-label]", {
        autoAlpha: 0,
        y: 8,
        duration: 0.8,
        ease: "power3.out",
        stagger: { each: 0.06, grid: [2, 4], from: "center" },
        delay: 0.25,
        scrollTrigger: { trigger: "[data-caps]", start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="section-y">
      <Container>
        <SectionHeading
          title="Everything a family office keeps track of"
          lede="Documents, entities, deadlines, decisions and the professionals around them, in one record you own."
        />
        <ul data-caps className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:grid-cols-4">
          {items.map(({ icon: Icon, t, d, href }) => (
            <li key={t}>
              <Link href={href} className="group flex flex-col items-center text-center">
                <span
                  data-cap
                  className="relative grid size-14 place-items-center overflow-hidden rounded-[var(--radius)] bg-raised text-foreground/70 transition-[background-color,color,transform] duration-500 group-hover:-translate-y-1 group-hover:bg-accent group-hover:text-foreground"
                >
                  <Icon className="size-5 transition-transform duration-700 group-hover:scale-110" strokeWidth={1.5} />
                  <ArrowUpRight className="absolute top-1.5 right-1.5 size-2.5 opacity-0 transition-opacity group-hover:opacity-60" />
                </span>
                <span data-cap-label className="mt-4 text-sm font-medium">{t}</span>
                <span data-cap-label className="mt-1 text-[0.8125rem] text-muted-foreground">{d}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
