import { KkStudioHWaveRoot } from './internal/layout/KkStudioHWaveRoot';
import { KkStudioHWaveBars } from './internal/ui/KkStudioHWaveBars';
import { KkStudioHWaveCut } from './internal/ui/KkStudioHWaveCut';
import { KkStudioHWaveHandle } from './internal/ui/KkStudioHWaveHandle';
import { KkStudioHWaveRegion } from './internal/ui/KkStudioHWaveRegion';
import { KkStudioHWaveTicks } from './internal/ui/KkStudioHWaveTicks';

export type { KkStudioHWaveHandleEdge } from './internal/ui/KkStudioHWaveHandle';
export type { KkStudioHWaveTick } from './internal/ui/KkStudioHWaveTicks';

export const KkStudioHWave = Object.assign(KkStudioHWaveRoot, {
  Bars: KkStudioHWaveBars,
  Region: KkStudioHWaveRegion,
  Cut: KkStudioHWaveCut,
  Handle: KkStudioHWaveHandle,
  Ticks: KkStudioHWaveTicks,
});
