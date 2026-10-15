// Pure helpers for data tables, importable from server components (variant choice happens on the server).
import type { Block } from "@/lib/content";

export type TableBlock = Extract<Block, { t: "table" }>;
export type TableVariant = "bars" | "banded" | "tile";

const NUMERIC =
  /^[~≈<>+\-−]?\s?[$€£]?\d[\d,.]*\s?(?:%|[kmbt]|bps|x|yrs?|years?|million|billion|trillion)?\+?$|^[$€£]?\d[\d,.]*[kmbt%]?\s?[-–]\s?[$€£]?\d[\d,.]*[kmbt%]?$/i;
export const isX1 = (s: string) => /\bX1\b/.test(s);

export function numericColumns(head: string[], rows: string[][]) {
  const cols = Math.max(head.length, ...rows.map((r) => r.length));
  return Array.from({ length: cols }, (_, j) => {
    if (j === 0) return false;
    const cells = rows.map((r) => (r[j] ?? "").trim()).filter(Boolean);
    return cells.length > 0 && cells.filter((c) => NUMERIC.test(c)).length >= cells.length * 0.7;
  });
}

/** Values for a bar chart, or null when the column isn't one comparable quantity. */
export function barValues(block: TableBlock) {
  if (block.rows.length < 3 || block.rows.length > 10) return null;
  if (block.rows.some((r) => r.length !== 2)) return null;
  const unit = (v: string) => v.replace(/[\d.,~≈$€£+\s]/g, "").toLowerCase();
  const cells = block.rows.map((r) => r[1].trim());
  if (cells.some((c) => !/^[~≈]?[$€£]?\d[\d,.]*\s?(%|[kmbt]|x)?\+?$/i.test(c))) return null;
  const u = unit(cells[0]);
  if (cells.some((c) => unit(c) !== u)) return null;
  const vals = cells.map((c) => parseFloat(c.replace(/[^\d.]/g, "")));
  if (vals.some((v) => !isFinite(v))) return null;
  return vals;
}

export function pickTableVariant(block: TableBlock, ordinal: number): TableVariant {
  if (barValues(block)) return "bars";
  return ordinal % 2 === 0 ? "banded" : "tile";
}

