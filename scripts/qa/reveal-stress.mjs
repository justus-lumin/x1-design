// Reveal stress test: interrupts page loads mid-entrance and navigates rapidly, then checks that every
// headline and first-viewport text ends up fully visible. Catches "text sometimes disappears" bugs.
// Usage: BASE_URL=http://localhost:3000 node scripts/qa/reveal-stress.mjs [--paths=/,/pricing]
import { chromium } from "playwright-core";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const arg = process.argv.find((a) => a.startsWith("--paths="));
const paths = arg
  ? arg.slice(8).split(",")
  : ["/", "/features/vault", "/pricing", "/professionals", "/integrations/plaid", "/resources/how-to-read-a-k1", "/compare/addepar-alternatives", "/statistics/wealth-transfer", "/resources", "/compare", "/design-system"];

const browser = await chromium.launch({ channel: "chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

// Text in the first viewport that is rendered (not display:none) but invisible.
const invisibleText = () =>
  page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("h1, h1 *, main p, main a, main li, main h2")) {
      if (el.children.length && el.tagName !== "H1") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || !el.textContent.trim()) continue;
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.3) {
          // Intentionally dimmed states (inactive steps, TOC) are allowed down to 0.3.
          bad.push(el.textContent.trim().replace(/\s+/g, " ").slice(0, 40));
          break;
        }
      }
    }
    return [...new Set(bad)].slice(0, 5);
  });

const failures = [];
for (const path of paths) {
  for (const interrupt of [0, 150, 450]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(interrupt);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3200);
    const bad = await invisibleText();
    if (bad.length) failures.push({ path, interrupt, bad });
  }
}

// Rapid client-side navigation through header links, ending on the homepage.
await page.goto(BASE + "/", { waitUntil: "networkidle" });
for (const href of ["/features", "/professionals", "/pricing", "/resources", "/", "/pricing", "/"]) {
  await page.evaluate((h) => {
    const a = document.querySelector(`header a[href="${h}"]`);
    if (a) a.click();
    else location.href = h;
  }, href);
  await page.waitForTimeout(href === "/" ? 3200 : 250);
}
const navBad = await invisibleText();
if (navBad.length) failures.push({ path: "soft navigation", bad: navBad });

await browser.close();
console.log(failures.length ? JSON.stringify(failures, null, 2) : `All ${paths.length * 3 + 1} reveal scenarios visible.`);
if (pageErrors.length) console.log("page errors:", pageErrors.slice(0, 5));
process.exit(failures.length || pageErrors.length ? 1 : 0);
