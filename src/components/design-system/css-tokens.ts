// Server-only: reads the token layers straight out of globals.css so the reference page can't drift from the code.
// Same parsing rules as scripts/export-tokens.mjs (which writes design-system/tokens.json).
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type VarMap = Record<string, string>;

function block(css: string, selector: string): VarMap {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = css.search(new RegExp(`(^|\\n)\\s*${esc}\\s*\\{`));
  if (start === -1) return {};
  let i = css.indexOf("{", start) + 1;
  const from = i;
  let depth = 1;
  while (depth && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const vars: VarMap = {};
  for (const m of css.slice(from, i - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

export function readCssTokens() {
  const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const root = block(css, ":root");
  const dark = block(css, ".dark");
  const theme = block(css, "@theme inline");

  const primitives = Object.entries(root).filter(([k]) => k.startsWith("--ink-"));
  const isColor = (v: string) => /^(#|rgb|hsl|transparent|var\(--ink)/.test(v);
  const semantic = Object.keys(root).filter((k) => !k.startsWith("--ink-") && isColor(root[k]));

  /** Inline style that re-applies the light semantic layer inside a dark page (for side-by-side demos). */
  const lightScope = Object.fromEntries(semantic.map((k) => [k, root[k]]));

  const typeScale = Object.entries(theme)
    .filter(([k]) => /^--text-[\w-]+$/.test(k) && !k.includes("--line-height") && !/--letter-spacing$/.test(k))
    .filter(([k]) => !/--text-[\w-]+--/.test(k))
    .map(([k, size]) => {
      const name = k.slice(7);
      return { name, size, lineHeight: theme[`${k}--line-height`], tracking: theme[`${k}--letter-spacing`] };
    });

  const fonts = Object.entries(theme)
    .filter(([k]) => k.startsWith("--font-"))
    .map(([k, v]) => ({ name: k.slice(7), stack: v }));

  const tailwindColor = (cssVar: string) =>
    Object.entries(theme).find(([k, v]) => k.startsWith("--color-") && v === `var(${cssVar})`)?.[0].slice(8) ?? null;

  return { root, dark, theme, primitives, semantic, lightScope, typeScale, fonts, tailwindColor };
}

export type CssTokens = ReturnType<typeof readCssTokens>;
