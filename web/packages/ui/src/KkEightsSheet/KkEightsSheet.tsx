import { KkEightsSheetCounts } from './internal/layout/KkEightsSheetCounts';
import { KkEightsSheetRoot } from './internal/layout/KkEightsSheetRoot';
import { KkEightsSheetRow } from './internal/layout/KkEightsSheetRow';
import { KkEightsSheetCount } from './internal/ui/KkEightsSheetCount';
import { KkEightsSheetCursor } from './internal/ui/KkEightsSheetCursor';
import { KkEightsSheetEmpty } from './internal/ui/KkEightsSheetEmpty';
import { KkEightsSheetHead } from './internal/ui/KkEightsSheetHead';
import { KkEightsSheetLabel } from './internal/ui/KkEightsSheetLabel';
import { KkEightsSheetPart } from './internal/ui/KkEightsSheetPart';

export type { KkEightsDensity } from './internal/logic/sheet-metrics';
export type {
  KkEightsSheetCountTone,
  KkEightsSheetKey,
} from './internal/ui/KkEightsSheetCount';
export type { KkEightsSheetEdgeHandle } from './internal/ui/KkEightsSheetEdge';
export type { KkEightsSheetLabelLane } from './internal/ui/KkEightsSheetLabel';
export type { KkEightsSheetGrip } from './internal/ui/KkEightsSheetPart';

export const KkEightsSheet = Object.assign(KkEightsSheetRoot, {
  Head: KkEightsSheetHead,
  Row: KkEightsSheetRow,
  Part: KkEightsSheetPart,
  Label: KkEightsSheetLabel,
  Counts: KkEightsSheetCounts,
  Count: KkEightsSheetCount,
  Cursor: KkEightsSheetCursor,
  Empty: KkEightsSheetEmpty,
});
