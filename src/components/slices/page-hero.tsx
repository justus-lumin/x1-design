// SEO page heroes. Five variants so neighbouring pages never open the same way:
//   stage     centered headline, then a shader field holding a floating "On this page" card
//   split     headline on cols 1-7, a record card built from the page's own sections on cols 8-12
//   editorial huge left-aligned headline, lede and actions set to the right below it, no visual
//   shader    full-width shader panel with the headline overlaid low-left
//   compact   short left-aligned block that flows straight into the first section
// Each has exactly one entrance. pickHeroVariant() chooses deterministically per page.
import { ArrowRight } from "lucide-react";
import { GrainShader } from "@/components/brand/grain-shader";
import { X1Mark } from "@/components/brand/logo";
import { Container, SourceChip } from "@/components/brand/primitives";
import { BlurHeading } from "@/components/motion/blur-heading";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { allPaths, getPage, hasPage, resolveHref, type Page } from "@/lib/content";
import { cn } from "@/lib/utils";
import { pad, SmartLink } from "./landing-kit";
import { HeroMotion, HeroStage, TocLink } from "./landing-hero-motion";

export type HeroVariant = "stage" | "split" | "editorial" | "shader" | "compact";
const ORDER: HeroVariant[] = ["stage", "editorial", "split", "compact", "shader"];

/**
 * Deterministic and neighbour-aware: pages are ranked within their section (/integrations/*, /tools/*, top level)
 * and walk through the five variants from a section-specific offset, so siblings always differ.
 * Variants that need sections to show (stage, split) fall back when a page has too few.
 */
export function pickHeroVariant(page: Page): HeroVariant {
  const parts = page.path.split("/").filter(Boolean);
  const section = parts.length > 1 ? parts[0] : "_top";
  const siblings = allPaths()
    .filter((p) => (section === "_top" ? p.split("/").filter(Boolean).length === 1 : p.startsWith(`/${section}/`)))
    .filter((p) => getPage(p)?.template === "landing")
    .sort();
  const offset = [...section].reduce((a, c) => a + c.charCodeAt(0), 0);
  let v = ORDER[(Math.max(siblings.indexOf(page.path), 0) + offset) % ORDER.length];
  const sections = page.chunks.filter((c) => c.heading).length;
  if ((v === "stage" || v === "split") && sections < 3) v = page.h1.length > 48 ? "compact" : "editorial";
  return v;
}

// Hero parts stay hidden until the entrance timeline has set them up: no flash, no jump.
const HERO_CSS = `
.js [data-hero]:not([data-hero-ready]) :is([data-hero-fade],[data-stage],[data-toc],[data-card]){visibility:hidden}
@media (prefers-reduced-motion: reduce){.js [data-hero]:not([data-hero-ready]) :is([data-hero-fade],[data-stage],[data-toc],[data-card]){visibility:visible}}
`;

type Props = { page: Page; variant?: HeroVariant | "centered"; /** @deprecated use variant="stage" */ stage?: boolean; className?: string };

export function PageHero({ page, variant, stage, className }: Props) {
  const v = variant ?? (stage ? "stage" : "centered");
  const toc = page.chunks.filter((c) => c.heading).map((c) => ({ id: c.id, label: c.heading! }));
  return (
    <HeroMotion className={className}>
      <style href="x1-page-hero" precedence="default">
        {HERO_CSS}
      </style>
      {v === "split" ? (
        <SplitHero page={page} toc={toc} />
      ) : v === "editorial" ? (
        <EditorialHero page={page} />
      ) : v === "shader" ? (
        <ShaderHero page={page} />
      ) : v === "compact" ? (
        <CompactHero page={page} />
      ) : (
        <>
          <CenteredHero page={page} />
          {v === "stage" && toc.length >= 2 && <HeroStage items={toc} />}
        </>
      )}
    </HeroMotion>
  );
}

/* ---------- Shared parts ---------- */

function Pill({ page, align = "center" }: { page: Page; align?: "center" | "left" }) {
  const hub = "/" + page.path.split("/").filter(Boolean)[0];
  const hubHref = page.label && hub !== page.path && hasPage(hub) ? hub : undefined;
  const eyebrow = page.eyebrow && page.eyebrow !== page.label ? page.eyebrow : undefined;
  if (!page.label && !eyebrow) return null;
  const inner = (
    <>
      {page.label && <span className={cn("text-foreground", eyebrow && "hidden sm:inline")}>{page.label}</span>}
      {page.label && eyebrow && <span aria-hidden className="hidden size-0.5 shrink-0 rounded-full bg-subtle sm:block" />}
      {eyebrow && <span className="text-balance">{eyebrow}</span>}
      {hubHref && <ArrowRight className="size-3 shrink-0 transition-transform duration-500 group-hover:translate-x-0.5" />}
    </>
  );
  const cls = "group inline-flex max-w-full items-center gap-2 rounded-full bg-card px-3.5 py-1.5 text-data text-muted-foreground transition-colors duration-500";
  return (
    <div data-hero-fade className={cn("mb-8 flex max-w-full", align === "center" ? "justify-center" : "justify-start")}>
      {hubHref ? (
        <SmartLink href={hubHref} className={cn(cls, "hover:bg-raised/70 hover:text-foreground")}>
          {inner}
        </SmartLink>
      ) : (
        <p className={cls}>{inner}</p>
      )}
    </div>
  );
}

