import { KkTimelineHalf } from './internal/layout/KkTimelineHalf';
import { KkTimelineRoot } from './internal/layout/KkTimelineRoot';
import { KkTimelineStrip } from './internal/layout/KkTimelineStrip';
import { KkTimelineCounts } from './internal/ui/KkTimelineCounts';
import { KkTimelineCuts } from './internal/ui/KkTimelineCuts';
import { KkTimelineHandle } from './internal/ui/KkTimelineHandle';
import { KkTimelineKeyframes } from './internal/ui/KkTimelineKeyframes';
import { KkTimelineLoop } from './internal/ui/KkTimelineLoop';
import { KkTimelineParts } from './internal/ui/KkTimelineParts';
import { KkTimelinePlayed } from './internal/ui/KkTimelinePlayed';
import { KkTimelinePlayhead } from './internal/ui/KkTimelinePlayhead';
import { KkTimelineRegion } from './internal/ui/KkTimelineRegion';
import { KkTimelineRuler } from './internal/ui/KkTimelineRuler';
import { KkTimelineSnap } from './internal/ui/KkTimelineSnap';
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
export type { KkTimelineDensity, KkTimelineSpan } from './internal/timeline-paint';
export type { KkTimelineKeyframeMark } from './internal/ui/KkTimelineKeyframes';
export type { KkTimelineLoopRange } from './internal/ui/KkTimelineLoop';
export type { KkTimelinePart } from './internal/ui/KkTimelinePartBand';
export type { KkTimelineTick } from './internal/ui/KkTimelineRuler';
export type { KkTimelineStepBlock } from './internal/ui/KkTimelineStep';
export type { KkTimelineTickMark } from './internal/ui/KkTimelineTick';

export const KkTimeline = Object.assign(KkTimelineRoot, {
  Strip: KkTimelineStrip,
  Half: KkTimelineHalf,
  Ruler: KkTimelineRuler,
  Parts: KkTimelineParts,
  Region: KkTimelineRegion,
  Wave: KkTimelineWave,
  Counts: KkTimelineCounts,
  Cuts: KkTimelineCuts,
  Played: KkTimelinePlayed,
  Steps: KkTimelineSteps,
  Ticks: KkTimelineTicks,
  Keyframes: KkTimelineKeyframes,
  Loop: KkTimelineLoop,
  Trim: KkTimelineTrim,
  Snap: KkTimelineSnap,
  Handle: KkTimelineHandle,
  Playhead: KkTimelinePlayhead,
});
