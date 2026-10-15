// Shader stress test: repeated reloads, full scroll down and back, theme flips.
// Passes when no WebGL context is ever lost and at most 2 contexts are alive at once.
// Usage: BASE_URL=http://localhost:3000 node scripts/qa/shader-stress.mjs [--path=/]
import { chromium } from "playwright-core";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const path = (process.argv.find((a) => a.startsWith("--path=")) || "--path=/").slice(7);
const browser = await chromium.launch({ channel: "chrome" });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const glErrors = [];
page.on("console", (m) => /webgl|context lost/i.test(m.text()) && glErrors.push(m.text()));

const state = () =>
  page.evaluate(() => {
    const cs = [...document.querySelectorAll("canvas")].filter((c) => c.closest("[data-grain]"));
    return { live: cs.length, lost: cs.filter((c) => c.getContext("webgl")?.isContextLost()).length, shown: cs.filter((c) => c.style.opacity === "1").length };
  });

const problems = [];
const check = async (label) => {
  const s = await state();
  if (s.lost) problems.push(`${label}: ${s.lost} lost context(s)`);
  if (s.live > 2) problems.push(`${label}: ${s.live} live contexts (max 2)`);
  return s;
};

for (let i = 0; i < 3; i++) await page.goto(BASE + path, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const first = await check("after reloads");
if (!first.shown) problems.push("after reloads: no shader canvas visible in the first viewport");
const H = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < H; y += 500) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(90);
  if (y % 2500 === 0) await check(`scroll ${y}`);
}
for (let y = H; y >= 0; y -= 900) {
  await page.evaluate((y) => scrollTo(0, y), y);
  await page.waitForTimeout(60);
}
await page.waitForTimeout(1500);
await check("back at top");
for (const t of ["light", "dark", "light", "dark"]) {
  await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), t);
  await page.waitForTimeout(300);
}
await check("theme flips");
await browser.close();

if (glErrors.length) problems.push(...glErrors.slice(0, 3));
console.log(problems.length ? problems.join("\n") : `Shader stable on ${path}: no lost contexts, never more than 2 alive.`);
process.exit(problems.length ? 1 : 0);
