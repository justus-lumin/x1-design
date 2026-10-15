// Generates design-system/tokens.json from the code that owns the tokens, and syncs design-system/assets/.
//   - src/app/globals.css      primitives, semantic light (:root) + dark (.dark), @theme type scale, radii, layout
//   - src/lib/gsap.ts          GSAP motion tokens (export const motion)
//   - src/components/**        <GrainShader .../> usages become shader presets
// Usage: node scripts/export-tokens.mjs   (run after any token change; never edit tokens.json by hand)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const out = join(root, "design-system");

/* ---------- parse globals.css ---------- */
const css = read("src/app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "");

function block(selector) {
  const start = css.search(new RegExp(`(^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`));
  if (start === -1) throw new Error(`globals.css: block ${selector} not found`);
  let i = css.indexOf("{", start) + 1;
  let depth = 1;
  const from = i;
  while (depth && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const body = css.slice(from, i - 1);
  const vars = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

const rootVars = block(":root");
const darkVars = block(".dark");
const themeVars = block("@theme inline");

const primitives = Object.fromEntries(Object.entries(rootVars).filter(([k]) => k.startsWith("--ink-")));

const resolve = (value, scope) => {
  let v = value;
  for (let n = 0; n < 8 && /var\(/.test(v); n++) {
    v = v.replace(/var\((--[\w-]+)\)/g, (_, name) => scope[name] ?? rootVars[name] ?? `var(${name})`);
  }
  return v;
};

// var(--ink-50) -> "{color.ink.50}" (W3C alias); literal values stay literal.
const alias = (value) => {
  const m = /^var\(--ink-(\d+)\)$/.exec(value);
  return m ? `{color.ink.${m[1]}}` : value;
};

const isColor = (v) => /^(#|rgb|hsl|transparent|var\(--ink)/.test(v);
const SEMANTIC_KEYS = Object.keys(rootVars).filter((k) => !k.startsWith("--ink-") && isColor(rootVars[k]));

const semantic = (scope, overrides = {}) => {
  const vars = { ...rootVars, ...overrides };
  const outObj = {};
  for (const k of SEMANTIC_KEYS) {
    const raw = vars[k];
    outObj[k.slice(2)] = {
      $type: "color",
      $value: alias(raw),
      $extensions: { "x1.css": k, "x1.resolved": resolve(raw, vars), "x1.tailwind": twColor(k) },
    };
  }
  return outObj;
};

// Which Tailwind color utility exposes a semantic variable (from @theme inline).
function twColor(cssVar) {
  const entry = Object.entries(themeVars).find(([k, v]) => k.startsWith("--color-") && v === `var(${cssVar})`);
  return entry ? entry[0].replace("--color-", "") : null;
}

/* ---------- type ---------- */
const fonts = {};
for (const [k, v] of Object.entries(themeVars)) {
  if (k.startsWith("--font-")) fonts[k.slice(7)] = { $type: "fontFamily", $value: v.split(",").map((s) => s.trim().replace(/^"|"$/g, "")), $extensions: { "x1.css": k, "x1.tailwind": `font-${k.slice(7)}` } };
}
const typeScale = {};
for (const [k, v] of Object.entries(themeVars)) {
  const m = /^--text-([\w-]+?)(--line-height|--letter-spacing)?$/.exec(k);
  if (!m) continue;
  const name = m[1];
  typeScale[name] ??= { $type: "typography", $value: {}, $extensions: { "x1.css": `--text-${name}`, "x1.tailwind": `text-${name}` } };
  if (!m[2]) typeScale[name].$value.fontSize = v;
  if (m[2] === "--line-height") typeScale[name].$value.lineHeight = v;
  if (m[2] === "--letter-spacing") typeScale[name].$value.letterSpacing = v;
}
const ROLE = {
  "display-xl": "display (Manrope). Page h1 / hero, once per page",
  "display-lg": "display (Manrope). Statement, CTA band, landing h1",
  "display-md": "display (Manrope). Section h2",
  title: "display (Manrope). Card and h3 titles",
  lede: "editorial (Inter). Lede under a heading, max ~36rem",
  eyebrow: "UI (Inter). Label above a heading, sentence case",
  data: "data (Inter; JetBrains Mono via font-mono for figures). Chips, captions, dates",
};
for (const k of Object.keys(typeScale)) typeScale[k].$description = ROLE[k] ?? "";

/* ---------- spacing, radii, motion ---------- */
const pick = (keys, type) =>
  Object.fromEntries(keys.filter((k) => rootVars[k]).map((k) => [k.slice(2), { $type: type, $value: rootVars[k], $extensions: { "x1.css": k } }]));

const spacing = pick(["--gutter", "--grid-gap", "--section-y", "--section-y-tight", "--max-w"], "dimension");
spacing.gutter.$description = "Container side padding (.container-x1)";
spacing["grid-gap"].$description = "Column gap of .grid-12 (4 cols < 768px, 12 cols >= 768px)";
spacing["section-y"].$description = "Vertical padding of every default section (.section-y, <Section>)";
spacing["section-y-tight"].$description = "Vertical padding of dense sections (.section-y-tight, <Section spacing=\"tight\">)";
spacing["max-w"].$description = "Max width of .container-x1";

const radii = pick(["--radius-control", "--radius", "--radius-tile"], "dimension");
radii["radius-control"].$description = "Buttons, inputs, tabs triggers (Tailwind rounded-sm / rounded-md)";
radii.radius.$description = "Panels, accordion items, small cards (rounded-lg / rounded-xl)";
radii["radius-tile"].$description = "Cards, tables, shader tiles (rounded-2xl)";
radii.full = { $type: "dimension", $value: "9999px", $description: "Chips, badges, avatars (rounded-full)" };

const motionCss = {};
for (const k of ["--ease-out", "--ease-in-out"]) {
  const v = rootVars[k];
  const n = v.match(/cubic-bezier\(([^)]+)\)/)[1].split(",").map(Number);
  motionCss[k.slice(2)] = { $type: "cubicBezier", $value: n, $extensions: { "x1.css": k } };
}

const gsapSrc = read("src/lib/gsap.ts");
const motionBlock = /export const motion = (\{[\s\S]*?\}) as const;/.exec(gsapSrc)?.[1];
if (!motionBlock) throw new Error("src/lib/gsap.ts: export const motion not found");
const motionObj = Function(`"use strict"; return (${motionBlock});`)();
const gsapTokens = {
  ease: { $type: "string", $value: motionObj.ease, $description: "Default entrance ease (GSAP). CSS twin: --ease-out" },
  easeInOut: { $type: "string", $value: motionObj.easeInOut, $description: "Scene changes, scrubbed swaps" },
  duration: Object.fromEntries(Object.entries(motionObj.dur).map(([k, v]) => [k, { $type: "duration", $value: `${v}s` }])),
  stagger: { $type: "duration", $value: `${motionObj.stagger}s` },
  distance: { $type: "dimension", $value: `${motionObj.distance}px`, $description: "Reveal rise distance" },
};

/* ---------- shader ---------- */
const shaderSrc = read("src/components/brand/grain-shader.tsx");
const sig = /export function GrainShader\(\{([\s\S]*?)\}: GrainShaderProps\)/.exec(shaderSrc)[1];
const defaults = {};
for (const m of sig.matchAll(/(\w+)\s*=\s*([\w.]+)/g)) defaults[m[1]] = m[2] === "true" ? true : m[2] === "false" ? false : Number(m[2]);

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".tsx") ? [p] : [];
  });
}
const presets = { default: { $type: "x1.shader", $value: defaults, $description: "GrainShader defaults" } };
for (const file of walk(join(root, "src/components")).concat(walk(join(root, "src/app")))) {
  const rel = relative(root, file);
  if (rel.includes("design-system") || rel.endsWith("grain-shader.tsx")) continue;
  for (const m of read(rel).matchAll(/<GrainShader([^>]*?)\/>/g)) {
    const props = { ...defaults };
    for (const p of m[1].matchAll(/(\w+)(?:=\{([^}]+)\})?/g)) {
      if (p[1] === "className") continue;
      props[p[1]] = p[2] === undefined ? true : isNaN(Number(p[2])) ? p[2] : Number(p[2]);
    }
    const name = rel.split("/").pop().replace(".tsx", "");
    presets[name] = { $type: "x1.shader", $value: props, $description: `Used in ${rel}` };
  }
}

