"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { X1Mark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useGSAP(() => {
    const hide = gsap.to(ref.current, { yPercent: -100, duration: 0.5, ease: "power3.out", paused: true });
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        setScrolled(self.scroll() > 24);
        if (self.scroll() < 160 || self.direction === -1) hide.reverse();
        else hide.play();
      },
    });
  });

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-50">
      <div className={cn("transition-colors duration-500", scrolled || open ? "bg-background/75 backdrop-blur-xl" : "bg-transparent")}>
        <div className="container-x1 flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label="X1 Wealth home" className="text-foreground">
            <X1Mark className="h-5" />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <nav className="flex items-center" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-control)] px-3 py-2 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <a href="https://x1wealth.com/sign-in">Sign in</a>
            </Button>
          </div>
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {open && (
          <nav className="container-x1 flex flex-col gap-1 pb-8 md:hidden" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="py-3 font-display text-2xl font-medium tracking-tight">
                {item.label}
              </Link>
            ))}
            <Button className="mt-6" size="lg" asChild>
              <Link href="/pricing">Start free</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
