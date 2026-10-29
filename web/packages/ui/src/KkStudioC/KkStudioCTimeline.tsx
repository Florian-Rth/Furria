import { KkStudioCTimelineLane } from './internal/layout/KkStudioCTimelineLane';
import { KkStudioCTimelineRoot } from './internal/layout/KkStudioCTimelineRoot';
import { KkStudioCTimelineTrack } from './internal/layout/KkStudioCTimelineTrack';
import { KkStudioCTimelineBlock } from './internal/ui/KkStudioCTimelineBlock';
import { KkStudioCTimelineLabels } from './internal/ui/KkStudioCTimelineLabels';
import { KkStudioCTimelineLoop } from './internal/ui/KkStudioCTimelineLoop';
import { KkStudioCTimelineMarks } from './internal/ui/KkStudioCTimelineMarks';
import { KkStudioCTimelineSpans } from './internal/ui/KkStudioCTimelineSpans';
import { KkStudioCTimelineTicks } from './internal/ui/KkStudioCTimelineTicks';
import { KkStudioCTimelineWave } from './internal/ui/KkStudioCTimelineWave';

export const KkStudioCTimeline = Object.assign(KkStudioCTimelineRoot, {
  Labels: KkStudioCTimelineLabels,
  Track: KkStudioCTimelineTrack,
  Lane: KkStudioCTimelineLane,
  Block: KkStudioCTimelineBlock,
  Ticks: KkStudioCTimelineTicks,
  Wave: KkStudioCTimelineWave,
  Spans: KkStudioCTimelineSpans,
  Marks: KkStudioCTimelineMarks,
  Loop: KkStudioCTimelineLoop,
});
