// Editorial article layout: resources, compare, statistics, blog, legal, author pages.
// 12-col grid: sticky "On this page" in cols 1-3, reading column in cols 5-11.
// Motion budget: hero entrance, progress fill, TOC pill. The body is static; rich slices own at most one moment each.
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/brand/primitives";
import { ArticleHero } from "@/components/slices/article-hero";
import { ArticleProgress } from "@/components/slices/article-progress";
import { ArticleToc, ArticleTocMobile } from "@/components/slices/article-toc";
import { isSourcesKind, shapeArticle, splitLong, splitNumbered, withoutPullQuote, type PullQuote, type ShapedArticle } from "@/components/slices/article-utils";
import { ItemText, Prose } from "@/components/slices/blocks";
import { Slice } from "@/components/slices/registry";
import { RelatedSlice } from "@/components/slices/related";
import { CtaBand } from "@/components/site/cta-band";
import type { Block, Chunk, Page } from "@/lib/content";

const RICH = new Set(["table", "stats", "ranked", "quote", "faq", "features", "steps", "checklist"]);
const READ = "text-[1.0625rem]";

/** A body heading. Numbered headings ("3. Envestnet Tamarac: …") show the number as a quiet index. */
function ChunkHeading({ chunk }: { chunk: Chunk }) {
  const { num, title } = splitNumbered(chunk.heading!);
  return (
    <header className="mb-6 max-w-[42rem]">
      {(num || chunk.eyebrow) && (
        <p className="mb-3 flex items-center gap-3 text-eyebrow text-muted-foreground">
          {num && <span className="font-mono text-data text-subtle tabular-nums">{num.padStart(2, "0")}</span>}
          {chunk.eyebrow}
        </p>
      )}
      <h2 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-medium tracking-[-0.03em] text-balance">{title}</h2>
    </header>
  );
}

/** Prose with a quiet "Continue reading" after the first two paragraphs when a section runs long. */
function LongProse({ blocks, collapse }: { blocks: Block[]; collapse: boolean }) {
  const { head, tail } = collapse ? splitLong(blocks) : { head: blocks, tail: [] };
  return (
    <div className="max-w-[42rem]">
      <Prose blocks={head} className={READ} />
      {tail.length > 0 && (
        <details className="group mt-5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-card py-2 pr-3 pl-4 text-[0.8125rem] text-muted-foreground transition-colors duration-300 select-none hover:bg-raised hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Continue reading</span>
            <span className="hidden group-open:inline">Show less</span>
            <ChevronDown className="size-3.5 transition-transform duration-500 ease-[var(--ease-out)] group-open:rotate-180" />
          </summary>
          <Prose blocks={tail} className={`mt-5 ${READ}`} />
        </details>
      )}
    </div>
  );
}

/** One strong sentence, lifted out of its paragraph and set large. */
function PullLine({ q }: { q: PullQuote }) {
  return (
    <p className="mt-2 mb-10 max-w-[38rem] font-display text-[clamp(1.375rem,2.6vw,2rem)] leading-[1.25] font-medium tracking-[-0.025em] text-balance md:mb-12">
      {q.sentence}
    </p>
  );
}

/** Tables with 4+ columns break out one column to the right on desktop (cols 5-12) instead of scrolling inside 42rem. */
const isWideTable = (c: Chunk) =>
  c.kind === "table" && c.blocks.some((b) => b.t === "table" && Math.max(b.head.length, b.rows[0]?.length ?? 0) >= 4);

function ChunkBody({ chunk, index, page, a }: { chunk: Chunk; index: number; page: Page; a: ShapedArticle }) {
  if (RICH.has(chunk.kind)) {
    // The template owns the h2 and the anchor id; the slice renders content only.
    const slice = <Slice chunk={{ ...chunk, heading: undefined, eyebrow: undefined, id: `${chunk.id}-content` }} index={index} page={page} layout="article" />;
    // Body spans 7 columns: one more column plus its gap is (100% + gap) / 7.
    return isWideTable(chunk) ? <div className="lg:mr-[calc((100%+var(--grid-gap))/-7)]">{slice}</div> : slice;
  }
  const q = a.pull?.chunkId === chunk.id ? a.pull : null;
  return (
    <>
      {q && <PullLine q={q} />}
      <LongProse blocks={q ? withoutPullQuote(chunk.blocks, q) : chunk.blocks} collapse={a.kind !== "legal"} />
    </>
  );
}

