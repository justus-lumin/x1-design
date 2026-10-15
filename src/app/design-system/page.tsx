import type { Metadata } from "next";
import { GrainShader } from "@/components/brand/grain-shader";
import { X1Mark } from "@/components/brand/logo";
import { Container, Eyebrow } from "@/components/brand/primitives";
import { Components, DoDont, Slices, type SliceRow, type TemplateRow } from "@/components/design-system/catalog";
import { readCssTokens } from "@/components/design-system/css-tokens";
import { Color, Layout, Logo, Principles, Radii, Surfaces, Typography } from "@/components/design-system/foundations";
import { DsNav } from "@/components/design-system/live";
import { MotionDemos, MotionTokens } from "@/components/design-system/motion-demos";
import { CodeBlock, DsSection, DsSub, SpecTable, Tok } from "@/components/design-system/parts";
import { ShaderLab } from "@/components/design-system/shader-lab";
import { BlurHeading } from "@/components/motion/blur-heading";
import { planLanding } from "@/components/slices/landing-compose";
import { allPaths, getPage, type Page, type SliceKind, type Template } from "@/lib/content";

export const metadata: Metadata = {
  title: "Design system",
  description: "The X1 Wealth design system: soft monochrome tokens, type, grid, components, the grain shader, motion and the SEO slice catalog.",
};

const NAV = [
  { id: "principles", label: "Principles" },
  { id: "logo", label: "Logo" },
  { id: "color", label: "Color" },
  { id: "type", label: "Typography" },
  { id: "layout", label: "Spacing and grid" },
  { id: "radii", label: "Radii" },
  { id: "surfaces", label: "Surfaces" },
  { id: "components", label: "Components" },
  { id: "shader", label: "Grain shader" },
  { id: "motion", label: "Motion" },
  { id: "slices", label: "Slice catalog" },
  { id: "rules", label: "Do and don't" },
];

// Summarizes classify() in lib/content.ts (first match wins) and the variants each slice offers.
const SLICE_RULES: { kind: SliceKind; when: string; variants: string }[] = [
  { kind: "sources", when: "Heading is reference material: Sources, Methodology, Disclaimer, Cite this.", variants: "Numbered mono footnotes" },
  { kind: "faq", when: "A definition list that carries the chunk, or 3+ question h3s with answers.", variants: "center · split · glossary" },
  { kind: "table", when: "The chunk has a table.", variants: "bars · banded · tile" },
  { kind: "ranked", when: "Most h3s start with a number (\"1. \", \"2) \").", variants: "leaderboard · tabs · rows" },
  { kind: "quote", when: "One or two short quotes in a short chunk.", variants: "testimonial · pair · pull" },
  { kind: "stats", when: "3+ list items that read as statistics.", variants: "strip · hero · ledger" },
  { kind: "features", when: "Two or more h3s.", variants: "bento · tabs · contrast · list · plans · ledger" },
  { kind: "steps", when: "An ordered list with three or more items.", variants: "carousel · timeline · numerals" },
  { kind: "checklist", when: "Any list with three or more items, or a related-links list.", variants: "rows · prompts · pills" },
  { kind: "statement", when: "At most one paragraph, under 220 characters.", variants: "scrub · band · quiet · note" },
  { kind: "prose", when: "Everything else, including long essays with quotes or a buried dl.", variants: "split · quote · column · lead" },
];

const TEMPLATE_INFO: Record<Template, string> = {
  landing: "Composed by planLanding(): one of five heroes picked by position among siblings, no variant twice, at most 6 sections then a More on this fold, 3 signature moments, Sources and notes footnotes.",
  article: "A hero per category (editorial, X vs Y, lead figure, plain, name-led), sticky TOC pill, progress bar, one pull line, Continue reading folds over 350 words, wide tables break out.",
  hub: "Index pages. Each hub has its own masthead and index shape: library, A vs B rows, headline figure, tool grid, product split, featured piece, people.",
};

