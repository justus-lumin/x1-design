// X1 page audit: loads every route in real Chrome and checks the design-system rules that can be measured.
//
// Usage (dev server or `next start` must be running):
//   BASE_URL=http://localhost:3000 node scripts/qa/audit.mjs [--sample=4] [--paths=/,/pricing]
//        [--viewports=1440x900,390x844] [--themes=dark,light] [--out=qa-report] [--shots]
//
// Errors fail the run (exit code 1). Warnings are reported but do not fail.
// Output: <out>/report.json and <out>/report.md (+ screenshots of failing pages with --shots).
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = "true"] = a.replace(/^--/, "").split("=");
    return [k, v];
  })
);
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT = args.out || "qa-report";
const viewports = (args.viewports || "1440x900,390x844").split(",").map((v) => v.split("x").map(Number));
const themes = (args.themes || "dark").split(",");
const sample = Number(args.sample || 1);

const content = JSON.parse(readFileSync(new URL("../../src/content/pages.json", import.meta.url)));
let paths = args.paths ? args.paths.split(",") : ["/", "/design-system", ...content.map((p) => p.path)];
if (!args.paths && sample > 1) paths = paths.filter((p, i) => i < 2 || i % sample === 0);
const NOT_FOUND = "/__qa-not-found";
if (!args.paths) paths.push(NOT_FOUND);

// Every selector that hides content until JS reveals it. Keep in sync with the x1-failsafe list in globals.css.
const HIDE_SELECTORS = [
  "[data-split]:not([data-split-ready])",
  "[data-ar-hero]:not([data-ar-done])",
  "[data-hub-pending]:not([data-hub-done])",
  "[data-hero]:not([data-hero-ready]) :is([data-hero-fade],[data-stage],[data-toc],[data-card])",
  "[data-lm]:not([data-lm-ready]) [data-lm-item]",
];

