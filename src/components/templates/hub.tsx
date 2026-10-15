// Hub (index) pages. Each hub gets its own masthead and index shape so the section pages don't
// read as one template: resources (editorial + reading list), compare (A vs B + grouped rows),
// statistics (headline figure), tools (compact header into a tool grid), product hubs (split hero
// with a product fragment), blog (one featured piece), authors (people list).
// Then any of the hub's own scraped copy that adds something, then the CTA band.
import { Container } from "@/components/brand/primitives";
import { HubCard } from "@/components/slices/hub-card";
import { HubCompare } from "@/components/slices/hub-compare";
import { HubFeatured } from "@/components/slices/hub-featured";
import { HubHero } from "@/components/slices/hub-hero";
import { HubLibrary } from "@/components/slices/hub-library";
import { HubPeople } from "@/components/slices/hub-people";
import { HubProduct, type Fragment } from "@/components/slices/hub-product";
import { HubStats } from "@/components/slices/hub-stats";
import { HubTools } from "@/components/slices/hub-tools";
import { compareGroups, hubItems, parseUpdated, topicsFor } from "@/components/slices/hub-topics";
import { Slice } from "@/components/slices/registry";
import { CtaBand } from "@/components/site/cta-band";
import { resolveHref, type Block, type Chunk, type Page } from "@/lib/content";

/** Scraped chunks that repeat the index, or are not this hub's own copy. */
const SKIP: Record<string, (c: Chunk) => boolean> = {
  "/resources": () => true, // the scraped /resources body is the Cash Flow Index article
  "/compare": (c) => c.kind === "table", // the grouped tables become the index itself
  "/statistics": (c) => /^key reports|^build a picture/i.test(c.heading ?? ""),
  "/tools": (c) => c.kind === "statement", // one-line tool blurbs, used on the tool tiles
  "/integrations": () => false,
  "/features": (c) => c.id === "overview" || /^choose the work/i.test(c.heading ?? ""), // overview list feeds the hero fragment
  "/connect": (c) => /^where do you want/i.test(c.heading ?? ""),
  "/blog": () => true,
  "/resources/authors": () => true,
};

const listOf = (blocks: Block[]) => blocks.filter((b): b is Extract<Block, { t: "list" }> => b.t === "list").flatMap((l) => l.items);

