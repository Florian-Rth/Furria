import { KkStudioGTimelineLane } from './internal/layout/KkStudioGTimelineLane';
import { KkStudioGTimelineRoot } from './internal/layout/KkStudioGTimelineRoot';
import { KkStudioGTimelineStrip } from './internal/layout/KkStudioGTimelineStrip';
import { KkStudioGTimelineBlock } from './internal/ui/KkStudioGTimelineBlock';
import { KkStudioGTimelineHead } from './internal/ui/KkStudioGTimelineHead';
import { KkStudioGTimelineMark } from './internal/ui/KkStudioGTimelineMark';
import { KkStudioGTimelineRuler } from './internal/ui/KkStudioGTimelineRuler';
import { KkStudioGTimelineSong } from './internal/ui/KkStudioGTimelineSong';
import { KkStudioGTimelineTicks } from './internal/ui/KkStudioGTimelineTicks';
import { KkStudioGTimelineWave } from './internal/ui/KkStudioGTimelineWave';

export type { KkStudioGLaneKind } from './internal/logic/studio-g-lane-kinds';
export type { KkStudioGDrag } from './internal/logic/use-drag-delta';
export type {
  KkStudioGScrubPhase,
  KkStudioGTimelineGestures,
} from './internal/logic/use-timeline-gestures';
export type { KkStudioGBlockKind } from './internal/ui/KkStudioGTimelineBlock';
export type {
  KkStudioGRulerLabel,
  KkStudioGRulerTick,
  KkStudioGRulerWeight,
} from './internal/ui/KkStudioGTimelineRuler';
export type { KkStudioGTick, KkStudioGTickBar } from './internal/ui/KkStudioGTimelineTicks';

export const KkStudioGTimeline = Object.assign(KkStudioGTimelineRoot, {
  Head: KkStudioGTimelineHead,
  Strip: KkStudioGTimelineStrip,
  Lane: KkStudioGTimelineLane,
  Ruler: KkStudioGTimelineRuler,
  Wave: KkStudioGTimelineWave,
  Song: KkStudioGTimelineSong,
  Block: KkStudioGTimelineBlock,
  Mark: KkStudioGTimelineMark,
  Ticks: KkStudioGTimelineTicks,
});
