import { KkScoreTrackRoot } from './internal/layout/KkScoreTrackRoot';
import { KkScoreTrackParts } from './internal/ui/KkScoreTrackParts';
import { KkScoreTrackPlayed } from './internal/ui/KkScoreTrackPlayed';
import { KkScoreTrackPlayhead } from './internal/ui/KkScoreTrackPlayhead';
import { KkScoreTrackRuler } from './internal/ui/KkScoreTrackRuler';
import { KkScoreTrackSteps } from './internal/ui/KkScoreTrackSteps';
import { KkScoreTrackTicks } from './internal/ui/KkScoreTrackTicks';
import { KkScoreTrackWave } from './internal/ui/KkScoreTrackWave';

export type { KkScoreZoom } from './internal/layout/KkScoreTrackRoot';
export type { KkScoreTrackSize } from './internal/score-paint';
export type { KkScoreTrackPart } from './internal/ui/KkScoreTrackPartBand';
export type { KkScoreTrackTick } from './internal/ui/KkScoreTrackRuler';
export type { KkScoreTrackStepBlock } from './internal/ui/KkScoreTrackStep';
export type { KkScoreTrackTickMark } from './internal/ui/KkScoreTrackTick';

export const KkScoreTrack = Object.assign(KkScoreTrackRoot, {
  Ruler: KkScoreTrackRuler,
  Parts: KkScoreTrackParts,
  Wave: KkScoreTrackWave,
  Played: KkScoreTrackPlayed,
  Steps: KkScoreTrackSteps,
  Ticks: KkScoreTrackTicks,
  Playhead: KkScoreTrackPlayhead,
});
