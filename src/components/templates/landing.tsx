// Landing template. The composer (slices/landing-compose.ts) decides everything per page: which hero,
// which variant each section gets, what folds into "More on this", what moves to the footnotes, and which
// two or three moments are allowed to move. This file only renders the plan.
import { ChecklistSlice, type ChecklistVariant } from "@/components/slices/checklist";
import { FaqSlice, type FaqVariant } from "@/components/slices/faq";
import { FeaturesSlice, type FeaturesVariant } from "@/components/slices/features";
import { planLanding, type Unit } from "@/components/slices/landing-compose";
import { Footnotes, MoreOnThis } from "@/components/slices/landing-more";
import { PillarsSlice } from "@/components/slices/landing-pillars";
import { PageHero } from "@/components/slices/page-hero";
import { ProseSlice, type ProseVariant } from "@/components/slices/prose";
import { Slice } from "@/components/slices/registry";
import { RelatedSlice } from "@/components/slices/related";
import { StatementSlice, type StatementVariant } from "@/components/slices/statement";
import { StepsSlice, type StepsVariant } from "@/components/slices/steps";
import { CtaBand } from "@/components/site/cta-band";
import type { Page } from "@/lib/content";

function render(u: Unit, page: Page) {
  if (u.t === "pillars") return <PillarsSlice key={u.key} chunks={u.chunks} page={page} variant={u.variant} motion={u.motion} />;
  const p = { chunk: u.chunk, index: u.index, page, layout: "full" as const, motion: u.motion };
  switch (u.kind) {
    case "prose":
      return <ProseSlice key={u.key} {...p} variant={u.variant as ProseVariant} />;
    case "statement":
      return <StatementSlice key={u.key} {...p} variant={u.variant as StatementVariant} />;
    case "features":
      return <FeaturesSlice key={u.key} {...p} variant={u.variant as FeaturesVariant} />;
    case "steps":
      return <StepsSlice key={u.key} {...p} variant={u.variant as StepsVariant} />;
    case "checklist":
      return <ChecklistSlice key={u.key} {...p} variant={u.variant as ChecklistVariant} />;
    case "faq":
      return <FaqSlice key={u.key} {...p} variant={u.variant as FaqVariant} />;
    default:
      return <Slice key={u.key} chunk={u.chunk} index={u.index} page={page} layout="full" />;
  }
}

export function LandingTemplate({ page }: { page: Page }) {
  const plan = planLanding(page);
  return (
    <>
      <PageHero page={page} variant={plan.hero} />
      {plan.units.map((u) => render(u, page))}
      <MoreOnThis chunks={plan.more} />
      <Footnotes notes={plan.notes} />
      {plan.sources.map((c) => (
        <Slice key={c.id} chunk={c} index={page.chunks.indexOf(c)} page={page} layout="full" />
      ))}
      <RelatedSlice path={page.path} />
      {plan.closing ? (
        <CtaBand
          title={plan.closing.title}
          body={plan.closing.body}
          {...(plan.closing.primary ? { primary: plan.closing.primary } : {})}
        />
      ) : (
        <CtaBand />
      )}
    </>
  );
}
