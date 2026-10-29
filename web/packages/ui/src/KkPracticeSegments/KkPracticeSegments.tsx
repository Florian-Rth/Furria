import { KkPracticeSegmentsGroup } from './internal/layout/KkPracticeSegmentsGroup';
import { KkPracticeSegmentsRoot } from './internal/layout/KkPracticeSegmentsRoot';
import { KkPracticeSegmentsTrack } from './internal/layout/KkPracticeSegmentsTrack';
import { KkPracticeSegment } from './internal/ui/KkPracticeSegment';
import { KkPracticeSegmentFill } from './internal/ui/KkPracticeSegmentFill';
import { KkPracticeSegmentsLabel } from './internal/ui/KkPracticeSegmentsLabel';

export const KkPracticeSegments = Object.assign(KkPracticeSegmentsRoot, {
  Group: KkPracticeSegmentsGroup,
  Track: KkPracticeSegmentsTrack,
  Segment: KkPracticeSegment,
  Fill: KkPracticeSegmentFill,
  Label: KkPracticeSegmentsLabel,
});