function Ctas({ page, align = "center", stack = false }: { page: Page; align?: "center" | "left"; stack?: boolean }) {
  const ctas = page.ctas.slice(0, 2).map((c) => ({ text: c.text, href: resolveHref(c.href) }));
  if (!ctas.length) return null;
  return (
    <div
      data-hero-fade
      className={cn(
        "flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3",
        stack && "md:flex-col md:items-start",
        align === "center" && "sm:justify-center"
      )}
    >
      <Magnetic>
        <Button size="lg" className="w-full sm:w-auto" asChild>
          <SmartLink href={ctas[0].href}>
            {ctas[0].text}
            <ArrowRight className="transition-transform duration-500 group-hover/button:translate-x-1" />
          </SmartLink>
        </Button>
      </Magnetic>
      {ctas[1] && (
        <Button size="lg" variant="ghost" asChild>
          <SmartLink href={ctas[1].href}>{ctas[1].text}</SmartLink>
        </Button>
      )}
    </div>
  );
}

const Lede = ({ page, className }: { page: Page; className?: string }) =>
  page.lede ? (
    <p data-hero-fade className={cn("text-lede text-pretty text-muted-foreground", className)}>
      {page.lede}
    </p>
  ) : null;

/* ---------- Variants ---------- */

function CenteredHero({ page }: { page: Page }) {
  const long = page.h1.length > 56;
  return (
    <Container className="flex flex-col items-center pt-20 text-center md:pt-32">
      <Pill page={page} />
      <BlurHeading className={cn("max-w-4xl font-display font-medium", long ? "text-display-lg" : "text-display-xl")}>{page.h1}</BlurHeading>
      <Lede page={page} className="mt-6 max-w-2xl" />
      <div className="mt-9 flex w-full justify-center">
        <Ctas page={page} />
      </div>
    </Container>
  );
}

function EditorialHero({ page }: { page: Page }) {
  return (
    <Container className="pt-20 pb-4 md:pt-36">
      <div className="grid-12 gap-y-8">
        <div className="col-span-4 md:col-span-12">
          <Pill page={page} align="left" />
          <SplitHeading as="h1" start="load" delay={0.15} className="max-w-[16ch] font-display text-display-xl font-medium md:max-w-[18ch]">
            {page.h1}
          </SplitHeading>
        </div>
        <div className="col-span-4 flex flex-col gap-8 md:col-span-6 md:col-start-7 md:pt-6">
          <Lede page={page} />
          <Ctas page={page} align="left" />
        </div>
      </div>
    </Container>
  );
}

function CompactHero({ page }: { page: Page }) {
  return (
    <Container className="pt-16 md:pt-28">
      <div className="grid-12 items-end gap-y-8">
        <div className="col-span-4 md:col-span-8">
          <Pill page={page} align="left" />
          <SplitHeading as="h1" start="load" delay={0.1} className="font-display text-display-lg font-medium">
            {page.h1}
          </SplitHeading>
          <Lede page={page} className="mt-6 max-w-2xl" />
        </div>
        <div className="col-span-4 md:col-span-4 md:col-start-9 md:justify-self-end">
          <Ctas page={page} align="left" stack />
        </div>
      </div>
    </Container>
  );
}

function ShaderHero({ page }: { page: Page }) {
  return (
    <Container className="pt-4 md:pt-6">
      <div
        data-stage
        className="dark relative isolate flex min-h-[36rem] items-end overflow-hidden rounded-[var(--radius-tile)] bg-background text-foreground md:min-h-[min(44rem,84svh)]"
      >
        <GrainShader angle={28} light={0.5} folds={0.8} interactive />
        <div className="relative w-full p-6 pt-24 sm:p-10 md:p-14">
          <div className="max-w-3xl">
            <Pill page={page} align="left" />
            <BlurHeading className="font-display text-display-xl font-medium" delay={0.6}>
              {page.h1}
            </BlurHeading>
            <Lede page={page} className="mt-6 max-w-xl text-foreground/70" />
            <div className="mt-9">
              <Ctas page={page} align="left" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function SplitHero({ page, toc }: { page: Page; toc: { id: string; label: string }[] }) {
  const rows = toc.slice(0, 4);
  return (
    <Container className="pt-16 md:pt-28">
      <div className="grid-12 items-center gap-y-14">
        <div className="col-span-4 md:col-span-7">
          <Pill page={page} align="left" />
          <SplitHeading as="h1" start="load" delay={0.1} className="font-display text-display-lg font-medium">
            {page.h1}
          </SplitHeading>
          <Lede page={page} className="mt-6 max-w-xl" />
          <div className="mt-9">
            <Ctas page={page} align="left" />
          </div>
        </div>
        {/* A fragment of the X1 surface, built only from this page's own section titles. */}
        <div className="col-span-4 md:col-span-5 md:col-start-8">
          <div data-card className="rounded-[var(--radius-tile)] bg-card p-4 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.55)] sm:p-5">
            <div className="flex items-center gap-3 px-1 pb-4">
              <X1Mark className="h-3 shrink-0 text-muted-foreground" />
              <span className="truncate text-data text-muted-foreground">{page.label || "X1"}</span>
              <span className="ml-auto shrink-0 font-mono text-data text-subtle">{pad(toc.length)} sections</span>
            </div>
            <ol className="flex flex-col gap-1">
              {rows.map((r, i) => (
                <li key={r.id}>
                  <TocLink
                    id={r.id}
                    className="flex min-h-11 items-baseline gap-4 rounded-[var(--radius-control)] bg-background/60 px-4 py-3 text-[0.875rem] leading-snug transition-colors duration-300 hover:bg-raised"
                  >
                    <span className="shrink-0 font-mono text-data text-subtle">§ {pad(i + 1)}</span>
                    <span className="text-foreground/85">{r.label}</span>
                  </TocLink>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex min-w-0 px-1">
              <SourceChip className="max-w-full" doc={(page.label || "X1") + " page"} locator={page.path} />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
