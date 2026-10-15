// StatsSlice: data chunks. Tables, statistic lists and short prose render in order, with looks rotated across the page.
import type { SliceProps } from "@/components/slices/types";
import { DataBody } from "./data-body";
import { DataFrame } from "./data-frame";

export function StatsSlice({ chunk, page, layout = "full" }: SliceProps) {
  return (
    <DataFrame chunk={chunk} layout={layout}>
      <DataBody chunk={chunk} page={page} layout={layout} />
    </DataFrame>
  );
}
