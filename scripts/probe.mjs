// Scrolls to an element and reports shader canvas state + screenshot of it.
import { chromium } from "playwright-core";
const [url, selector, out] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on("console", (m) => logs.push(m.type() + ": " + m.text()));
page.on("pageerror", (e) => logs.push("pageerror: " + e.message));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.locator(selector).first().scrollIntoViewIfNeeded();
await page.waitForTimeout(2500);
const info = await page.$$eval("canvas", (cs) => cs.map((c) => ({ ready: c.dataset.ready, w: c.width, h: c.height, op: getComputedStyle(c).opacity, lost: c.getContext("webgl")?.isContextLost() })));
await page.locator(selector).first().screenshot({ path: out });
console.log(JSON.stringify({ info, logs }, null, 1));
await browser.close();
