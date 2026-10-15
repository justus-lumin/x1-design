// Article heroes. One family, five voices: editorial (resources), lockup (compare), figure (statistics),
// plain (legal) and name-led (blog, author). Same grid, same meta line, visibly different lead.
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Container, SourceChip } from "@/components/brand/primitives";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button } from "@/components/ui/button";
import { resolveHref, type Page } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ArticleHeroMotion } from "./article-motion";
import { compareLockup, firstSentence, hideUntilReady, leadFigure, type ShapedArticle } from "./article-utils";

type HeroProps = { page: Page; a: ShapedArticle };

/** data-ar-hero + hidden-before-hydration, unless the variant is static. */
const part = (still?: boolean) => (still ? {} : { "data-ar-hero": true, className: hideUntilReady });

function BackLink({ a, still }: { a: ShapedArticle; still?: boolean }) {
  if (!a.hub) return null;
  const p = part(still);
  const cls = "inline-flex items-center gap-2 text-data text-muted-foreground transition-colors duration-300 hover:text-foreground";
  return (
    <div {...p} className={cn(p.className, "col-span-full lg:col-span-3 lg:pt-2")}>
      {a.hub.href ? (
        <Link href={a.hub.href} className={cn("group py-2", cls)}>
          <ArrowLeft className="size-3 transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-x-0.5" />
          {a.hub.label}
        </Link>
      ) : (
        <span className={cls}>{a.hub.label}</span>
      )}
    </div>
  );
}

function Meta({ page, a, still, author = true }: HeroProps & { still?: boolean; author?: boolean }) {
  const p = part(still);
  const by = author && a.meta.author && a.meta.author.href !== page.path ? a.meta.author : undefined;
  return (
    <p {...p} className={cn(p.className, "mt-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-data text-muted-foreground")}>
      {by && (
        <span>
          By{" "}
          {by.href ? (
            <Link href={by.href} className="text-foreground transition-colors hover:text-muted-foreground">
              {by.name}
            </Link>
          ) : (
            <span className="text-foreground">{by.name}</span>
          )}
        </span>
      )}
      {a.meta.updated && (
        <span>
          Updated{" "}
          {a.meta.updated.iso ? (
            <time dateTime={a.meta.updated.iso} className="text-foreground">
              {a.meta.updated.text}
            </time>
          ) : (
            <span className="text-foreground">{a.meta.updated.text}</span>
          )}
        </span>
      )}
      <span className="whitespace-nowrap">
        <span className="text-foreground">{a.minutes} min</span> read
      </span>
    </p>
  );
}

function Downloads({ page }: { page: Page }) {
  const downloads = page.ctas.filter((c) => /^download/i.test(c.text));
  if (!downloads.length) return null;
  return (
    <div data-ar-hero className={cn(hideUntilReady, "mt-6 flex flex-wrap gap-2")}>
      {downloads.map((c) => (
        <Button key={c.href} variant="secondary" size="sm" asChild>
          <a href={resolveHref(c.href)}>
            {c.text}
            <ArrowUpRight className="size-3.5 transition-transform duration-500 ease-[var(--ease-out)] group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5" />
          </a>
        </Button>
      ))}
    </div>
  );
}

const lede = (page: Page, a: ShapedArticle) => page.lede ?? a.meta.extraLede;

/** Resources: editorial. Title, one lede, the meta line. */
function EditorialHero({ page, a }: HeroProps) {
  const l = lede(page, a);
  return (
    <>
      <BackLink a={a} />
      <div className="col-span-full lg:col-span-8 lg:col-start-5">
        <SplitHeading as="h1" start="load" className="font-display text-display-lg font-medium">
          {page.h1}
        </SplitHeading>
        {l && (
          <p data-ar-hero className={cn(hideUntilReady, "mt-6 max-w-[38rem] text-lede text-muted-foreground text-pretty")}>
            {l}
          </p>
        )}
        <Meta page={page} a={a} />
      </div>
    </>
  );
}

/** Compare: the two products (or "X alternatives") set as type, with a one-sentence verdict from the lede. */
function CompareHero({ page, a }: HeroProps) {
  const lock = compareLockup(page.h1);
  if (!lock) return <EditorialHero page={page} a={a} />;
  const l = lede(page, a);
  const verdict = l ? (firstSentence(l.replace(/^answer(?: \(\d{4}\))?:\s*/i, ""), 20, 240)?.sentence ?? l) : undefined;
  const big = "font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-medium tracking-[-0.045em] [overflow-wrap:anywhere]";
  return (
    <>
      <BackLink a={a} />
      <div className="col-span-full lg:col-span-8 lg:col-start-5">
        <h1 className="sr-only">{page.h1}</h1>
        <div aria-hidden>
          {lock.kind === "vs" ? (
            <>
              <p data-ar-hero className={cn(hideUntilReady, big)}>
                {lock.a}
              </p>
              <p data-ar-hero className={cn(hideUntilReady, "mt-1 flex flex-wrap items-center gap-x-4", big)}>
                <span className="mt-[0.12em] inline-grid h-8 shrink-0 place-items-center rounded-full bg-card px-3 font-sans text-[0.8125rem] font-normal tracking-normal text-muted-foreground">
                  vs
                </span>
                <span className="text-muted-foreground">{lock.b}</span>
              </p>
            </>
          ) : (
            <>
              <p data-ar-hero className={cn(hideUntilReady, "flex items-start gap-4", big)}>
                {lock.count && (
                  <span className="mt-[0.3em] inline-grid h-8 shrink-0 place-items-center rounded-full bg-card px-3 font-mono text-[0.8125rem] font-normal tracking-normal text-muted-foreground tabular-nums">
                    {lock.count}
                  </span>
                )}
                <span>{lock.product}</span>
              </p>
              <p data-ar-hero className={cn(hideUntilReady, "mt-1 text-muted-foreground", big)}>
                alternatives
              </p>
            </>
          )}
          {lock.rest && (
            <p data-ar-hero className={cn(hideUntilReady, "mt-6 text-eyebrow text-muted-foreground")}>
              {lock.rest}
            </p>
          )}
        </div>
        {verdict && (
          <p data-ar-hero className={cn(hideUntilReady, "mt-8 max-w-[36rem] text-lede text-foreground/85 text-pretty")}>
            {verdict}
          </p>
        )}
        <Meta page={page} a={a} />
      </div>
    </>
  );
}

