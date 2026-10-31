import { KkStudioCountsEight } from './internal/layout/KkStudioCountsEight';
import { KkStudioCountsHead } from './internal/layout/KkStudioCountsHead';
import { KkStudioCountsRoot } from './internal/layout/KkStudioCountsRoot';
import { KkStudioCountsTrack } from './internal/layout/KkStudioCountsTrack';
import { KkStudioCountsCell } from './internal/ui/KkStudioCountsCell';
import { KkStudioCountsText } from './internal/ui/KkStudioCountsText';

export const KkStudioCounts = Object.assign(KkStudioCountsRoot, {
  Head: KkStudioCountsHead,
  Text: KkStudioCountsText,
  Track: KkStudioCountsTrack,
  Eight: KkStudioCountsEight,
  Cell: KkStudioCountsCell,
});