function Index({ page }: { page: Page }) {
  const ctas = page.ctas.map((c) => ({ text: c.text, href: resolveHref(c.href) }));
  const lede = page.lede ?? page.description;

  switch (page.path) {
    case "/resources": {
      const items = hubItems(page.path);
      return <HubLibrary h1={page.h1} lede={lede} meta={page.meta} items={items} topics={topicsFor(page.path, items)} searchLabel="Search resources" />;
    }
    case "/compare": {
      const tables = page.chunks
        .filter((c) => c.kind === "table" && c.heading)
        .map((c) => {
          const t = c.blocks.find((b) => b.t === "table");
          return { heading: c.heading!, rows: t && t.t === "table" ? t.rows : [] };
        });
      return <HubCompare h1={page.h1} lede={lede} meta={page.meta} groups={compareGroups(tables, hubItems(page.path))} searchLabel="Search comparisons" />;
    }
    case "/statistics": {
      const items = hubItems(page.path);
      const lead = items.find((i) => /high-net-worth/.test(i.path)) ?? items[0];
      const upd = parseUpdated(page.meta);
      return <HubStats h1={page.h1} lede={lede} meta={upd ? `Updated ${upd.label}` : page.meta} items={items} lead={lead} />;
    }
    case "/tools": {
      // The hub's own one-line blurbs (h2 + line per tool) read better than each tool's meta description.
      const blurbs: Record<string, string> = {};
      for (const c of page.chunks) {
        const p = c.blocks.find((b) => b.t === "p");
        if (c.heading && p && p.t === "p") blurbs[c.heading.toLowerCase()] = p.text;
      }
      const items = hubItems(page.path, blurbs);
      return <HubTools h1={page.h1} lede={lede} items={items} topics={topicsFor(page.path, items)} />;
    }
    case "/integrations":
    case "/connect":
    case "/features": {
      const variant = page.path.slice(1) as "integrations" | "connect" | "features";
      let items = hubItems(page.path);
      if (variant === "features") {
        // Use the hub's own capability names (its h3s) and order instead of each page's long <title>.
        const names = (page.chunks.find((c) => /^choose the work/i.test(c.heading ?? ""))?.blocks ?? [])
          .filter((b) => b.t === "h3")
          .map((b) => (b.t === "h3" ? b.text : ""));
        const SLUG_TO_NAME: Record<string, string> = {
          pulse: "Household Readiness",
          "ask-x1": "Ask X1",
          vault: "Vault",
          "play-builder": "Play Builder",
          "tax-optimization": "Tax Review",
          "estate-planning": "Estate Plan Review",
          "family-wealth": "Family Governance",
          "cash-flow-tools": "Liquidity & Cash Flow",
        };
        const rank = (i: { path: string }) => {
          const n = names.indexOf(SLUG_TO_NAME[i.path.split("/").pop()!] ?? "");
          return n < 0 ? 99 : n;
        };
        items = items
          .map((i) => {
            const n = SLUG_TO_NAME[i.path.split("/").pop()!];
            return n && names.includes(n) ? { ...i, name: n } : i;
          })
          .sort((a, b) => rank(a) - rank(b));
      }
      let fragment: Fragment;
      if (variant === "features") {
        const overview = page.chunks.find((c) => c.id === "overview");
        fragment = { rows: listOf(overview?.blocks ?? []).map(([label, sub]) => ({ label, sub })) };
      } else if (variant === "connect") {
        const qs = listOf(page.chunks.find((c) => /^start with one useful/i.test(c.heading ?? ""))?.blocks ?? []);
        fragment = { label: page.eyebrow, rows: items.map((i) => ({ icon: i.icon, label: i.name ?? i.title })), prompt: qs[0]?.[0] };
      } else {
        fragment = { label: page.eyebrow, rows: items.map((i) => ({ icon: i.icon, label: i.name ?? i.title })) };
      }
      return (
        <HubProduct
          variant={variant}
          eyebrow={variant === "integrations" ? undefined : page.eyebrow}
          h1={page.h1}
          lede={lede}
          primary={ctas[0]}
          secondary={ctas[1]}
          items={items}
          fragment={fragment}
        />
      );
    }
    case "/resources/authors":
      return (
        <>
          <HubHero align="column" h1={page.h1} lede={lede} meta={page.meta} />
          <Container className="pt-14 pb-[var(--section-y-tight)] md:pt-20">
            <HubPeople items={hubItems(page.path)} />
          </Container>
        </>
      );
    default: {
      // Blog and any other hub: centered masthead, newest piece featured, the rest as cards.
      const items = hubItems(page.path);
      return (
        <>
          <HubHero eyebrow={page.eyebrow} h1={page.h1} lede={lede} />
          {items[0] && (
            <Container className="pt-14 pb-[var(--section-y-tight)] md:pt-20">
              <HubFeatured item={items[0]} kicker="Latest" />
              {items.length > 1 && (
                <ul className="mt-[var(--grid-gap)] grid gap-[var(--grid-gap)] sm:grid-cols-2 lg:grid-cols-3">
                  {items.slice(1).map((item) => (
                    <li key={item.path}>
                      <HubCard item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </Container>
          )}
        </>
      );
    }
  }
}

export function HubTemplate({ page }: { page: Page }) {
  const skip = SKIP[page.path] ?? (() => false);
  const chunks = page.chunks.filter((c) => !skip(c));
  return (
    <>
      <Index page={page} />
      {chunks.map((c, i) => (
        <Slice key={c.id} chunk={c} index={i} page={page} layout="full" />
      ))}
      <CtaBand />
    </>
  );
}
