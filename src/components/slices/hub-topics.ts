// Hub index data: turns scraped child pages into serializable card items, with topic tags derived
// from each page's own title and description (keyword heuristics, nothing invented).
import { CATEGORY_LABEL, childrenOf, getPage } from "@/lib/content";
import { clip } from "@/components/slices/hub-text";

export type HubIconKey =
  | "box" | "dropbox" | "drive" | "bank" | "books"
  | "claude" | "chatgpt" | "codex" | "copilot" | "muse" | "mcp"
  | "ask" | "cashflow" | "estate" | "family" | "play" | "pulse" | "tax" | "vault"
  | "calculator" | "calendar" | "report" | "quiz" | "collection" | "file";

export type HubItem = {
  path: string;
  title: string;
  /** Short name (tool / integration / assistant name) when the h1 is a sentence. */
  name?: string;
  description: string;
  label: string;
  date?: string;
  sortKey: number;
  tags: string[];
  icon?: HubIconKey;
};

type TopicRule = { key: string; label: string; re: RegExp };

const TOPICS: Record<string, TopicRule[]> = {
  "/resources": [
    { key: "tax", label: "Tax", re: /\btax|k-?1s?\b|1099|roth|\bhsa\b|\brsu|s-?corp|\bllc\b|\bqbi\b|8606|\birs\b|estimated/i },
    { key: "estate", label: "Estate", re: /estate|trust|gift exemption|inherit/i },
    { key: "advisors", label: "Advisors", re: /advisor|\bcpa\b|fiduciary|\bria|\buma\b|off-channel/i },
    { key: "ai", label: "AI", re: /\bai\b|claude|chatgpt|grok|\bmcp\b|poppy|agent/i },
    { key: "family-office", label: "Family office", re: /family|household|constitution/i },
    { key: "documents", label: "Documents", re: /document|vault|packet|paperwork/i },
    { key: "business", label: "Business", re: /business|s-?corp|\bllc\b|capital call|concentrated stock|income-producing/i },
  ],
  "/compare": [
    { key: "budgeting", label: "Budgeting apps", re: /monarch|ynab|\bmint\b|copilot|empower|betterment|kubera|budget/i },
    { key: "advisor", label: "Advisor software", re: /addepar|orion|black diamond|tamarac|rightcapital|emoney|holistiplan|fp alpha|wealth\.com|vanilla|\bria\b|advisor platform/i },
    { key: "family-office", label: "Family office", re: /family office|addepar|masttro/i },
    { key: "ai", label: "AI assistants", re: /chatgpt|claude/i },
    { key: "coaching", label: "Coaching", re: /coaching|wealth factory/i },
  ],
  "/tools": [
    { key: "tax", label: "Tax", re: /\btax|s-?corp|\bqbi\b|\bllc\b|estimated/i },
    { key: "cashflow", label: "Cash flow", re: /cash flow|velocity|\bdebt/i },
    { key: "family", label: "Family planning", re: /family|planning tools|constitution|blueprint/i },
    { key: "mindset", label: "Money mindset", re: /mindset|wound|procrastinat|idea optimizer|income asset|financial health/i },
  ],
};

