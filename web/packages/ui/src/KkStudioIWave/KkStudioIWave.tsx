import { KkStudioIWaveRoot } from './internal/layout/KkStudioIWaveRoot';
import { KkStudioIWaveBand } from './internal/ui/KkStudioIWaveBand';
import { KkStudioIWaveBars } from './internal/ui/KkStudioIWaveBars';
import { KkStudioIWaveEdge } from './internal/ui/KkStudioIWaveEdge';
import { KkStudioIWaveMark } from './internal/ui/KkStudioIWaveMark';
import { KkStudioIWavePlayhead } from './internal/ui/KkStudioIWavePlayhead';
import { KkStudioIWaveSeam } from './internal/ui/KkStudioIWaveSeam';
import { KkStudioIWaveShade } from './internal/ui/KkStudioIWaveShade';
import { KkStudioIWaveTicks } from './internal/ui/KkStudioIWaveTicks';

export type { KkStudioIWaveBandPiece } from './internal/ui/KkStudioIWaveBand';
export type { KkStudioIWaveNumbers, KkStudioIWaveTick } from './internal/ui/KkStudioIWaveTicks';

export const KkStudioIWave = Object.assign(KkStudioIWaveRoot, {
  Bars: KkStudioIWaveBars,
  Ticks: KkStudioIWaveTicks,
  Shade: KkStudioIWaveShade,
  Seam: KkStudioIWaveSeam,
  Mark: KkStudioIWaveMark,
  Playhead: KkStudioIWavePlayhead,
  Edge: KkStudioIWaveEdge,
  Band: KkStudioIWaveBand,
});
