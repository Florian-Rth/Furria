import { KkTimelineRoot } from './internal/layout/KkTimelineRoot';
import { KkTimelineCounts } from './internal/ui/KkTimelineCounts';
import { KkTimelineCuts } from './internal/ui/KkTimelineCuts';
import { KkTimelineKeyframes } from './internal/ui/KkTimelineKeyframes';
import { KkTimelineLoop } from './internal/ui/KkTimelineLoop';
import { KkTimelineParts } from './internal/ui/KkTimelineParts';
import { KkTimelinePlayed } from './internal/ui/KkTimelinePlayed';
import { KkTimelinePlayhead } from './internal/ui/KkTimelinePlayhead';
import { KkTimelineRuler } from './internal/ui/KkTimelineRuler';
import { KkTimelineSteps } from './internal/ui/KkTimelineSteps';
import { KkTimelineTicks } from './internal/ui/KkTimelineTicks';
import { KkTimelineWave } from './internal/ui/KkTimelineWave';

export type { KkTimelineWindow } from './internal/layout/KkTimelineRoot';
export type { KkTimelineDensity } from './internal/timeline-paint';
export type { KkTimelineKeyframeMark } from './internal/ui/KkTimelineKeyframes';
export type { KkTimelineLoopRange } from './internal/ui/KkTimelineLoop';
export type { KkTimelinePart } from './internal/ui/KkTimelinePartBand';
export type { KkTimelineTick } from './internal/ui/KkTimelineRuler';
export type { KkTimelineStepBlock } from './internal/ui/KkTimelineStep';
export type { KkTimelineTickMark } from './internal/ui/KkTimelineTick';

export const KkTimeline = Object.assign(KkTimelineRoot, {
  Ruler: KkTimelineRuler,
  Parts: KkTimelineParts,
  Wave: KkTimelineWave,
  Counts: KkTimelineCounts,
  Cuts: KkTimelineCuts,
  Played: KkTimelinePlayed,
  Steps: KkTimelineSteps,
  Ticks: KkTimelineTicks,
  Keyframes: KkTimelineKeyframes,
  Loop: KkTimelineLoop,
  Playhead: KkTimelinePlayhead,
});