/** Statistics: lead with one figure and where it comes from. The title follows, smaller. */
function StatisticsHero({ page, a }: HeroProps) {
  const fig = leadFigure(page.chunks);
  const l = lede(page, a);
  // Chips never truncate: the section name is kept only when it is short.
  const locator = fig?.locator?.replace(/\s*\([^)]*\)/g, "").replace(/["“”]/g, "").trim();
  const loc = locator && locator.length <= 22 ? locator : undefined;
  const sourcesId = a.notes.find((c) => /^sources?$/i.test(c.heading ?? ""))?.id;
  return (
    <>
      <BackLink a={a} />
      <div className="col-span-full lg:col-span-8 lg:col-start-5">
        {fig && (
          <figure data-ar-hero className={cn(hideUntilReady, "mb-12 md:mb-16")}>
            <p
              className={cn(
                "font-display font-medium leading-[0.9] tracking-[-0.055em] text-balance",
                fig.figure.length > 7 ? "text-[clamp(3rem,8vw,6.5rem)]" : "text-[clamp(4.5rem,12vw,9rem)]"
              )}
            >
              {fig.figure}
            </p>
            <figcaption className="mt-4 flex max-w-[34rem] flex-col items-start gap-4">
              <span className="text-lede text-foreground/85 text-pretty">{fig.text}</span>
              {fig.source ? (
                <SourceChip doc={fig.source} locator={loc} className="max-w-full" />
              ) : sourcesId ? (
                <a href={`#${sourcesId}`} className="flex max-w-full min-w-0 rounded-full transition-opacity hover:opacity-80">
                  <SourceChip doc="Sources" locator={loc} className="max-w-full" />
                </a>
              ) : null}
            </figcaption>
          </figure>
        )}
        <SplitHeading as="h1" start="load" delay={fig ? 0.2 : 0} className={cn("font-display font-medium", fig ? "text-display-md" : "text-display-lg")}>
          {page.h1}
        </SplitHeading>
        {l && (
          <p data-ar-hero className={cn(hideUntilReady, "mt-5 max-w-[38rem] text-lede text-muted-foreground text-pretty")}>
            {l}
          </p>
        )}
        <Meta page={page} a={a} />
        <Downloads page={page} />
      </div>
    </>
  );
}

/** Legal: plain, compact, still. */
function LegalHero({ page, a }: HeroProps) {
  return (
    <>
      <BackLink a={a} still />
      <div className="col-span-full lg:col-span-8 lg:col-start-5">
        <h1 className="font-display text-display-md font-medium text-balance">{page.h1}</h1>
        {page.lede && <p className="mt-4 max-w-[38rem] text-muted-foreground text-pretty">{page.lede}</p>}
        <Meta page={page} a={a} still />
      </div>
    </>
  );
}

/** Blog and author: name-led. The title runs the full width, the rest sits on the reading column. */
function PersonHero({ page, a }: HeroProps) {
  const l = lede(page, a);
  const isAuthor = page.category === "author";
  return (
    <>
      <div className="col-span-full">
        <BackLinkInline a={a} />
        <SplitHeading
          as="h1"
          start="load"
          className={cn("mt-6 font-display font-medium md:mt-10", page.h1.length <= 40 ? "max-w-[16ch] text-display-xl" : "max-w-[24ch] text-display-lg")}
        >
          {page.h1}
        </SplitHeading>
      </div>
      <div className="col-span-full mt-4 md:mt-8 lg:col-span-7 lg:col-start-5">
        {l && (
          <p data-ar-hero className={cn(hideUntilReady, "text-lede text-muted-foreground text-pretty")}>
            {l}
          </p>
        )}
        <Meta page={page} a={a} author={!isAuthor} />
      </div>
    </>
  );
}

function BackLinkInline({ a }: { a: ShapedArticle }) {
  if (!a.hub) return null;
  return (
    <div data-ar-hero className={hideUntilReady}>
      {a.hub.href ? (
        <Link href={a.hub.href} className="group inline-flex items-center gap-2 py-2 text-data text-muted-foreground transition-colors duration-300 hover:text-foreground">
          <ArrowLeft className="size-3 transition-transform duration-500 ease-[var(--ease-out)] group-hover:-translate-x-0.5" />
          {a.hub.label}
        </Link>
      ) : (
        <span className="text-data text-muted-foreground">{a.hub.label}</span>
      )}
    </div>
  );
}

export function ArticleHero({ page, a }: HeroProps) {
  const Variant = { resources: EditorialHero, compare: CompareHero, statistics: StatisticsHero, legal: LegalHero, person: PersonHero }[a.kind];
  const grid = <div className="grid-12 gap-y-6">{<Variant page={page} a={a} />}</div>;
  return (
    <Container className={a.kind === "legal" ? "pt-16 md:pt-20" : "pt-20 md:pt-28"}>
      {a.kind === "legal" ? grid : <ArticleHeroMotion>{grid}</ArticleHeroMotion>}
    </Container>
  );
}
