// One tile style for every index on the site: borderless bg-card, tone lift and an arrow nudge on hover.
// Pure markup (no hooks), so server slices (Related) and the client index share it.
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Box,
  CalendarClock,
  Calculator,
  Code,
  Droplet,
  FileSearch,
  FileText,
  FolderLock,
  HardDrive,
  Landmark,
  Layers,
  Lightbulb,
  MessageSquare,
  Network,
  Plug,
  Receipt,
  ScrollText,
  Sparkles,
  Users,
  Wallet,
  Briefcase,
  ClipboardList,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";
import type { HubIconKey, HubItem } from "@/components/slices/hub-topics";
import { cn } from "@/lib/utils";

export const HUB_ICONS: Record<HubIconKey, LucideIcon> = {
  box: Box,
  dropbox: Droplet,
  drive: HardDrive,
  bank: Landmark,
  books: BookOpen,
  claude: Sparkles,
  chatgpt: MessageSquare,
  codex: Code,
  copilot: Briefcase,
  muse: Users,
  mcp: Plug,
  ask: FileSearch,
  cashflow: Wallet,
  estate: ScrollText,
  family: Network,
  play: Lightbulb,
  pulse: CalendarClock,
  tax: Receipt,
  vault: FolderLock,
  calculator: Calculator,
  calendar: CalendarClock,
  report: ClipboardList,
  quiz: CircleHelp,
  collection: Layers,
  file: FileText,
};

const tile =
  "group relative flex h-full flex-col rounded-[var(--radius-tile)] bg-card p-5 transition-colors duration-500 ease-[var(--ease-out)] hover:bg-raised focus-visible:bg-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 sm:p-6";

export function Arrow({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-500 ease-[var(--ease-out)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-background group-hover:text-foreground",
        className
      )}
      aria-hidden
    >
      <ArrowUpRight className="size-4" strokeWidth={1.75} />
    </span>
  );
}

function Meta({ label, date }: { label?: string; date?: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-data text-muted-foreground">
      {label && <span className="truncate">{label}</span>}
      {label && date && <span className="text-subtle" aria-hidden>·</span>}
      {date && <span className="shrink-0 font-mono text-subtle">{date}</span>}
    </span>
  );
}

type CardItem = Pick<HubItem, "path" | "title" | "description" | "label" | "date">;

/** Editorial card: meta, title, one short line. */
export function HubCard({ item, figure, className }: { item: CardItem; figure?: { value: string; unit: string } | null; className?: string }) {
  return (
    <Link href={item.path} className={cn(tile, className)}>
      <div className="flex min-h-8 items-center justify-between gap-3">
        <Meta label={item.label} date={item.date} />
        <Arrow className="-mr-1.5" />
      </div>
      {figure && (
        <p className="mt-6 font-display text-display-md font-medium tabular-nums">
          {figure.value} <span className="text-title text-muted-foreground">{figure.unit}</span>
        </p>
      )}
      <h3 className={cn("font-display text-title font-medium text-balance", figure ? "mt-3" : "mt-4 sm:mt-10")}>{item.title}</h3>
      {item.description && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">{item.description}</p>}
    </Link>
  );
}

/** Icon-led tile for integrations: icon, name, the page's own one-line promise. */
export function HubIconCard({ item, className }: { item: HubItem; className?: string }) {
  const Icon = HUB_ICONS[item.icon ?? "file"];
  return (
    <Link href={item.path} className={cn(tile, className)}>
      <div className="flex items-center gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius)] bg-raised text-foreground/75 transition-colors duration-500 group-hover:bg-background group-hover:text-foreground">
          <Icon className="size-[1.125rem]" strokeWidth={1.5} />
        </span>
        <span className="min-w-0 text-sm leading-snug font-medium">{item.name ?? item.label}</span>
        <Arrow className="-mr-1.5 ml-auto" />
      </div>
      <h3 className="mt-4 font-display text-title font-medium text-balance sm:mt-12">{item.title}</h3>
    </Link>
  );
}

/** Tool tile: icon, name, what it does. Reads as an instrument, not an article. */
export function HubToolCard({ item, className }: { item: HubItem; className?: string }) {
  const Icon = HUB_ICONS[item.icon ?? "calculator"];
  return (
    <Link href={item.path} className={cn(tile, "flex-row items-start gap-4 pr-12 sm:pr-14", className)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-[var(--radius)] bg-raised text-foreground/75 transition-colors duration-500 group-hover:bg-background group-hover:text-foreground">
        <Icon className="size-[1.125rem]" strokeWidth={1.5} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.015em]">{item.name ?? item.title}</span>
        {item.description && <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground text-pretty">{item.description}</span>}
      </span>
      <Arrow className="absolute top-4 right-4 sm:top-5 sm:right-5" />
    </Link>
  );
}

/** List row: title and one line on the left, meta on the right. Used for long libraries. */
export function HubRow({ item, className }: { item: CardItem; className?: string }) {
  return (
    <Link
      href={item.path}
      className={cn(
        "group grid gap-x-8 gap-y-2 rounded-[var(--radius-tile)] px-5 py-5 transition-colors duration-500 ease-[var(--ease-out)] hover:bg-card focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 sm:px-6 md:grid-cols-[minmax(0,1fr)_11rem_auto] md:items-center",
        className
      )}
    >
      <span className="min-w-0">
        <span className="block font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.015em] text-balance md:text-title">{item.title}</span>
        {item.description && <span className="mt-1.5 hidden text-sm leading-relaxed text-muted-foreground sm:block">{item.description}</span>}
      </span>
      <span className="md:justify-self-end">
        <Meta label={item.label} date={item.date} />
      </span>
      <Arrow className="hidden md:grid" />
    </Link>
  );
}
