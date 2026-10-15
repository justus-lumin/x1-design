// People index (authors hub): initials, name, one-line bio. Same tile language as every other index.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HubItem } from "@/components/slices/hub-topics";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function HubPeople({ items }: { items: HubItem[] }) {
  return (
      <ul className="mx-auto grid max-w-4xl gap-[var(--grid-gap)]">
        {items.map((p) => (
          <li key={p.path}>
            <Link
              href={p.path}
              className="group flex items-center gap-5 rounded-[var(--radius-tile)] bg-card p-5 transition-colors duration-500 ease-[var(--ease-out)] hover:bg-raised focus-visible:bg-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 md:gap-7 md:p-7"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-raised font-display text-lg font-medium tracking-tight text-foreground/80 transition-colors duration-500 group-hover:bg-background md:size-16">
                {initials(p.title)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-title font-medium">{p.title}</span>
                {p.description && <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground text-pretty">{p.description}</span>}
              </span>
              <span className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-background group-hover:text-foreground">
                <ArrowUpRight className="size-4" strokeWidth={1.75} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
  );
}
