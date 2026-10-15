// Layout pieces for the /design-system reference page. Server-safe (no hooks).
import type { CSSProperties, ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Section } from "@/components/brand/primitives";
import { cn } from "@/lib/utils";

/** One reference section: mono index, display title, lede, then content. Static heading: this page keeps to the motion budget (hero + live demos). */
export function DsSection({
  id,
  index,
  title,
  lede,
  children,
}: {
  id: string;
  index: string;
  title: string;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Section id={id} spacing="tight" className="scroll-mt-20">
      <div className="mb-12 flex flex-col gap-4 md:mb-16">
        <p className="font-mono text-data text-subtle">{index}</p>
        <h2 className="font-display text-display-md font-medium text-balance">{title}</h2>
        {lede && <p className="max-w-2xl text-lede text-muted-foreground text-pretty">{lede}</p>}
      </div>
      <div className="flex flex-col gap-14">{children}</div>
    </Section>
  );
}

/** Sub-heading inside a section. */
export function DsSub({ title, note, children, className }: { title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-title font-medium">{title}</h3>
        {note && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/**
 * Renders children in a fixed theme regardless of the page theme.
 * Dark: the .dark class. Light: the :root semantic layer re-applied inline (passed from globals.css by the page).
 */
export function ThemeScope({
  theme,
  lightVars,
  className,
  children,
}: {
  theme: "light" | "dark";
  lightVars: Record<string, string>;
  className?: string;
  children: ReactNode;
}) {
  if (theme === "dark") return <div className={cn("dark bg-background text-foreground [color-scheme:dark]", className)}>{children}</div>;
  return (
    <div style={lightVars as CSSProperties} className={cn("bg-background text-foreground [color-scheme:light]", className)}>
      {children}
    </div>
  );
}

/** Monospace snippet on a card surface. */
export function CodeBlock({ children, className }: { children: string; className?: string }) {
  return (
    <pre className={cn("overflow-x-auto whitespace-pre-wrap break-words rounded-[var(--radius)] bg-card px-5 py-4 font-mono text-data leading-relaxed text-foreground/85", className)}>
      <code>{children}</code>
    </pre>
  );
}

/** Inline token name. */
export function Tok({ children }: { children: ReactNode }) {
  return <code className="rounded-[var(--radius-control)] bg-raised px-1.5 py-0.5 font-mono text-data text-foreground">{children}</code>;
}

/** A do / don't pair. */
export function Rule({ kind, title, children, className }: { kind: "do" | "dont"; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-[var(--radius-tile)] bg-card p-6", kind === "dont" && "hatch", className)}>
      {children && <div className="flex min-h-28 items-center justify-center rounded-[var(--radius)] bg-background p-6">{children}</div>}
      <p className="flex items-start gap-2.5 text-sm leading-relaxed">
        <span
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
            kind === "do" ? "bg-primary text-primary-foreground" : "bg-raised text-muted-foreground"
          )}
        >
          {kind === "do" ? <Check className="size-3" /> : <X className="size-3" />}
        </span>
        <span>
          <span className="font-medium">{kind === "do" ? "Do. " : "Don't. "}</span>
          <span className="text-muted-foreground">{title}</span>
        </span>
      </p>
    </div>
  );
}

/**
 * Spec table: a real table from md up, stacked label/value cards on phones
 * (labels above values, never squeezed side by side). First column is the key, rendered in mono.
 */
export function SpecTable({ head, rows, mono = [] }: { head: string[]; rows: ReactNode[][]; mono?: number[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[var(--radius-tile)] bg-card md:block">
        <table className="w-full text-left text-[0.8125rem]">
          <thead className="bg-raised/60">
            <tr>
              {head.map((h) => (
                <th key={h} className="px-5 py-3.5 font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="even:bg-raised/30">
                {r.map((c, j) => (
                  <td
                    key={j}
                    className={cn(
                      "px-5 py-3 align-top",
                      j === 0 || mono.includes(j) ? "font-mono text-data" : "text-muted-foreground",
                      j > 0 && mono.includes(j) && "text-muted-foreground tabular-nums"
                    )}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-col gap-2 md:hidden">
        {rows.map((r, i) => (
          <li key={i} className="flex flex-col gap-3 rounded-[var(--radius)] bg-card p-5">
            <span className="font-mono text-data text-foreground">{r[0]}</span>
            {r.slice(1).map((c, j) =>
              c === "" || c === null ? null : (
                <span key={j} className="flex flex-col gap-0.5">
                  <span className="text-data text-subtle">{head[j + 1]}</span>
                  <span className={cn("text-[0.8125rem] break-words", mono.includes(j + 1) ? "font-mono text-data text-muted-foreground" : "text-muted-foreground")}>{c}</span>
                </span>
              )
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
