import { KkEightsSetupList } from './internal/layout/KkEightsSetupList';
import { KkEightsSetupRoot } from './internal/layout/KkEightsSetupRoot';
import { KkEightsSetupNext } from './internal/ui/KkEightsSetupNext';
import { KkEightsSetupRail } from './internal/ui/KkEightsSetupRail';
import { KkEightsSetupRow } from './internal/ui/KkEightsSetupRow';

export type { KkEightsSetupSegment } from './internal/ui/KkEightsSetupRail';

export const KkEightsSetup = Object.assign(KkEightsSetupRoot, {
  Rail: KkEightsSetupRail,
  Next: KkEightsSetupNext,
  List: KkEightsSetupList,
  Row: KkEightsSetupRow,
});
