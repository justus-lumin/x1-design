// Maps a chunk's SliceKind (decided in lib/content.ts → classify) to the slice that renders it.
import type { SliceKind } from "@/lib/content";
import type { SliceProps } from "@/components/slices/types";
import { ChecklistSlice } from "./checklist";
import { FaqSlice } from "./faq";
import { FeaturesSlice } from "./features";
import { ProseSlice } from "./prose";
import { QuoteSlice } from "./quote";
import { RankedSlice } from "./ranked";
import { SourcesSlice } from "./sources";
import { StatementSlice } from "./statement";
import { StatsSlice } from "./stats";
import { StepsSlice } from "./steps";
import { TableSlice } from "./table";

export const SLICES: Record<SliceKind, (p: SliceProps) => React.ReactNode> = {
  prose: ProseSlice,
  statement: StatementSlice,
  features: FeaturesSlice,
  steps: StepsSlice,
  checklist: ChecklistSlice,
  table: TableSlice,
  faq: FaqSlice,
  quote: QuoteSlice,
  stats: StatsSlice,
  ranked: RankedSlice,
  sources: SourcesSlice,
};

export function Slice(props: SliceProps) {
  const C = SLICES[props.chunk.kind];
  return <C {...props} />;
}
