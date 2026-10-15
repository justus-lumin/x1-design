// "Keep reading": three pages from the same section, in the shared hub tile style.
// Contract: export function RelatedSlice({ path, title? }). Used at the end of landing and article pages.
import { Container } from "@/components/brand/primitives";
import { HubCard } from "@/components/slices/hub-card";
import { clip } from "@/components/slices/hub-text";
import { parseUpdated } from "@/components/slices/hub-topics";
import { CATEGORY_LABEL, getPage, relatedTo } from "@/lib/content";

export function RelatedSlice({ path, title = "Keep reading" }: { path: string; title?: string }) {
  const items = relatedTo(path).map((r) => {
    const page = getPage(r.path);
    return { ...r, description: clip(r.description ?? ""), label: page?.label || CATEGORY_LABEL[page?.category ?? ""] || "", date: parseUpdated(page?.meta)?.label };
  });
  if (!items.length) return null;
  return (
    <section className="section-y-tight">
      <Container>
        <h2 className="font-display text-display-md font-medium">{title}</h2>
        <ul className="mt-10 grid gap-[var(--grid-gap)] md:mt-12 md:grid-cols-3">
            {items.map((r) => (
              <li key={r.path}>
                <HubCard item={r} />
              </li>
            ))}
        </ul>
      </Container>
    </section>
  );
}
