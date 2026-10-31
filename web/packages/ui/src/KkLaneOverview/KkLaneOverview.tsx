import { KkLaneTrackWave } from '../KkLaneTrack/internal/ui/KkLaneTrackWave';
import { KkLaneOverviewRoot } from './internal/layout/KkLaneOverviewRoot';
import { KkLaneOverviewBand } from './internal/ui/KkLaneOverviewBand';
import { KkLaneOverviewBracket } from './internal/ui/KkLaneOverviewBracket';
import { KkLaneOverviewPlayhead } from './internal/ui/KkLaneOverviewPlayhead';

export type { KkLaneOverviewKey } from './internal/ui/KkLaneOverviewBracket';
export type { KkLaneOverviewEdgeSide } from './internal/ui/KkLaneOverviewEdge';

export const KkLaneOverview = Object.assign(KkLaneOverviewRoot, {
  Band: KkLaneOverviewBand,
  Wave: KkLaneTrackWave,
  Bracket: KkLaneOverviewBracket,
  Playhead: KkLaneOverviewPlayhead,
});
