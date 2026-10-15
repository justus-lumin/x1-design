import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { SplitHeading } from "@/components/motion/split-heading";
import { cn } from "@/lib/utils";

/** Every slice is a Section. It owns vertical rhythm so spacing never drifts between pages. */
export function Section({
  children,
  className,
  spacing = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  spacing?: "default" | "tight" | "none";
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative", spacing === "default" && "section-y", spacing === "tight" && "section-y-tight", className)}
    >
      {children}
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("container-x1", className)}>{children}</div>;
}

/** Small label above a heading. Sentence case, never letterspaced caps. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-eyebrow text-muted-foreground", className)}>{children}</p>;
}

/**
 * Provenance chip. The most important small component in the system:
 * every fact shown on an X1 surface points back to the document it came from, and how old it is.
 * Unconfirmed facts are hatched, never outlined.
 */
export function SourceChip({
  doc,
  locator,
  asOf,
  pending,
  className,
}: {
  doc: string;
  locator?: string;
  asOf?: string;
  pending?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full bg-raised py-1 pr-3 pl-1 text-data text-muted-foreground",
        pending && "hatch",
        className
      )}
    >
      <span className="grid size-5 place-items-center rounded-full bg-background text-foreground">
        <FileText className="size-3" strokeWidth={1.75} />
      </span>
      <span className="shrink-0 font-medium text-foreground">{doc}</span>
      {locator && <span className="min-w-0 truncate font-mono">{locator}</span>}
      {asOf && <span className="hidden shrink-0 font-mono text-subtle sm:inline">· {asOf}</span>}
    </span>
  );
}

/** Centered heading block used at the top of most slices. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  className,
  titleAs = "h2",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  titleAs?: "h1" | "h2";
}) {
  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center text-center", className)}>
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      <SplitHeading as={titleAs} className="font-display text-display-md font-medium">
        {title}
      </SplitHeading>
      {lede && <p className="mt-5 max-w-xl text-lede text-muted-foreground text-pretty">{lede}</p>}
    </div>
  );
}
