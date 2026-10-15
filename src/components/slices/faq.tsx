// Questions and answers in the homepage FAQ's look (borderless card accordion). Variants:
//   center    centered heading over a 3xl accordion, like the homepage
//   split     heading and intro on cols 1-4, accordion on cols 6-12
//   glossary  a short-label definition list (an illustration, not answers) as a term grid, with any Q&A after
// Answers come from definition lists and from h3 + paragraph groups.
import type { SliceProps } from "@/components/slices/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Block, Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";
import { lead, SliceShell, SliceTitle, splitGroups, tidy } from "./landing-kit";

export type FaqVariant = "center" | "split" | "glossary";
type Props = SliceProps & { variant?: FaqVariant; motion?: boolean };
type QA = { q: string; a: string[] };

export function faqParts(chunk: Chunk) {
  const { intro, groups } = splitGroups(tidy(chunk.blocks));
  const leadText: string[] = [];
  const qa: QA[] = [];
  const pairs: { term: string; def: string }[] = [];
  for (const b of intro) {
    if (b.t === "p") leadText.push(b.text);
    if (b.t === "dl") {
      if (b.items.every((d) => d.def.length < 48)) pairs.push(...b.items);
      else qa.push(...b.items.map((d) => ({ q: d.term, a: [d.def] })));
    }
  }
  for (const g of groups) {
    const a = g.blocks.flatMap((b: Block) => (b.t === "p" ? [b.text] : b.t === "list" ? b.items.map((i) => i.join(" ")) : []));
    qa.push({ q: g.title, a });
  }
  return { lead: leadText, qa, pairs };
}

export function faqFits(chunk: Chunk): FaqVariant[] {
  const { pairs } = faqParts(chunk);
  return pairs.length ? ["glossary", "split", "center"] : ["center", "split"];
}

function QAList({ qa, compact }: { qa: QA[]; compact?: boolean }) {
  if (!qa.length) return null;
  return (
    <Accordion type="single" collapsible className="flex flex-col gap-2">
      {qa.map((f, i) => (
        <AccordionItem key={f.q + i} value={`${i}`}>
          <AccordionTrigger className={cn(compact && "md:text-base")}>{f.q}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-3">
            {f.a.map((t, k) => (
              <p key={k} className="text-pretty">
                {t}
              </p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function Glossary({ pairs }: { pairs: { term: string; def: string }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((p, i) => (
        <div key={i} className="rounded-[var(--radius)] bg-card px-5 py-5">
          <dt className="text-data text-muted-foreground">{p.def}</dt>
          <dd className="mt-2 font-medium tracking-tight">{p.term}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FaqSlice({ chunk, layout = "full", variant, motion }: Props) {
  const { lead: leadText, qa, pairs } = faqParts(chunk);
  const intro = leadText[0] ? lead(leadText[0]).first : undefined;

  if (layout === "article") {
    return (
      <SliceShell chunk={chunk} layout="article">
        <SliceTitle chunk={chunk} layout="article" className="mb-4" />
        {intro && <p className="mb-6 text-pretty text-muted-foreground">{intro}</p>}
        {pairs.length > 0 && (
          <div className="mb-6">
            <Glossary pairs={pairs} />
          </div>
        )}
        <QAList qa={qa} compact />
      </SliceShell>
    );
  }

  const v = variant ?? faqFits(chunk)[0];

  if (v === "split" || v === "glossary") {
    return (
      <SliceShell chunk={chunk}>
        <div className="grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-4">
            <div className="md:sticky md:top-28">
              <SliceTitle chunk={chunk} animate={motion} />
              {intro && <p className="mt-5 max-w-sm text-pretty text-muted-foreground">{intro}</p>}
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-8 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
            {v === "glossary" && pairs.length > 0 && <Glossary pairs={pairs} />}
            <QAList qa={qa} />
          </div>
        </div>
      </SliceShell>
    );
  }

  return (
    <SliceShell chunk={chunk}>
      <div className="mx-auto max-w-3xl">
        <SliceTitle chunk={chunk} align="center" animate={motion} className="mb-5" />
        {intro && <p className="mx-auto max-w-xl text-center text-pretty text-muted-foreground">{intro}</p>}
        {pairs.length > 0 && (
          <div className="mt-10">
            <Glossary pairs={pairs} />
          </div>
        )}
        <div className="mt-12 md:mt-14">
          <QAList qa={qa} />
        </div>
      </div>
    </SliceShell>
  );
}
