"use client";

import { useRef, type ReactNode } from "react";
import { Check, CornerDownRight } from "lucide-react";
import { X1Mark } from "@/components/brand/logo";
import { Container, SourceChip } from "@/components/brand/primitives";
import { SplitHeading } from "@/components/motion/split-heading";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const steps = [
  { t: "The K-1 arrives", b: "X1 reads it, files it under Harbor Works LLC, and asks you to confirm." },
  { t: "It's read against the agreement", b: "Item J on the K-1 says 50%. Section 5.2 of the operating agreement says 40%." },
  { t: "The question goes to your CPA", b: "Drafted with both documents attached. Nothing is sent until you approve it." },
  { t: "The answer is filed", b: "The decision keeps its reason, so the next advisor doesn't start from zero." },
];

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-[0.8125rem] text-muted-foreground">{label}</span>
      <span className={cn("text-[0.8125rem] tabular-nums", muted && "text-muted-foreground")}>{value}</span>
    </div>
  );
}

function Scene({ i, children }: { i: number; children: ReactNode }) {
  return (
    <div data-scene={i} className="flex flex-col gap-3 lg:absolute lg:inset-0 lg:p-10">
      {children}
    </div>
  );
}

const scenes = [
  <Scene key={0} i={0}>
    <p className="text-data text-muted-foreground">Inbox · received Mar 14</p>
    <div className="rounded-[var(--radius)] bg-raised p-5">
      <p className="font-medium">Schedule K-1 (Form 1065)</p>
      <p className="mt-0.5 text-data text-muted-foreground">2025 · Harbor Works LLC</p>
      <div className="mt-4">
        <Row label="Partner" value="Morgan Avery" />
        <Row label="Item J · Share of profit" value="50.000%" />
        <Row label="Share of capital" value="40.000%" muted />
      </div>
    </div>
    <div className="flex items-center justify-between rounded-[var(--radius)] bg-raised/60 px-5 py-4">
      <span className="text-[0.8125rem] text-muted-foreground">Belongs to</span>
      <span data-belongs className="hatch rounded-full bg-raised px-3 py-1 text-data font-medium">
        Harbor Works LLC · confirm?
      </span>
    </div>
  </Scene>,
  <Scene key={1} i={1}>
    <p className="text-data text-muted-foreground">Harbor Works LLC · 2 documents</p>
    {[
      { d: "2025 Schedule K-1", l: "Item J", label: "Share of profit", v: "50.000%" },
      { d: "Operating agreement", l: "§ 5.2, Sch. A", label: "Percentage interest", v: "40.000%" },
    ].map((r, k) => (
      <div key={r.d} className="flex flex-col-reverse gap-3 rounded-[var(--radius)] bg-raised p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-[0.8125rem] text-muted-foreground">{r.label}</span>
          <SourceChip className="bg-background" doc={r.d} locator={r.l} />
        </div>
        <span data-num className={cn("font-display text-3xl font-medium tabular-nums tracking-tight sm:text-4xl", k === 1 && "text-muted-foreground")}>
          {r.v}
        </span>
      </div>
    ))}
    <p className="px-1 text-data text-subtle">Different figures don&rsquo;t always mean an error. The CPA decides.</p>
  </Scene>,
  <Scene key={2} i={2}>
    <p className="text-data text-muted-foreground">Draft · To Sam Reyes, CPA</p>
    <div data-draft className="hatch rounded-[var(--radius)] bg-raised p-5">
      <p className="text-[0.9375rem] leading-relaxed">
        The 2025 K-1 gives Morgan 50% of profit. The operating agreement allocates by percentage interest: 40%. Which should
        the Q3 estimate use?
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <SourceChip className="bg-background" doc="K-1" locator="Item J" asOf="Mar 14" />
        <SourceChip className="bg-background" doc="Operating agreement" locator="§ 5.2" />
      </div>
    </div>
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
      <span className="text-data text-muted-foreground">Nothing is sent until you approve.</span>
      <span data-approve className="rounded-[var(--radius-control)] bg-secondary px-3.5 py-2.5 text-center text-[0.8125rem] font-medium whitespace-nowrap">
        Approve and send
      </span>
    </div>
  </Scene>,
  <Scene key={3} i={3}>
    <p className="text-data text-muted-foreground">Harbor Works LLC · decisions</p>
    <div className="rounded-[var(--radius)] bg-raised p-5">
      <div className="flex items-start gap-3">
        <CornerDownRight className="mt-0.5 size-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[0.9375rem] font-medium">The operating agreement governs. The K-1 will be amended.</p>
          <p className="mt-1 text-[0.8125rem] text-muted-foreground">Sam Reyes, CPA · answered by email · Mar 21</p>
        </div>
        <span className="grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" />
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 pl-7">
        <SourceChip className="bg-background" doc="K-1" locator="Item J" />
        <SourceChip className="bg-background" doc="Operating agreement" locator="§ 5.2" />
      </div>
    </div>
    <div className="rounded-[var(--radius)] bg-raised/60 px-5 py-4 text-[0.8125rem] text-muted-foreground">
      Q3 estimate uses 40%. The reason is kept with both documents.
    </div>
  </Scene>,
];

