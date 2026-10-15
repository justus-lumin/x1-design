// Shared shell for the data slices. layout "full" owns a section on the 12-col grid; "article" fits the reading column.
// Headings are static on purpose: the page's motion budget is spent elsewhere.
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/brand/primitives";
import type { Chunk } from "@/lib/content";
import { cn } from "@/lib/utils";

export type DataLayout = "full" | "article";

export function DataHeading({ chunk, layout, center }: { chunk: Chunk; layout: DataLayout; center?: boolean }) {
  if (!chunk.heading && !chunk.eyebrow) return null;
  return (
    <header className={cn("flex flex-col", layout === "full" ? "max-w-2xl" : "max-w-[42rem]", center && "mx-auto items-center text-center")}>
      {chunk.eyebrow && <Eyebrow className={layout === "full" ? "mb-5" : "mb-3"}>{chunk.eyebrow}</Eyebrow>}
      {chunk.heading && (
        <h2
          className={cn(
            "font-display font-medium text-balance",
            layout === "full" ? "text-display-md" : "text-[1.625rem] leading-[1.15] tracking-[-0.03em] md:text-[1.875rem]"
          )}
        >
          {chunk.heading}
        </h2>
      )}
    </header>
  );
}

/** Section + Container + rhythm for "full"; a bare anchor block for "article". */
export function DataFrame({
  chunk,
  layout = "full",
  center,
  children,
  className,
}: {
  chunk: Chunk;
  layout?: DataLayout;
  center?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const hasHead = !!(chunk.heading || chunk.eyebrow);
  if (layout === "article") {
    return (
      <div id={chunk.id} className={cn("scroll-mt-28", className)}>
        <DataHeading chunk={chunk} layout="article" center={center} />
        <div className={cn(hasHead && "mt-6")}>{children}</div>
      </div>
    );
  }
  return (
    <section id={chunk.id} className={cn("section-y-tight scroll-mt-16", className)}>
      <Container>
        <div className="grid-12">
          <div className="col-span-4 md:col-span-10 md:col-start-2">
            <DataHeading chunk={chunk} layout="full" center={center} />
            <div className={cn(hasHead && "mt-10 md:mt-14")}>{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** A quiet "More" disclosure for long explanations. Content stays in the HTML. */
export function Disclosure({ label = "More context", children, className }: { label?: string; children: ReactNode; className?: string }) {
  return (
    <details className={cn("group/more", className)}>
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-full bg-card px-3.5 text-[0.8125rem] text-muted-foreground transition-colors duration-300 select-none hover:bg-raised hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="group-open/more:hidden">{label}</span>
        <span className="hidden group-open/more:inline">Less</span>
        <span aria-hidden className="text-subtle transition-transform duration-300 group-open/more:rotate-45">+</span>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}