async function auditPage(browser, path, [w, h], theme) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((t) => localStorage.setItem("x1-theme", t), theme);
  const page = await ctx.newPage();
  const errors = [];
  const warnings = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/404 \(Not Found\)|Failed to load resource/.test(m.text())) consoleErrors.push(m.text());
  });

  let status = 0;
  try {
    const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 45000 });
    status = res?.status() ?? 0;
  } catch (e) {
    errors.push(`navigation failed: ${e.message.split("\n")[0]}`);
    await ctx.close();
    return { path, viewport: `${w}x${h}`, theme, errors, warnings };
  }
  const expected = path === NOT_FOUND ? 404 : 200;
  if (status !== expected) errors.push(`HTTP ${status}, expected ${expected}`);

  await page.waitForTimeout(2800); // hero entrances + the 2.5s failsafe window

  // First-viewport checks happen before scrolling, the way a visitor first sees the page.
  const top = await page.evaluate((HIDE) => {
    const visible = (el) => {
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.95) return false;
      }
      return true;
    };
    const h1s = [...document.querySelectorAll("h1")];
    const h1 = h1s.find((e) => !e.classList.contains("sr-only")) ?? h1s[0];
    const stuck = HIDE.flatMap((s) => [...document.querySelectorAll(".js " + s)])
      .filter((el) => el.getBoundingClientRect().top < innerHeight && el.textContent.trim())
      .map((el) => el.textContent.trim().slice(0, 40));
    return {
      h1Count: h1s.length,
      h1Visible: h1 ? visible(h1) || h1.classList.contains("sr-only") : false,
      h1Text: h1?.textContent.trim().slice(0, 60) ?? "",
      stuck,
    };
  }, HIDE_SELECTORS);

  if (top.h1Count !== 1) errors.push(`expected exactly 1 <h1>, found ${top.h1Count}`);
  if (top.h1Count && !top.h1Visible) errors.push(`h1 not visible after load: "${top.h1Text}"`);
  if (top.stuck.length) errors.push(`content still hidden after 2.8s: ${top.stuck.slice(0, 3).join(" | ")}`);

  // Scroll through so scroll-triggered entrances run, then audit the whole page.
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += Math.round(h * 0.8)) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(900);

  const full = await page.evaluate(() => {
    const out = { borders: [], ids: [], overflow: 0, shaders: 0, lostGl: 0, smallTargets: [], emDash: false, imgNoAlt: 0 };
    out.overflow = document.documentElement.scrollWidth - window.innerWidth;
    out.shaders = document.querySelectorAll("[data-grain]").length;
    out.lostGl = [...document.querySelectorAll("canvas")].filter((c) => c.getContext("webgl")?.isContextLost()).length;
    const seen = new Map();
    document.querySelectorAll("[id]").forEach((el) => seen.set(el.id, (seen.get(el.id) || 0) + 1));
    out.ids = [...seen].filter(([, n]) => n > 1).map(([id]) => id).slice(0, 5);
    const alpha = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return c === "transparent" ? 0 : 1;
      const parts = m[1].split(/[ ,/]+/).filter(Boolean);
      return parts.length > 3 ? parseFloat(parts[3]) : 1;
    };
    for (const el of document.body.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none") continue;
      for (const side of ["Top", "Right", "Bottom", "Left"]) {
        const w = parseFloat(cs[`border${side}Width`]);
        if (w > 0 && cs[`border${side}Style`] !== "none" && alpha(cs[`border${side}Color`]) > 0.02) {
          const name = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
          out.borders.push(name);
          break;
        }
      }
      if (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 && document.activeElement !== el && alpha(cs.outlineColor) > 0.02) {
        out.borders.push(el.tagName.toLowerCase() + " (outline)");
      }
    }
    if (window.innerWidth < 500) {
      document.querySelectorAll("button, [role=button], header a, nav a").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width && r.height && Math.min(r.width, r.height) < 32) out.smallTargets.push((el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30));
      });
    }
    out.emDash = document.body.innerText.includes("—");
    out.imgNoAlt = [...document.querySelectorAll("img:not([alt])")].length;
    return out;
  });

  if (full.overflow > 1) errors.push(`horizontal overflow of ${full.overflow}px`);
  if (full.borders.length) errors.push(`${full.borders.length} bordered elements (no borders allowed): ${[...new Set(full.borders)].slice(0, 4).join(", ")}`);
  if (full.shaders > 2) errors.push(`${full.shaders} GrainShaders on the page (max 2)`);
  if (full.lostGl) errors.push(`${full.lostGl} lost WebGL context(s)`);
  if (full.ids.length) errors.push(`duplicate ids: ${full.ids.join(", ")}`);
  if (consoleErrors.length) errors.push(`console errors: ${consoleErrors.slice(0, 2).join(" | ").slice(0, 200)}`);
  if (full.imgNoAlt) errors.push(`${full.imgNoAlt} <img> without alt`);
  if (full.smallTargets.length) warnings.push(`tap targets under 32px: ${[...new Set(full.smallTargets)].slice(0, 4).join(", ")}`);
  if (full.emDash) warnings.push("em dash in visible text (allowed only inside scraped source copy)");

  if (errors.length && args.shots) {
    mkdirSync(`${OUT}/shots`, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${OUT}/shots/${(path.replace(/\//g, "_") || "_home")}-${w}-${theme}.jpg`, quality: 60 });
  }
  await ctx.close();
  return { path, viewport: `${w}x${h}`, theme, errors, warnings };
}

const browser = await chromium.launch({ channel: "chrome" });
const jobs = paths.flatMap((p) => viewports.flatMap((v) => themes.map((t) => [p, v, t])));
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: Number(args.concurrency || 3) }, async () => {
    while (next < jobs.length) {
      const [p, v, t] = jobs[next++];
      const r = await auditPage(browser, p, v, t);
      results.push(r);
      const mark = r.errors.length ? "FAIL" : r.warnings.length ? "warn" : " ok ";
      console.log(`${mark}  ${r.viewport.padEnd(9)} ${t.padEnd(5)} ${p}${r.errors.length ? "\n      " + r.errors.join("\n      ") : ""}`);
    }
  })
);
await browser.close();

results.sort((a, b) => a.path.localeCompare(b.path));
const failed = results.filter((r) => r.errors.length);
const warned = results.filter((r) => r.warnings.length);
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, checked: results.length, failed: failed.length, results }, null, 2));
const md = [
  `# X1 QA audit`,
  ``,
  `${results.length} checks (${paths.length} routes × ${viewports.length} viewports × ${themes.length} themes) against ${BASE}.`,
  `**${failed.length} failing**, ${warned.length} with warnings.`,
  ``,
  ...failed.map((r) => `- FAIL \`${r.path}\` ${r.viewport} ${r.theme}\n${r.errors.map((e) => `  - ${e}`).join("\n")}`),
  ...(warned.length ? ["", "## Warnings", ...warned.map((r) => `- \`${r.path}\` ${r.viewport} ${r.theme}: ${r.warnings.join("; ")}`)] : []),
].join("\n");
writeFileSync(`${OUT}/report.md`, md + "\n");
console.log(`\n${results.length} checks, ${failed.length} failing, ${warned.length} with warnings. Report: ${OUT}/report.md`);
process.exit(failed.length ? 1 : 0);
