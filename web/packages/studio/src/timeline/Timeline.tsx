import { TimelineLane } from './internal/layout/TimelineLane';
import { TimelineRoot } from './internal/layout/TimelineRoot';
import { TimelineBlocks } from './internal/ui/TimelineBlocks';
import { TimelineCounts } from './internal/ui/TimelineCounts';
import { TimelineCuts } from './internal/ui/TimelineCuts';
import { TimelineDiamonds } from './internal/ui/TimelineDiamonds';
import { TimelineHandles } from './internal/ui/TimelineHandles';
import { TimelineKeyframes } from './internal/ui/TimelineKeyframes';
import { TimelineLoop } from './internal/ui/TimelineLoop';
import { TimelineMarks } from './internal/ui/TimelineMarks';
import { TimelineParts } from './internal/ui/TimelineParts';
import { TimelinePlayhead } from './internal/ui/TimelinePlayhead';
import { TimelineRegions } from './internal/ui/TimelineRegions';
import { TimelineRuler } from './internal/ui/TimelineRuler';
import { TimelineSnap } from './internal/ui/TimelineSnap';
import { TimelineSteps } from './internal/ui/TimelineSteps';
import { TimelineTicks } from './internal/ui/TimelineTicks';
import { TimelineTrim } from './internal/ui/TimelineTrim';
import { TimelineWave } from './internal/ui/TimelineWave';

export type { TimelineBlock } from './internal/ui/TimelineBlocks';
export type { TimelineDiamond } from './internal/ui/TimelineDiamonds';
export type { TimelineHandle } from './internal/ui/TimelineHandles';
export type { TimelineMark } from './internal/ui/TimelineMarks';
export type { TimelinePart } from './internal/ui/TimelineParts';
export type { TimelineRegion } from './internal/ui/TimelineRegions';
export type { TimelineStep } from './internal/ui/TimelineSteps';
export type { TimelineDensity, TimelineSpan } from './timeline-geometry';

export const Timeline = Object.assign(TimelineRoot, {
  Lane: TimelineLane,
  Ruler: TimelineRuler,
  Blocks: TimelineBlocks,
  Diamonds: TimelineDiamonds,
  Marks: TimelineMarks,
  Parts: TimelineParts,
  Regions: TimelineRegions,
  Wave: TimelineWave,
  Counts: TimelineCounts,
  Cuts: TimelineCuts,
  Steps: TimelineSteps,
  Ticks: TimelineTicks,
  Keyframes: TimelineKeyframes,
  Loop: TimelineLoop,
  Trim: TimelineTrim,
  Snap: TimelineSnap,
  Handles: TimelineHandles,
  Playhead: TimelinePlayhead,
});
