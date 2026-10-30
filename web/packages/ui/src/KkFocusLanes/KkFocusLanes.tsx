import { KkFocusLanesCenter } from './internal/layout/KkFocusLanesCenter';
import { KkFocusLanesNames } from './internal/layout/KkFocusLanesNames';
import { KkFocusLanesOver } from './internal/layout/KkFocusLanesOver';
import { KkFocusLanesRoot } from './internal/layout/KkFocusLanesRoot';
import { KkFocusLanesRow } from './internal/layout/KkFocusLanesRow';
import { KkFocusLanesTrack } from './internal/layout/KkFocusLanesTrack';
import { KkFocusLanesView } from './internal/layout/KkFocusLanesView';
import { KkFocusLanesBeats } from './internal/ui/KkFocusLanesBeats';
import { KkFocusLanesBorder } from './internal/ui/KkFocusLanesBorder';
import { KkFocusLanesKey } from './internal/ui/KkFocusLanesKey';
import { KkFocusLanesName } from './internal/ui/KkFocusLanesName';
import { KkFocusLanesPart } from './internal/ui/KkFocusLanesPart';
import { KkFocusLanesPlayhead } from './internal/ui/KkFocusLanesPlayhead';
import { KkFocusLanesSeek } from './internal/ui/KkFocusLanesSeek';
import { KkFocusLanesSpan } from './internal/ui/KkFocusLanesSpan';
import { KkFocusLanesStep } from './internal/ui/KkFocusLanesStep';
import { KkFocusLanesWave } from './internal/ui/KkFocusLanesWave';

export type { KkFocusLane } from './internal/lane-heights';
export type { KkFocusLanesBeat } from './internal/ui/KkFocusLanesBeats';

export const KkFocusLanes = Object.assign(KkFocusLanesRoot, {
  Names: KkFocusLanesNames,
  Name: KkFocusLanesName,
  View: KkFocusLanesView,
  Track: KkFocusLanesTrack,
  Over: KkFocusLanesOver,
  Row: KkFocusLanesRow,
  Center: KkFocusLanesCenter,
  Seek: KkFocusLanesSeek,
  Part: KkFocusLanesPart,
  Step: KkFocusLanesStep,
  Border: KkFocusLanesBorder,
  Wave: KkFocusLanesWave,
  Beats: KkFocusLanesBeats,
  Span: KkFocusLanesSpan,
  Key: KkFocusLanesKey,
  Playhead: KkFocusLanesPlayhead,
});
