import { KkPracticeSegmentsGroup } from './internal/layout/KkPracticeSegmentsGroup';
import { KkPracticeSegmentsRoot } from './internal/layout/KkPracticeSegmentsRoot';
import { KkPracticeSegment } from './internal/ui/KkPracticeSegment';
import { KkPracticeSegmentFill } from './internal/ui/KkPracticeSegmentFill';
import { KkPracticeSegmentsPart } from './internal/ui/KkPracticeSegmentsPart';

export const KkPracticeSegments = Object.assign(KkPracticeSegmentsRoot, {
  Group: KkPracticeSegmentsGroup,
  Segment: KkPracticeSegment,
  Fill: KkPracticeSegmentFill,
  Part: KkPracticeSegmentsPart,
});
