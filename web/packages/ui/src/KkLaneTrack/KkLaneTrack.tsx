import { KkLaneTrackRoot } from './internal/layout/KkLaneTrackRoot';
import { KkLaneTrackBlock } from './internal/ui/KkLaneTrackBlock';
import { KkLaneTrackBorder } from './internal/ui/KkLaneTrackBorder';
import { KkLaneTrackDiamond } from './internal/ui/KkLaneTrackDiamond';
import { KkLaneTrackEmpty } from './internal/ui/KkLaneTrackEmpty';
import { KkLaneTrackPlayhead } from './internal/ui/KkLaneTrackPlayhead';
import { KkLaneTrackRow } from './internal/ui/KkLaneTrackRow';
import { KkLaneTrackScrub } from './internal/ui/KkLaneTrackScrub';
import { KkLaneTrackTicks } from './internal/ui/KkLaneTrackTicks';
import { KkLaneTrackWave } from './internal/ui/KkLaneTrackWave';

export type { KkLaneTrackRowSize } from './internal/lane-geometry';
export { LANE_HEAD_REM as KK_LANE_HEAD_REM } from './internal/lane-geometry';
export type { KkLaneTrackBlockTone } from './internal/ui/KkLaneTrackBlock';
export type { KkLaneTrackTick } from './internal/ui/KkLaneTrackTicks';

export const KkLaneTrack = Object.assign(KkLaneTrackRoot, {
  Row: KkLaneTrackRow,
  Block: KkLaneTrackBlock,
  Border: KkLaneTrackBorder,
  Diamond: KkLaneTrackDiamond,
  Empty: KkLaneTrackEmpty,
  Playhead: KkLaneTrackPlayhead,
  Scrub: KkLaneTrackScrub,
  Ticks: KkLaneTrackTicks,
  Wave: KkLaneTrackWave,
});
