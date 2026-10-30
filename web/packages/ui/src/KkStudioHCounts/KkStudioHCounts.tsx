import { KkStudioHCountsEight } from './internal/layout/KkStudioHCountsEight';
import { KkStudioHCountsHead } from './internal/layout/KkStudioHCountsHead';
import { KkStudioHCountsRoot } from './internal/layout/KkStudioHCountsRoot';
import { KkStudioHCountsTrack } from './internal/layout/KkStudioHCountsTrack';
import { KkStudioHCountsCell } from './internal/ui/KkStudioHCountsCell';
import { KkStudioHCountsText } from './internal/ui/KkStudioHCountsText';

export const KkStudioHCounts = Object.assign(KkStudioHCountsRoot, {
  Head: KkStudioHCountsHead,
  Text: KkStudioHCountsText,
  Track: KkStudioHCountsTrack,
  Eight: KkStudioHCountsEight,
  Cell: KkStudioHCountsCell,
});