export function HowItWorks() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const sc = q("[data-panel] [data-scene]");
        gsap.set(sc.slice(1), { autoAlpha: 0 });
        const setActive = (i: number) =>
          q("[data-step]").forEach((el, k) => el.classList.toggle("is-active", k === i));
        setActive(0);

        const tl = gsap.timeline({
          defaults: { duration: 1, ease: "power3.inOut" },
          scrollTrigger: {
            trigger: q("[data-pin]")[0],
            start: "top top",
            end: "+=2800",
            pin: true,
            scrub: 0.7,
            snap: { snapTo: "labelsDirectional", duration: { min: 0.3, max: 0.8 }, ease: "power2.inOut" },
            onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 3.999))),
          },
        });

        const panel = (sel: string, k: number) => q(`[data-panel] [data-scene="${k}"] ${sel}`);
        tl.addLabel("s0")
          .to(panel("[data-belongs]", 0), { backgroundColor: "var(--primary)", color: "var(--primary-foreground)", duration: 0.4 }, 0.3)
          .to({}, { duration: 0.4 });

        for (let k = 1; k < 4; k++) {
          tl.addLabel(`s${k}`)
            .to(sc[k - 1], { autoAlpha: 0, yPercent: -6, filter: "blur(8px)", duration: 0.6 }, `s${k}`)
            .fromTo(
              sc[k],
              { autoAlpha: 0, yPercent: 8, clipPath: "inset(0% 0% 100% 0%)", filter: "blur(8px)" },
              { autoAlpha: 1, yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", duration: 0.9, immediateRender: false },
              `s${k}+=0.2`
            );
          if (k === 1) tl.from(panel("[data-num]", 1), { yPercent: 60, autoAlpha: 0, stagger: 0.15, duration: 0.6, immediateRender: false }, "s1+=0.5");
          if (k === 2)
            tl.to(panel("[data-approve]", 2), { backgroundColor: "var(--primary)", color: "var(--primary-foreground)", duration: 0.3 }, "s2+=0.9")
              .to(panel("[data-draft]", 2), { backgroundImage: "none", duration: 0.3 }, "s2+=0.9");
          tl.to({}, { duration: 0.4 });
        }
        tl.addLabel("end");
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative">
      <div data-pin className="section-y lg:flex lg:h-svh lg:items-center lg:py-0">
        <Container className="w-full">
          <div className="grid-12 gap-y-12">
            <div className="col-span-4 md:col-span-5">
              <SplitHeading className="font-display text-display-md font-medium">How it works</SplitHeading>
              <p className="mt-4 max-w-sm text-muted-foreground">One household, one example. Two of the Averys&rsquo; documents disagree.</p>
              <ol className="mt-12 hidden flex-col gap-7 lg:flex">
                {steps.map((s) => (
                  <li key={s.t} data-step className="group flex gap-5 opacity-35 transition-opacity duration-500 [&.is-active]:opacity-100">
                    <span className="mt-2 size-2 shrink-0 bg-muted-foreground transition-[background-color,transform] duration-500 group-[.is-active]:scale-125 group-[.is-active]:bg-foreground" />
                    <div>
                      <p className="text-lg font-medium tracking-tight">{s.t}</p>
                      <p className="mt-1.5 hidden max-w-sm text-sm leading-relaxed text-muted-foreground group-[.is-active]:block">{s.b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Desktop: one panel, scenes swap as you scroll. */}
            <div data-panel className="relative col-span-7 col-start-6 hidden min-h-[34rem] overflow-hidden rounded-[var(--radius-tile)] bg-card lg:block">
              <div className="absolute top-6 right-6 z-10 text-subtle">
                <X1Mark className="h-3" />
              </div>
              {scenes}
            </div>

            {/* Mobile: stacked. */}
            <ol className="col-span-4 flex flex-col gap-12 lg:hidden">
              {steps.map((s, k) => (
                <li key={s.t} className="flex flex-col gap-4">
                  <div>
                    <p className="text-lg font-medium tracking-tight">{s.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.b}</p>
                  </div>
                  <div className="rounded-[var(--radius-tile)] bg-card p-4 sm:p-5">{scenes[k]}</div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </div>
    </section>
  );
}
