// Pure text helpers for hub indexes (safe to import from client components).

/** Trim to ~n characters at a word boundary, without dangling punctuation. */
export function clip(text: string, n = 110) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n + 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > n * 0.6 ? cut.slice(0, at) : t.slice(0, n)).replace(/[\s,;:.\-–(]+$/, "")}…`;
}

/** Headline figure from a statistics title, e.g. "…2026: 25.3M HNWIs, 250k UHNWIs" → { value: "25.3M", unit: "HNWIs" }. */
export function titleFigure(title: string) {
  const m = title.match(/:\s*(\$?[\d.,]+\s?[kMBT]?)\s+([A-Za-z][\w$]*(?:\s+AUM)?)/);
  return m ? { value: m[1].replace(/\s/g, ""), unit: m[2] } : null;
}

