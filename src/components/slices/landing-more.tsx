// Page-end containers that keep landing pages short:
//   MoreOnThis  sections beyond the page's best few, folded into one accordion (each keeps its anchor id)
//   Footnotes   sources, methodology, caveats and illustration notes as a small numbered mono list
import { Container } from "@/components/brand/primitives";
import { Prose } from "@/components/slices/blocks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Chunk } from "@/lib/content";
import { More, pad, tidy } from "./landing-kit";

export function MoreOnThis({ chunks }: { chunks: Chunk[] }) {
  if (!chunks.length) return null;
  return (
    <section className="section-y-tight">
      <Container>
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-4">
            <h2 className="font-display text-display-md font-medium">More on this</h2>
          </div>
          <Accordion type="multiple" className="col-span-4 flex flex-col gap-2 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
            {chunks.map((c) => (
              <AccordionItem key={c.id} id={c.id} value={c.id} className="scroll-mt-24">
                <AccordionTrigger>{c.heading}</AccordionTrigger>
                <AccordionContent className="max-w-none">
                  <Prose blocks={tidy(c.blocks)} className="text-[0.9375rem] [&_h3]:mt-2 [&_h3]:text-base" />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}

export type Note = { label?: string; text: string };

export function Footnotes({ notes, id = "sources-and-notes" }: { notes: Note[]; id?: string }) {
  if (!notes.length) return null;
  const row = (n: Note, i: number) => (
    <li key={i} className="grid grid-cols-[2rem_1fr] gap-2">
      <span className="font-mono text-subtle">{pad(i + 1)}</span>
      <span className="text-pretty">
        {n.label && <span className="text-foreground/80">{n.label}. </span>}
        {n.text}
      </span>
    </li>
  );
  const shown = notes.slice(0, 4);
  const rest = notes.slice(4);
  return (
    <section id={id} className="scroll-mt-24 py-[calc(var(--section-y-tight)*0.6)]">
      <Container>
        <div className="grid-12 gap-y-4">
          <h2 className="col-span-4 text-data text-muted-foreground md:col-span-3">Sources and notes</h2>
          <div className="col-span-4 text-data leading-relaxed text-muted-foreground md:col-span-9 md:col-start-4 lg:col-span-7 lg:col-start-6">
            <ol className="flex flex-col gap-2.5">{shown.map(row)}</ol>
            {rest.length > 0 && (
              <More label={`${rest.length} more`} className="mt-1">
                <ol className="flex flex-col gap-2.5 pt-1">{rest.map((n, i) => row(n, i + 4))}</ol>
              </More>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