function catalog() {
  const pages = allPaths()
    .map((p) => getPage(p))
    .filter((p): p is Page => !!p);
  // What the landing composer actually picked, across every landing page.
  const used = new Map<string, number>();
  const heroes = new Map<string, number>();
  for (const p of pages.filter((p) => p.template === "landing")) {
    const plan = planLanding(p);
    heroes.set(plan.hero, (heroes.get(plan.hero) ?? 0) + 1);
    for (const u of plan.units) {
      const key = u.t === "pillars" ? `pillars:${u.variant}` : `${u.kind}:${u.variant ?? ""}`;
      used.set(key, (used.get(key) ?? 0) + 1);
    }
  }
  const inUse = (kind: string) =>
    [...used.entries()]
      .filter(([k]) => k.startsWith(`${kind}:`) && !k.endsWith(":"))
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k.split(":")[1]} ${n}`)
      .join(" · ");
  const slices: SliceRow[] = SLICE_RULES.map(({ kind, when, variants }) => {
    const using = pages.filter((p) => p.chunks.some((c) => c.kind === kind));
    // Prefer a landing page as the example, since it shows the full-width slice.
    const ex = using.find((p) => p.template === "landing") ?? using[0];
    return {
      kind,
      when,
      variants,
      inUse: inUse(kind),
      count: pages.reduce((n, p) => n + p.chunks.filter((c) => c.kind === kind).length, 0),
      example: ex && { path: ex.path, title: ex.h1 },
    };
  });
  const templates: TemplateRow[] = (["landing", "article", "hub"] as Template[]).map((t) => {
    const using = pages.filter((p) => p.template === t);
    const ex = using.find((p) => p.chunks.length >= 4) ?? using[0];
    return { name: t, when: TEMPLATE_INFO[t], count: using.length, example: ex && { path: ex.path, title: ex.h1 } };
  });
  const heroUse = [...heroes.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(" · ");
  const pillars = inUse("pillars");
  return { slices, templates, heroUse, pillars };
}

export default function DesignSystemPage() {
  const tokens = readCssTokens();
  const { slices, templates, heroUse, pillars } = catalog();

  return (
    <>
      <Container className="flex flex-col gap-10 pt-16 md:pt-28">
        <div className="flex max-w-3xl flex-col gap-6">
          <Eyebrow>Design system · soft monochrome</Eyebrow>
          <BlurHeading className="font-display text-display-xl font-medium">Calm, sourced, yours.</BlurHeading>
          <p className="max-w-xl text-lede text-muted-foreground text-pretty">
            The living reference for X1 Wealth. Everything on this page renders from the same tokens and components as the site. The handoff kit for
            coding agents lives in <Tok>design-system/</Tok> at the repo root.
          </p>
        </div>
        <div className="relative isolate h-[18rem] overflow-hidden rounded-[var(--radius-tile)] md:h-[26rem]">
          <GrainShader angle={35} light={0.5} folds={0.7} interactive />
          <div className="relative flex h-full flex-col justify-between p-6 md:p-10">
            <div className="flex flex-wrap gap-2">
              {["Manrope", "Inter", "JetBrains Mono", "12 columns", "No borders"].map((t) => (
                <span key={t} className="rounded-full bg-background/60 px-3 py-1 text-data text-muted-foreground backdrop-blur">
                  {t}
                </span>
              ))}
            </div>
            <X1Mark className="h-12 self-end md:h-20" />
          </div>
        </div>
      </Container>

      <Container>
        <div className="grid-12">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="h-full pt-[var(--section-y-tight)]">
              <DsNav items={NAV} />
            </div>
          </aside>
          <div className="col-span-4 min-w-0 md:col-span-12 lg:col-span-9">
            <Principles />
            <Logo tokens={tokens} />
            <Color tokens={tokens} />
            <Typography tokens={tokens} />
            <Layout tokens={tokens} />
            <Radii tokens={tokens} />
            <Surfaces tokens={tokens} />
            <Components />

            <DsSection
              id="shader"
              index="09"
              title="Grain shader"
              lede="Soft folds of light with static film grain, raw WebGL1 in components/brand/grain-shader.tsx. A context exists only near the viewport, a CSS light pool and grain sit underneath as the fallback, and reduced motion gets one still frame. At most two per page."
            >
              <ShaderLab />
              <DsSub title="Props">
                <SpecTable
                  head={["Prop", "Default", "Range", "Effect"]}
                  mono={[1, 2]}
                  rows={[
                        ["angle", "35", "0 to 360", "Direction the light comes from, degrees. 0 = right, 90 = top"],
                        ["light", "0.5", "0 to 1", "How much of the field is lit"],
                        ["folds", "0.7", "0 to 1", "Contrast of the two drifting creases"],
                        ["grain", "0.09", "0 to 0.2", "Static film grain, fixed to the pixel grid"],
                        ["interactive", "false", "boolean", "Light pools toward the pointer over the parent element"],
                        ["speed", "1", "0 to 3", "Multiplier on the slow drift"],
                        ["className", "", "string", "Classes for the absolute inset-0 wrapper"],
                      ]}
                />
              </DsSub>
            </DsSection>

            <DsSection
              id="motion"
              index="10"
              title="Motion"
              lede="GSAP 3.13 with ScrollTrigger and SplitText, registered once in lib/gsap.ts. Slow expo.out entrances, masked line rises, blur-to-focus for the hero, scrubbed scenes for explanations. Everything is skipped under prefers-reduced-motion."
            >
              <MotionDemos />
              <DsSub title="Tokens" note={<>Exported as <Tok>motion</Tok> from lib/gsap.ts. CSS transitions use <Tok>var(--ease-out)</Tok>.</>}>
                <MotionTokens />
              </DsSub>
              <DsSub title="Setup">
                <CodeBlock>{`"use client";
import { gsap, motion, prefersReducedMotion, useGSAP } from "@/lib/gsap"; // never from "gsap"

useGSAP(() => {
  if (prefersReducedMotion()) return;
  gsap.from("[data-card]", {
    autoAlpha: 0, y: motion.distance,
    duration: motion.dur.base, ease: motion.ease, stagger: motion.stagger,
    scrollTrigger: { trigger: "[data-cards]", start: "top 80%", once: true },
  });
}, { scope: root });`}</CodeBlock>
              </DsSub>
            </DsSection>

            <Slices slices={slices} templates={templates} heroUse={heroUse} pillars={pillars} />
            <DoDont />
          </div>
        </div>
      </Container>
    </>
  );
}