/** Filter chips for a hub: only topics with at least two pages. */
export function topicsFor(hub: string, items: HubItem[]) {
  return (TOPICS[hub] ?? [])
    .map((t) => ({ key: t.key, label: t.label, count: items.filter((i) => i.tags.includes(t.key)).length }))
    .filter((t) => t.count >= 2);
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "By X1 Wealth · Updated Jul 26, 2026" or "Updated: 2026-06-12" → display + sortable value. */
export function parseUpdated(meta?: string) {
  if (!meta) return null;
  const a = meta.match(/updated:?\s+([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}), (\d{4})/i);
  if (a) {
    const m = MONTHS.indexOf(a[1].toLowerCase());
    if (m >= 0) return { label: `${a[1]} ${a[2]}, ${a[3]}`, key: Date.UTC(+a[3], m, +a[2]) };
  }
  const b = meta.match(/updated:?\s+(\d{4})-(\d{2})-(\d{2})/i);
  if (b) {
    const m = +b[2] - 1;
    const label = `${MONTHS[m][0].toUpperCase()}${MONTHS[m].slice(1)} ${+b[3]}, ${b[1]}`;
    return { label, key: Date.UTC(+b[1], m, +b[3]) };
  }
  return null;
}

function iconFor(path: string, text: string): HubIconKey | undefined {
  const slug = path.split("/").pop() ?? "";
  const bySlug: Record<string, HubIconKey> = {
    box: "box", dropbox: "dropbox", "google-drive": "drive", plaid: "bank", quickbooks: "books",
    claude: "claude", chatgpt: "chatgpt", codex: "codex", "microsoft-copilot": "copilot", muse: "muse", other: "mcp",
    "ask-x1": "ask", "cash-flow-tools": "cashflow", "estate-planning": "estate", "family-wealth": "family",
    "play-builder": "play", pulse: "pulse", "tax-optimization": "tax", vault: "vault",
    tax: "collection", "cash-flow": "collection", planning: "collection",
  };
  if (bySlug[slug] && !path.startsWith("/tools/")) return bySlug[slug];
  if (path.startsWith("/tools/")) {
    if (["tax", "cash-flow", "planning"].includes(slug)) return "collection";
    if (/deadline|catch-?up|quarterly/i.test(text)) return "calendar";
    if (/report|blueprint|projection/i.test(text)) return "report";
    if (/quiz|snapshot|decoder|identifier|assessment|optimizer|dna/i.test(text)) return "quiz";
    return "calculator";
  }
  return undefined;
}

/** Short names for hubs whose child h1s are full sentences. Derived from the scraped <title>. */
function shortName(hub: string, title: string, eyebrow?: string) {
  let n = title;
  if (hub === "/connect") n = (eyebrow && /^connect x1 to /i.test(eyebrow) ? eyebrow : title).replace(/^connect x1 to /i, "").replace(/^X1 in /, "").replace(/:.*$/, "");
  if (hub === "/integrations") n = title.replace(/ integration$/i, "");
  if (hub === "/tools") n = title.split(/ \| | - /)[0];
  n = n.trim();
  return n.charAt(0).toUpperCase() + n.slice(1);
}

/** Hub children as card items, newest first when the pages carry an "Updated" date. */
export function hubItems(hub: string, toolBlurbs: Record<string, string> = {}): HubItem[] {
  const rules = TOPICS[hub] ?? [];
  const items = childrenOf(hub).map((c, i) => {
    const page = getPage(c.path);
    const upd = parseUpdated(page?.meta);
    const name = hub === "/connect" || hub === "/integrations" || hub === "/tools" || hub === "/features" ? shortName(hub, page?.title ?? c.title, page?.eyebrow) : undefined;
    const hay = `${c.title} ${name ?? ""} ${c.path.replace(/[-/]/g, " ")}`;
    const tags = rules.filter((r) => r.re.test(hay)).map((r) => r.key);
    const label = tags.length ? rules.find((r) => r.key === tags[0])!.label : (CATEGORY_LABEL[c.category] ?? "");
    const description = clip((name && toolBlurbs[name.toLowerCase()]) || c.description || "");
    return {
      path: c.path,
      title: c.title,
      name,
      description,
      label,
      date: upd?.label,
      sortKey: upd?.key ?? -i,
      tags,
      icon: iconFor(c.path, `${c.title} ${name ?? ""} ${c.path}`),
    } satisfies HubItem;
  });
  return items.some((i) => i.date) ? items.sort((a, b) => b.sortKey - a.sortKey) : items;
}

/** "6 Empower Alternatives for 2026, Compared by Use Case" → "Empower Alternatives". */
const shortTitle = (t: string) =>
  t
    .split(/[:(]/)[0]
    .replace(/,.*$/, "")
    .replace(/\s+(in|for)?\s*20\d\d$/i, "")
    .replace(/^(\d+\s+)?(best\s+)?/i, "")
    .trim();

const tokens = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/\(.*?\)|\b20\d\d\b/g, " ")
      .split(/[^a-z0-9.]+/)
      .filter((w) => w.length > 1 && !["vs", "the", "for", "and", "best", "of", "in", "to", "alternatives", "comparison"].includes(w))
  );

/**
 * The compare hub groups its pages in scraped tables ("Budgeting Apps": Comparison | Best For).
 * Match each table row to the child page whose title shares the most words with it.
 */
export function compareGroups(
  tables: { heading: string; rows: string[][] }[],
  items: HubItem[]
): { key: string; label: string; rows: { item: HubItem; name: string; bestFor: string }[] }[] {
  const used = new Set<string>();
  const groups = tables.map((t) => ({
    key: t.heading.toLowerCase().replace(/[^a-z]+/g, "-"),
    label: t.heading.replace(/&/g, "and"),
    rows: t.rows.flatMap(([name, bestFor]) => {
      const want = tokens(name);
      const alt = /alternatives/i.test(name);
      let best: HubItem | undefined;
      let score = 0;
      for (const it of items) {
        if (used.has(it.path)) continue;
        const have = tokens(`${it.title} ${it.path.split("/").pop()!.replace(/-/g, " ")}`);
        let s = [...want].filter((w) => have.has(w)).length;
        if (alt === /alternatives/.test(it.path)) s += 0.5;
        if (s > score) [best, score] = [it, s];
      }
      if (!best || score < 1.5) return [];
      used.add(best.path);
      return [{ item: best, name, bestFor }];
    }),
  }));
  const rest = items.filter((i) => !used.has(i.path));
  return rest.length ? [...groups, { key: "more", label: "More", rows: rest.map((item) => ({ item, name: shortTitle(item.title), bestFor: "" })) }] : groups;
}
