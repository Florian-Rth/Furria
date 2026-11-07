import { KkTimelineHalf } from './internal/layout/KkTimelineHalf';
import { KkTimelineRoot } from './internal/layout/KkTimelineRoot';
import { KkTimelineRow } from './internal/layout/KkTimelineRow';
import { KkTimelineStrip } from './internal/layout/KkTimelineStrip';
import { KkTimelineBlock } from './internal/ui/KkTimelineBlock';
import { KkTimelineBracket } from './internal/ui/KkTimelineBracket';
import { KkTimelineCounts } from './internal/ui/KkTimelineCounts';
import { KkTimelineCuts } from './internal/ui/KkTimelineCuts';
import { KkTimelineDiamond } from './internal/ui/KkTimelineDiamond';
import { KkTimelineHandle } from './internal/ui/KkTimelineHandle';
import { KkTimelineKeyframes } from './internal/ui/KkTimelineKeyframes';
import { KkTimelineLaneKeys } from './internal/ui/KkTimelineLaneKeys';
import { KkTimelineLaneNote } from './internal/ui/KkTimelineLaneNote';
import { KkTimelineLaneSetup } from './internal/ui/KkTimelineLaneSetup';
import { KkTimelineLoop } from './internal/ui/KkTimelineLoop';
import { KkTimelineMarks } from './internal/ui/KkTimelineMarks';
import { KkTimelineParts } from './internal/ui/KkTimelineParts';
import { KkTimelinePlayed } from './internal/ui/KkTimelinePlayed';
import { KkTimelinePlayheadTag } from './internal/ui/KkTimelinePlayheadTag';
import { KkTimelineRegion } from './internal/ui/KkTimelineRegion';
import { KkTimelineRuler } from './internal/ui/KkTimelineRuler';
import { KkTimelineSnap } from './internal/ui/KkTimelineSnap';
import { KkTimelineSoundBand } from './internal/ui/KkTimelineSoundBand';
import { KkTimelineSteps } from './internal/ui/KkTimelineSteps';
import { KkTimelineTicks } from './internal/ui/KkTimelineTicks';
import { KkTimelineTrim } from './internal/ui/KkTimelineTrim';
import { KkTimelineWave } from './internal/ui/KkTimelineWave';

export type { KkTimelineHalfSide } from './internal/layout/KkTimelineHalf';
export type {
  KkTimelineHandlers,
  KkTimelineWindow,
  KkTimelineWork,
} from './internal/layout/KkTimelineRoot';
export type { KkTimelineRowPlace } from './internal/layout/KkTimelineRow';
export type {
  KkTimelineDensity,
  KkTimelineLaneKind,
  KkTimelineLaneLabels,
  KkTimelineRowKind,
  KkTimelineRows,
  KkTimelineSpan,
  KkTimelineWaveLane,
} from './internal/timeline-paint';
export type { KkTimelineBlockTone } from './internal/ui/KkTimelineBlock';
export type {
  KkTimelineBracketGrip,
  KkTimelineBracketKey,
} from './internal/ui/KkTimelineBracket';
export type { KkTimelineHandleTone } from './internal/ui/KkTimelineHandle';
export type { KkTimelineKeyframeMark } from './internal/ui/KkTimelineKeyframes';
export type { KkTimelineLaneSetupState } from './internal/ui/KkTimelineLaneSetup';
export type { KkTimelineLoopRange } from './internal/ui/KkTimelineLoop';
export type { KkTimelineMark } from './internal/ui/KkTimelineMarks';
export type { KkTimelinePart } from './internal/ui/KkTimelinePartBand';
export type { KkTimelineTick } from './internal/ui/KkTimelineRuler';
export type { KkTimelineStepBlock } from './internal/ui/KkTimelineStep';
export type { KkTimelineTickMark } from './internal/ui/KkTimelineTick';
export type { KkTimelinePan } from './internal/use-sticky-name';

export const KkTimeline = Object.assign(KkTimelineRoot, {
  LaneKeys: KkTimelineLaneKeys,
  Strip: KkTimelineStrip,
  Row: KkTimelineRow,
  LaneNote: KkTimelineLaneNote,
  LaneSetup: KkTimelineLaneSetup,
  Block: KkTimelineBlock,
  Bracket: KkTimelineBracket,
  Diamond: KkTimelineDiamond,
  Marks: KkTimelineMarks,
  Half: KkTimelineHalf,
  Ruler: KkTimelineRuler,
  Parts: KkTimelineParts,
  Region: KkTimelineRegion,
  Wave: KkTimelineWave,
  Counts: KkTimelineCounts,
  Cuts: KkTimelineCuts,
  Played: KkTimelinePlayed,
  PlayheadTag: KkTimelinePlayheadTag,
  Steps: KkTimelineSteps,
  Ticks: KkTimelineTicks,
  Keyframes: KkTimelineKeyframes,
  Loop: KkTimelineLoop,
  Trim: KkTimelineTrim,
  Snap: KkTimelineSnap,
  SoundBand: KkTimelineSoundBand,
  Handle: KkTimelineHandle,
});
