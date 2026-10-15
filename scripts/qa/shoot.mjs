// Captures the landing page in viewport-sized frames while scrolling, so scroll animations fire.
// Usage: node scripts/shoot.mjs <url> <outDir> [width] [height] [dark|light]
import { chromium } from "playwright-core";
const [url, out, w = "1440", h = "900", theme = "dark"] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=metal", "--enable-webgl", "--ignore-gpu-blocklist"] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await ctx.addInitScript((t) => localStorage.setItem("x1-theme", t), theme);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
let y = 0, i = 0;
while (y < total && i < 40) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${out}/${String(i).padStart(2, "0")}.jpg`, quality: 70 });
  y += +h * 0.9; i++;
}
console.log(JSON.stringify({ total, frames: i, overflowX: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), errors }));
await browser.close();
