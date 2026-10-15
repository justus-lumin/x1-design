// Components, slice catalog and do / don't sections of /design-system.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { SourceChip } from "@/components/brand/primitives";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DsSection, DsSub, Rule, Tok } from "./parts";

function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3 rounded-[var(--radius-tile)] bg-card p-6 md:p-8", className)}>{children}</div>;
}

function Path({ children }: { children: string }) {
  return <span className="font-mono text-data text-subtle">{children}</span>;
}

/* ------------------------------------------------------------------ components */

export function Components() {
  return (
    <DsSection
      id="components"
      index="08"
      title="Components"
      lede="shadcn-style primitives restyled to the system: no borders, semantic tokens, radius tokens. Import from @/components/ui and @/components/brand; never fork a variant inline."
    >
      <DsSub title="Button" note={<>Variants: default, secondary, outline, ghost, inverse, link. Sizes: sm, default, lg, icon. One default (primary) button per view; wrap it in Magnetic on marketing pages. <Path>components/ui/button.tsx</Path></>}>
        <Stage>
          <Button>
            Start free <ArrowRight />
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Read the manifesto</Button>
          <Button size="icon" variant="secondary" aria-label="Search">
            <Search />
          </Button>
        </Stage>
        <Stage>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
          <span className="rounded-[var(--radius)] bg-primary p-3">
            <Button variant="inverse">Inverse, on bg-primary</Button>
          </span>
        </Stage>
      </DsSub>

      <div className="grid-12 gap-y-14">
        <DsSub className="col-span-4 md:col-span-6" title="Badge" note={<>outline (default), default, secondary, pending. Pending is hatched. <Path>components/ui/badge.tsx</Path></>}>
          <Stage className="h-full">
            <Badge>Trust</Badge>
            <Badge variant="default">Confirmed</Badge>
            <Badge variant="secondary">3 documents</Badge>
            <Badge variant="pending">Unconfirmed</Badge>
          </Stage>
        </DsSub>
        <DsSub className="col-span-4 md:col-span-6" title="Input" note={<>bg-input, no border, soft focus ring. Labels sit above in text-eyebrow. <Path>components/ui/input.tsx</Path></>}>
          <Stage className="h-full flex-col items-stretch">
            <label className="flex flex-col gap-2">
              <span className="text-eyebrow text-muted-foreground">Ask your record</span>
              <Input placeholder="Which trust owns the rental LLC?" />
            </label>
          </Stage>
        </DsSub>
      </div>

      <DsSub
        title="SourceChip"
        note={
          <>
            Provenance on every fact: document, locator, as-of date. <Tok>pending</Tok> hatches it for unconfirmed sources. Inside a raised surface, add{" "}
            <Tok>bg-background</Tok>. Keep doc names short so the chip never truncates on mobile. <Path>components/brand/primitives.tsx</Path>
          </>
        }
      >
        <Stage className="flex-col items-start">
          <SourceChip doc="K-1" />
          <SourceChip doc="K-1" locator="Item J" />
          <SourceChip doc="Operating agreement" locator="§ 5.2" asOf="Mar 14" />
          <SourceChip doc="Life policy" locator="p. 3" pending />
        </Stage>
      </DsSub>

      <div className="grid-12 gap-y-14">
        <DsSub className="col-span-4 md:col-span-6" title="Tabs" note={<>List on bg-card, active trigger on bg-raised. <Path>components/ui/tabs.tsx</Path></>}>
          <Stage className="h-full items-start">
            <Tabs defaultValue="business" className="w-full">
              <TabsList className="max-w-full flex-wrap">
                <TabsTrigger value="business" className="h-10">Business</TabsTrigger>
                <TabsTrigger value="trust" className="h-10">Trust</TabsTrigger>
                <TabsTrigger value="property" className="h-10">Property</TabsTrigger>
              </TabsList>
              <TabsContent value="business" className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                Harbor Works LLC. 2 documents, 1 open question for Sam Reyes, CPA.
              </TabsContent>
              <TabsContent value="trust" className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                Avery Family Trust. Article IV governs distributions.
              </TabsContent>
              <TabsContent value="property" className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                1 property. Insurance renewal in the next 90 days.
              </TabsContent>
            </Tabs>
          </Stage>
        </DsSub>
        <DsSub className="col-span-4 md:col-span-6" title="Card" note={<>bg-card, radius-tile, generous padding. <Path>components/ui/card.tsx</Path></>}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>The office that keeps going after the first question.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="sm" variant="outline" asChild>
                <Link href="/pricing">
                  See pricing <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </DsSub>
      </div>

      <DsSub title="Accordion" note={<>Items are separate tiles with gap-2, never divided by lines. The plus rotates to a close mark on open. <Path>components/ui/accordion.tsx</Path></>}>
        <Accordion type="single" collapsible defaultValue="a" className="flex flex-col gap-2">
          <AccordionItem value="a">
            <AccordionTrigger>Does X1 give financial, tax or legal advice?</AccordionTrigger>
            <AccordionContent>
              No. X1 is software for organizing your record and preparing questions for your CPA, attorney or advisor. It does not hold, trade or move money.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Do my professionals need an X1 account?</AccordionTrigger>
            <AccordionContent>No. They receive the question and selected material by email. You review what to share before sending it.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </DsSub>

      <DsSub title="Table" note={<>Card surface, tinted header, zebra rows by tone. Wide tables scroll inside their tile, never the page. <Path>components/ui/table.tsx</Path></>}>
        <Table className="min-w-[30rem]">
          <TableHeader>
            <TableRow>
              <TableHead>Fact</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Share of profit</TableCell>
              <TableCell>50.000%</TableCell>
              <TableCell><SourceChip doc="K-1" locator="Item J" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Percentage interest</TableCell>
              <TableCell>40.000%</TableCell>
              <TableCell><SourceChip doc="Agreement" locator="§ 5.2" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Life insurance owner</TableCell>
              <TableCell className="text-muted-foreground">Unknown</TableCell>
              <TableCell><SourceChip doc="Policy" pending /></TableCell>
            </TableRow>
          </TableBody>
          <TableCaption>Harbor Works LLC · two documents disagree. The CPA decides.</TableCaption>
        </Table>
      </DsSub>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ slices */

export type SliceRow = { kind: string; when: string; variants: string; inUse: string; count: number; example?: { path: string; title: string } };
export type TemplateRow = { name: string; when: string; count: number; example?: { path: string; title: string } };

export function Slices({ slices, templates, heroUse, pillars }: { slices: SliceRow[]; templates: TemplateRow[]; heroUse: string; pillars: string }) {
  return (
    <DsSection
      id="slices"
      index="11"
      title="Slice catalog"
      lede="SEO pages are built from scraped content. lib/content.ts splits each page at its h2s into chunks and classifies each one into a slice kind. Templates pick a variant per slice deterministically, so no page repeats a look. Counts are live from src/content/pages.json."
    >
      <DsSub title="Templates">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {templates.map((t) => (
            <div key={t.name} className="flex flex-col gap-3 rounded-[var(--radius-tile)] bg-card p-6">
              <div className="flex flex-col gap-1">
                <p className="font-display text-title font-medium">{t.name}</p>
                <p className="font-mono text-data text-subtle">{t.count} pages</p>
              </div>
              <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{t.when}</p>
              {t.example && (
                <Link href={t.example.path} className="mt-auto inline-flex min-h-10 items-center gap-1.5 text-[0.8125rem] text-foreground hover:underline">
                  {t.example.path} <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </DsSub>

      <DsSub
        title="Landing composer"
        note={
          <>
            <Tok>planLanding()</Tok> in slices/landing-compose.ts decides each landing page: hero, variant per section, what folds into More on this, what moves to the footnotes, and which moments may move. Counts below are what it picked across every landing page.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {[
            { k: "Heroes", v: heroUse },
            { k: "Pillars", v: pillars || "none" },
            { k: "Limits", v: "6 sections · 3 signature moments · 2 shaders" },
            { k: "Never", v: "same variant twice · same kind back to back · numerals twice" },
          ].map((r) => (
            <div key={r.k} className="flex flex-col gap-1.5 rounded-[var(--radius)] bg-card p-5">
              <span className="text-data text-muted-foreground">{r.k}</span>
              <span className="font-mono text-data break-words text-foreground">{r.v}</span>
            </div>
          ))}
        </div>
      </DsSub>

      <DsSub title="Slices" note="Picked roughly in this order; the first rule that matches wins. Variants below each rule. Never the same variant twice on a page, never two of a kind back to back, big numerals at most once.">
        <ol className="flex flex-col gap-2">
          {slices.map((s, i) => (
            <li key={s.kind} className="grid-12 gap-y-3 rounded-[var(--radius)] bg-card p-5 md:items-center">
              <div className="col-span-4 flex items-baseline gap-3 md:col-span-3">
                <span className="font-mono text-data text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-medium">{s.kind}</span>
                <span className="font-mono text-data text-subtle">{s.count}</span>
              </div>
              <div className="col-span-4 flex flex-col gap-1 md:col-span-5">
                <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">{s.when}</p>
                <p className="font-mono text-data text-subtle">{s.variants}</p>
                {s.inUse && <p className="font-mono text-data text-subtle">Landing use: {s.inUse}</p>}
              </div>
              <div className="col-span-4 md:col-span-4 md:text-right">
                {s.example ? (
                  <Link href={`${s.example.path}`} className="inline-flex min-h-10 max-w-full items-center gap-1.5 text-[0.8125rem] text-foreground hover:underline">
                    <span className="break-all">{s.example.path}</span> <ArrowUpRight className="size-3.5 shrink-0" />
                  </Link>
                ) : (
                  <span className="text-data text-subtle">No page uses it yet</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </DsSub>
    </DsSection>
  );
}

/* ------------------------------------------------------------------ do / don't */

export function DoDont() {
  return (
    <DsSection id="rules" index="12" title="Do and don't" lede="The short version of design-system/AGENTS.md.">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Rule kind="do" title="Cite the source on every fact shown, with its date when it matters.">
          <SourceChip doc="Trust agreement" locator="Art. IV" asOf="Jan 8" />
        </Rule>
        <Rule kind="dont" title="Show a figure, balance or deadline without a source. Never show trading, transfers or money movement.">
          <span className="font-display text-3xl font-medium tabular-nums">$2.4M</span>
        </Rule>
        <Rule kind="do" title="Write in sentence case, plainly, with periods. The middle dot separates metadata.">
          <span className="text-sm">Questions before you start.</span>
        </Rule>
        <Rule kind="dont" title="Use Title Case, ALL CAPS eyebrows, em dashes, or hype words.">
          <span className="text-xs font-medium tracking-[0.2em]">REVOLUTIONIZE YOUR WEALTH</span>
        </Rule>
        <Rule kind="do" title="Ask for approval before anything leaves the household.">
          <Button size="sm">Approve and send</Button>
        </Rule>
        <Rule kind="dont" title="Auto-send, or word a CTA as if X1 acts alone.">
          <Button size="sm" variant="secondary">Sent to your CPA automatically</Button>
        </Rule>
        <Rule kind="do" title="Give each page its own hero and mix slice variants, chosen deterministically from the path. Big numerals at most once per page.">
          <div className="flex w-full max-w-56 flex-col gap-1.5">
            {["Hero: split", "Statement", "Features: tiles", "Checklist", "Features: list"].map((t, i) => (
              <span key={t} className={cn("rounded-[var(--radius-control)] px-3 py-1.5 font-mono text-data", i % 2 ? "bg-card" : "bg-raised")}>{t}</span>
            ))}
          </div>
        </Rule>
        <Rule kind="dont" title="Reuse one hero on every page, repeat a slice variant, or stack two slices of the same kind back to back.">
          <div className="flex w-full max-w-56 flex-col gap-1.5">
            {["Hero: centered", "Steps: numerals", "Steps: numerals", "Ranked: numerals"].map((t, i) => (
              <span key={i} className="rounded-[var(--radius-control)] bg-card px-3 py-1.5 font-mono text-data">{t}</span>
            ))}
          </div>
        </Rule>
        <Rule kind="do" title="Spend motion on the hero entrance and two or three signature moments. Everything else is static or one soft fade.">
          <span className="font-mono text-data text-muted-foreground">hero · 1 scene · 1 statement</span>
        </Rule>
        <Rule kind="dont" title="Stagger every list item, scrub numeral fills, or animate every block on the page.">
          <span className="font-mono text-data text-muted-foreground">stagger × 14 lists</span>
        </Rule>
        <Rule kind="do" title="Say the strongest sentence big and demote the rest. Put long bodies behind quiet disclosures and sources in numbered mono footnotes.">
          <ol className="flex w-full max-w-64 flex-col gap-1 font-mono text-data text-muted-foreground">
            <li>1. IRS Publication 5035, tax year 2023</li>
            <li>2. UBS Global Family Office Report 2026, p. 38</li>
          </ol>
        </Rule>
        <Rule kind="dont" title="Render sources or notes as cards or check-icon lists, or let a page run long with every paragraph at full weight.">
          <div className="flex w-full max-w-64 flex-col gap-1.5">
            {["IRS Publication 5035", "UBS Global Family Office Report"].map((t) => (
              <span key={t} className="rounded-[var(--radius)] bg-card px-3 py-2.5 text-[0.8125rem]">✓ {t}</span>
            ))}
          </div>
        </Rule>
        <Rule kind="do" title="Collapse to one column on phones and stack labels above numbers.">
          <div className="flex w-full max-w-48 flex-col gap-1 rounded-[var(--radius)] bg-card p-3">
            <span className="text-data text-muted-foreground">Share of profit</span>
            <span className="font-display text-2xl font-medium tabular-nums">50.000%</span>
          </div>
        </Rule>
        <Rule kind="dont" title="Squeeze labels and numbers side by side at 390px, or truncate chips.">
          <div className="flex w-full max-w-48 items-baseline justify-between gap-1 overflow-hidden rounded-[var(--radius)] bg-card p-3">
            <span className="truncate text-data text-muted-foreground">Share of profit (K-1)</span>
            <span className="font-display text-2xl font-medium tabular-nums">50.0…</span>
          </div>
        </Rule>
      </div>
    </DsSection>
  );
}
