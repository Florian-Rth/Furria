import { KkPlanStatusStripRoot } from './internal/layout/KkPlanStatusStripRoot';
import { KkPlanStatusStripChip } from './internal/ui/KkPlanStatusStripChip';
import { KkPlanStatusStripCount } from './internal/ui/KkPlanStatusStripCount';

export type { KkPlanStatusChipTone } from './internal/ui/KkPlanStatusStripChip';

export const KkPlanStatusStrip = Object.assign(KkPlanStatusStripRoot, {
  Count: KkPlanStatusStripCount,
  Chip: KkPlanStatusStripChip,
});