function Takeaways({ chunk }: { chunk: Chunk }) {
  const items = chunk.blocks.flatMap((b) => (b.t === "list" ? b.items : b.t === "p" ? [[b.text]] : []));
  return (
    <section id={chunk.id} className="scroll-mt-28 pb-14 md:pb-20">
      <div className="max-w-[42rem] rounded-[var(--radius-tile)] bg-card p-6 md:p-8">
        <h2 className="text-eyebrow text-muted-foreground">{chunk.heading}</h2>
        <ol className="mt-5 flex flex-col gap-4">
          {items.map((it, k) => (
            <li key={k} className="flex gap-4 text-[0.9375rem] leading-relaxed text-foreground/85">
              <span className="mt-[0.15rem] w-5 shrink-0 font-mono text-data leading-[1.75] text-subtle tabular-nums">{String(k + 1).padStart(2, "0")}</span>
              <ItemText lines={it} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Footnote type: small, muted, numbered. No cards, no icons. */
function Footnote({ chunk }: { chunk: Chunk }) {
  return (
    <div id={chunk.id} className="scroll-mt-28">
      <h2 className="mb-4 text-data font-medium text-muted-foreground">{chunk.heading}</h2>
      <div className="flex flex-col gap-3 text-[0.8125rem] leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
        {chunk.blocks.map((b, i) => {
          if (b.t === "list")
            return (
              <ol key={i} className="flex flex-col gap-1.5">
                {b.items.map((it, k) => (
                  <li key={k} className="flex gap-3">
                    <span className="w-5 shrink-0 font-mono text-data leading-[1.6] text-subtle tabular-nums">{k + 1}</span>
                    <span>{it.join(" ")}</span>
                  </li>
                ))}
              </ol>
            );
          if (b.t === "table" || b.t === "dl") return <Prose key={i} blocks={[b]} className="text-[0.8125rem]" />;
          if (b.t === "h1" || b.t === "h2") return null;
          return (
            <p key={i} className={b.t === "h3" || b.t === "h4" ? "mt-2 font-medium text-foreground" : "text-pretty"}>
              {b.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function Notes({ chunks, page }: { chunks: Chunk[]; page: Page }) {
  if (!chunks.length) return null;
  return (
    <div className="mt-6 flex max-w-[42rem] flex-col gap-10 pt-10 md:mt-10">
      {chunks.map((c, i) =>
        // The data agent's "sources" slice renders its own chunk; never render it twice.
        isSourcesKind(c) ? (
          <div key={c.id} id={c.id} className="scroll-mt-28 [overflow-wrap:anywhere]">
            <Slice chunk={{ ...c, id: `${c.id}-content` }} index={900 + i} page={page} layout="article" />
          </div>
        ) : (
          <Footnote key={c.id} chunk={c} />
        )
      )}
    </div>
  );
}

export function ArticleTemplate({ page }: { page: Page }) {
  const a = shapeArticle(page);
  const hasToc = a.toc.length >= 3;

  return (
    <>
      <ArticleProgress target="article-body" />
      <article>
        <ArticleHero page={page} a={a} />

        <Container className={a.kind === "legal" ? "pt-12 md:pt-16" : "pt-16 md:pt-24"}>
          <div className="grid-12">
            {hasToc && (
              <aside className="hidden lg:col-span-3 lg:block">
                <ArticleToc items={a.toc} />
              </aside>
            )}

            <div id="article-body" className="col-span-full min-w-0 lg:col-span-7 lg:col-start-5">
              {hasToc && (
                <div className="mb-10">
                  <ArticleTocMobile items={a.toc} />
                </div>
              )}

              {a.takeaways && <Takeaways chunk={a.takeaways} />}

              {a.intro && (
                <div className="pb-12 md:pb-16">
                  {RICH.has(a.intro.kind) ? (
                    <Slice chunk={{ ...a.intro, id: "overview-content" }} index={0} page={page} layout="article" />
                  ) : (
                    <div className="max-w-[42rem]">
                      <Prose blocks={a.intro.blocks} className={`${READ} [&>p:first-child]:text-lede [&>p:first-child]:text-foreground`} />
                    </div>
                  )}
                </div>
              )}

              {a.body.map((c, i) => (
                <section key={c.id} id={c.id} className="scroll-mt-28 py-10 first:pt-0 md:py-14">
                  {c.heading && <ChunkHeading chunk={c} />}
                  <ChunkBody chunk={c} index={i + 1} page={page} a={a} />
                </section>
              ))}

              <Notes chunks={a.notes} page={page} />
            </div>
          </div>
        </Container>
      </article>

      <RelatedSlice path={page.path} />
      <CtaBand />
    </>
  );
}
