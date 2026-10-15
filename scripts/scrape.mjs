// Scrapes x1wealth.com SEO pages into structured content used by the local rebuild.
// Usage: node scripts/scrape.mjs
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "node:fs";

const ORIGIN = "https://x1wealth.com";
const SKIP = [/\.json$/, /\.txt$/, /^\/$/, /\/join\//, /\/advisor\/(apply|signup)/, /\/get-started/, /\/garrett\//];

const clean = (s) => s.replace(/\s+/g, " ").trim();

function categorize(path) {
  const seg = path.split("/").filter(Boolean);
  if (seg.length === 1) return seg[0] === "compare" || seg[0] === "resources" || seg[0] === "statistics" || seg[0] === "tools" || seg[0] === "integrations" || seg[0] === "features" || seg[0] === "connect" ? "hub" : "page";
  if (seg[0] === "resources" && seg[1] === "authors") return "author";
  return seg[0];
}

function parseSection($, el) {
  const blocks = [];
  const ctas = [];
  $(el)
    .find("h1,h2,h3,h4,p,ul,ol,table,blockquote,dl,a")
    .each((_, node) => {
      const $n = $(node);
      const tag = node.tagName;
      // only take outermost text containers
      if ($n.parents("p,ul,ol,table,blockquote,dl,h1,h2,h3,h4").length) return;
      if (tag === "a") {
        const text = clean($n.text());
        const href = $n.attr("href") || "";
        if (text && text.length < 60 && !$n.parents("li").length) ctas.push({ text, href });
        return;
      }
      if (tag === "ul" || tag === "ol") {
        const items = $n
          .children("li")
          .map((_, li) => [leafLines($, li)])
          .get()
          .filter((x) => x.length);
        if (items.length) blocks.push({ t: "list", ordered: tag === "ol", items });
        return;
      }
      if (tag === "table") {
        const caption = clean($n.find("caption").text());
        const head = $n.find("thead tr").first().find("th,td").map((_, c) => clean($(c).text())).get();
        const rows = $n
          .find("tbody tr")
          .map((_, tr) => [$(tr).find("th,td").map((_, c) => clean($(c).text())).get()])
          .get();
        if (rows.length) blocks.push({ t: "table", caption, head, rows });
        return;
      }
      if (tag === "dl") {
        const items = [];
        $n.find("dt").each((_, dt) => items.push({ term: clean($(dt).text()), def: clean($(dt).next("dd").text()) }));
        if (items.length) blocks.push({ t: "dl", items });
        return;
      }
      const text = clean($n.text());
      if (!text) return;
      if (tag === "blockquote") blocks.push({ t: "quote", text });
      else if (tag === "p") blocks.push({ t: "p", text });
      else blocks.push({ t: tag, text });
    });
  return { blocks, ctas: dedupe(ctas) };
}

// Text of leaf-ish elements inside a list item, so "title" and "body" stay separate.
function leafLines($, li) {
  const lines = [];
  const walk = (node) => {
    $(node)
      .contents()
      .each((_, ch) => {
        if (ch.type === "text") {
          const t = clean($(ch).text());
          if (t) lines.push(t);
        } else if (ch.type === "tag") {
          const inline = ["a", "strong", "em", "b", "i", "code", "span", "sup", "abbr"].includes(ch.tagName);
          if (inline && !$(ch).children("div,p,h3,h4").length) {
            const t = clean($(ch).text());
            if (t) {
              // merge inline runs into the previous line if they belong to the same text block
              lines.push(t);
            }
          } else walk(ch);
        }
      });
  };
  walk(li);
  // merge consecutive fragments that came from the same paragraph (inline runs)
  const merged = [];
  $(li).find("*").length === 0 ? merged.push(clean($(li).text())) : merged.push(...lines);
  return merged.filter((l) => !/^\d+\.?$/.test(l));
}

const dedupe = (arr) => arr.filter((a, i) => arr.findIndex((b) => b.text === a.text) === i);

async function scrape(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (X1 local rebuild)" } });
  if (!res.ok) return null;
  const html = await res.text();
  const $ = cheerio.load(html);
  const path = new URL(url).pathname.replace(/\/$/, "") || "/";
  // Next.js streams Suspense content into hidden <div id="S:n"> at the end of <body>.
  // Put each chunk back where its <template id="B:n"> placeholder sits.
  $("body > div[hidden][id^='S:']").each((_, el) => {
    const n = el.attribs.id.slice(2);
    const ph = $(`template[id="B:${n}"]`);
    if (ph.length) ph.replaceWith($(el).html() ?? "");
    else $("main").first().append($(el).html() ?? "");
    $(el).remove();
  });
  const main = $("main").first();
  main.find("script,style,svg,nav,noscript").remove();
  // <br> and block boundaries become spaces so "Who is<br>behind X1" doesn't read "Who isbehind X1".
  main.find("br").replaceWith(" ");
  main.find("span.block, div").each((_, el) => {
    $(el).append(" ");
  });
  const sections = [];
  const tops = main.children("section,article,div");
  (tops.length ? tops : main).each((_, el) => {
    const s = parseSection($, el);
    if (s.blocks.length) sections.push(s);
  });
  return {
    path,
    category: categorize(path),
    title: clean($("title").text()).replace(/\s*\|\s*X1 Wealth$/, ""),
    description: $("meta[name=description]").attr("content") || "",
    h1: clean(main.find("h1").first().text()),
    sections,
  };
}

const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((u) => !SKIP.some((r) => r.test(new URL(u).pathname)));

const out = [];
const queue = [...urls];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const u = queue.shift();
      try {
        const page = await scrape(u);
        if (page && page.h1) out.push(page);
        else console.warn("skip", u);
      } catch (e) {
        console.warn("fail", u, e.message);
      }
    }
  })
);
out.sort((a, b) => a.path.localeCompare(b.path));
mkdirSync("src/content", { recursive: true });
writeFileSync("src/content/pages.json", JSON.stringify(out));
console.log(`scraped ${out.length}/${urls.length}`);
