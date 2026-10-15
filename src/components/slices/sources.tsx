// Sources slice: Sources, Methodology, Compliance note, Cite this page. Reference material, so it stays quiet:
// a compact numbered footnote list in small mono text, notes in small muted type. No cards, no icons, no motion.
import { Container } from "@/components/brand/primitives";
import type { SliceProps } from "@/components/slices/types";
import type { Block } from "@/lib/content";
import { cn } from "@/lib/utils";

/** "Cerulli Associates: $124T estimate" → publisher and title; "— note" tails become a quieter remark. */
function Entry({ lines }: { lines: string[] }) {
  const [first, ...rest] = lines;
  const note = rest.join(" ").replace(/^[—–-]\s*/, "");
  const c = first.indexOf(": ");
  const pub = c > 0 && c < 48 ? first.slice(0, c) : null;
  return (
    <span className="min-w-0 text-pretty">
      {pub ? (
        <>
          <span className="text-foreground/85">{pub}</span>
          <span className="text-muted-foreground">: {first.slice(c + 2)}</span>
        </>
      ) : (
        <span className="text-foreground/85">{first}</span>
      )}
      {note && <span className="text-subtle"> · {note}</span>}
    </span>
  );
}

function Notes({ blocks }: { blocks: Block[] }) {
  let n = 0;
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((b, i) => {
        if (b.t === "list") {
          return (
            <ol key={i} className="flex flex-col gap-2.5 font-mono text-[0.75rem] leading-[1.6]">
              {b.items.map((it, k) => (
                <li key={k} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-2">
                  <span className="text-subtle tabular-nums">[{++n}]</span>
                  <Entry lines={it} />
                </li>
              ))}
            </ol>
          );
        }
        if (b.t === "table" || b.t === "dl" || b.t === "quote") return null;
        const text = b.text;
        // Short label lines ("Citation Policy", "Update Cadence") read as small headers.
        if (b.t !== "p" || (text.length <= 32 && !/[.?!]$/.test(text))) {
          return (
            <p key={i} className="mt-2 text-data font-medium text-foreground/80 first:mt-0">
              {text}
            </p>
          );
        }
        return (
          <p key={i} className="text-[0.8125rem] leading-relaxed text-muted-foreground text-pretty">
            {text}
          </p>
        );
      })}
    </div>
  );
}

export function SourcesSlice({ chunk, layout = "full" }: SliceProps) {
  if (layout === "article") {
    return (
      <div id={chunk.id} className="scroll-mt-28">
        {chunk.heading && <h2 className="mb-4 text-data font-medium text-muted-foreground">{chunk.heading}</h2>}
        <Notes blocks={chunk.blocks} />
      </div>
    );
  }
  return (
    <section id={chunk.id} className="scroll-mt-16 py-10 md:py-12">
      <Container>
        <div className="grid-12 gap-y-4">
          <h2 className={cn("col-span-4 text-data font-medium text-muted-foreground md:col-span-3 md:col-start-2")}>{chunk.heading}</h2>
          <div className="col-span-4 md:col-span-7">
            <Notes blocks={chunk.blocks} />
          </div>
        </div>
      </Container>
    </section>
  );
}
