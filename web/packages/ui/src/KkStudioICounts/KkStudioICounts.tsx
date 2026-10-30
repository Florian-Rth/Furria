import { KkStudioIWavePlayhead } from '../KkStudioIWave/internal/ui/KkStudioIWavePlayhead';
import { KkStudioICountsRoot } from './internal/layout/KkStudioICountsRoot';
import { KkStudioICountsEmpty } from './internal/ui/KkStudioICountsEmpty';
import { KkStudioICountsLane } from './internal/ui/KkStudioICountsLane';
import { KkStudioICountsRuler } from './internal/ui/KkStudioICountsRuler';

export type { KkStudioICountsCell } from './internal/ui/KkStudioICountsRuler';

export const KkStudioICounts = Object.assign(KkStudioICountsRoot, {
  Ruler: KkStudioICountsRuler,
  Lane: KkStudioICountsLane,
  Empty: KkStudioICountsEmpty,
  Playhead: KkStudioIWavePlayhead,
});