/* ---------- write ---------- */
const tokens = {
  $description:
    "X1 Wealth design tokens. GENERATED by scripts/export-tokens.mjs from src/app/globals.css, src/lib/gsap.ts and GrainShader usages. Do not edit by hand. Aliases use the W3C {group.token} syntax; x1.resolved is the computed value.",
  color: {
    ink: Object.fromEntries(Object.entries(primitives).map(([k, v]) => [k.slice(6), { $type: "color", $value: v, $extensions: { "x1.css": k } }])),
    light: semantic(rootVars),
    dark: semantic(rootVars, darkVars),
  },
  font: fonts,
  type: typeScale,
  spacing,
  radius: radii,
  motion: { css: motionCss, gsap: gsapTokens },
  shader: {
    $description: "Colors come from color.{light,dark}.grain-lo / grain-hi (must resolve to hex: the shader parses hex only). Presets are prop sets for <GrainShader>.",
    presets,
  },
};

mkdirSync(join(out, "assets/brand"), { recursive: true });
mkdirSync(join(out, "assets/shader"), { recursive: true });
writeFileSync(join(out, "tokens.json"), JSON.stringify(tokens, null, 2) + "\n");

// Assets: logo SVGs and shader source, copied so the kit never drifts from the code.
for (const f of readdirSync(join(root, "public/brand")).filter((f) => f.endsWith(".svg"))) {
  copyFileSync(join(root, "public/brand", f), join(out, "assets/brand", f));
}
copyFileSync(join(root, "src/components/brand/grain-shader.tsx"), join(out, "assets/shader/grain-shader.tsx"));
const glsl = (name) => new RegExp(`const ${name} = \`([\\s\\S]*?)\`;`).exec(shaderSrc)[1].trim() + "\n";
writeFileSync(join(out, "assets/shader/grain.vert"), glsl("VERT"));
writeFileSync(join(out, "assets/shader/grain.frag"), glsl("FRAG"));

const count = (o) => Object.keys(o).length;
console.log(
  `tokens.json: ${count(primitives)} primitives, ${SEMANTIC_KEYS.length} semantic x 2 themes, ${count(typeScale)} type styles, ${count(presets)} shader presets. Assets synced.`
);
