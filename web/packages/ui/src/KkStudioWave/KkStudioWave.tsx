import { KkStudioWaveRoot } from './internal/layout/KkStudioWaveRoot';
import { KkStudioWaveBars } from './internal/ui/KkStudioWaveBars';
import { KkStudioWaveBeats } from './internal/ui/KkStudioWaveBeats';
import { KkStudioWaveCut } from './internal/ui/KkStudioWaveCut';
import { KkStudioWaveHandle } from './internal/ui/KkStudioWaveHandle';
import { KkStudioWaveRegion } from './internal/ui/KkStudioWaveRegion';
import { KkStudioWaveTicks } from './internal/ui/KkStudioWaveTicks';

export type { KkStudioWaveBeat } from './internal/ui/KkStudioWaveBeats';
export type { KkStudioWaveHandleEdge } from './internal/ui/KkStudioWaveHandle';
export type { KkStudioWaveTick } from './internal/ui/KkStudioWaveTicks';

export const KkStudioWave = Object.assign(KkStudioWaveRoot, {
  Bars: KkStudioWaveBars,
  Beats: KkStudioWaveBeats,
  Region: KkStudioWaveRegion,
  Cut: KkStudioWaveCut,
  Handle: KkStudioWaveHandle,
  Ticks: KkStudioWaveTicks,
});
