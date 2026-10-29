import { KkStudioESegmentsGroup } from './internal/layout/KkStudioESegmentsGroup';
import { KkStudioESegmentsRoot } from './internal/layout/KkStudioESegmentsRoot';
import { KkStudioESegmentsTrack } from './internal/layout/KkStudioESegmentsTrack';
import { KkStudioESegment } from './internal/ui/KkStudioESegment';
import { KkStudioESegmentFill } from './internal/ui/KkStudioESegmentFill';
import { KkStudioESegmentsLabel } from './internal/ui/KkStudioESegmentsLabel';

export const KkStudioESegments = Object.assign(KkStudioESegmentsRoot, {
  Group: KkStudioESegmentsGroup,
  Track: KkStudioESegmentsTrack,
  Segment: KkStudioESegment,
  Fill: KkStudioESegmentFill,
  Label: KkStudioESegmentsLabel,
});
