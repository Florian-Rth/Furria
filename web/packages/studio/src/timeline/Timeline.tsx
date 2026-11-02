import { TimelineRoot } from './internal/layout/TimelineRoot';
import { TimelineCounts } from './internal/ui/TimelineCounts';
import { TimelineCuts } from './internal/ui/TimelineCuts';
import { TimelineKeyframes } from './internal/ui/TimelineKeyframes';
import { TimelineLoop } from './internal/ui/TimelineLoop';
import { TimelineParts } from './internal/ui/TimelineParts';
import { TimelinePlayhead } from './internal/ui/TimelinePlayhead';
import { TimelineRuler } from './internal/ui/TimelineRuler';
import { TimelineSteps } from './internal/ui/TimelineSteps';
import { TimelineTicks } from './internal/ui/TimelineTicks';
import { TimelineWave } from './internal/ui/TimelineWave';

export type { TimelinePart } from './internal/ui/TimelineParts';
export type { TimelineStep } from './internal/ui/TimelineSteps';
export type { TimelineDensity, TimelineSpan } from './timeline-geometry';

export const Timeline = Object.assign(TimelineRoot, {
  Ruler: TimelineRuler,
  Parts: TimelineParts,
  Wave: TimelineWave,
  Counts: TimelineCounts,
  Cuts: TimelineCuts,
  Steps: TimelineSteps,
  Ticks: TimelineTicks,
  Keyframes: TimelineKeyframes,
  Loop: TimelineLoop,
  Playhead: TimelinePlayhead,
});
