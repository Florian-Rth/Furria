import { KkStudioHCountsHead } from '../KkStudioHCounts/internal/layout/KkStudioHCountsHead';
import { KkStudioHCountsText } from '../KkStudioHCounts/internal/ui/KkStudioHCountsText';
import { KkStudioHPlacementRoot } from './internal/layout/KkStudioHPlacementRoot';
import { KkStudioHPlacementRow } from './internal/layout/KkStudioHPlacementRow';
import { KkStudioHPlacementTrack } from './internal/layout/KkStudioHPlacementTrack';
import { KkStudioHPlacementBar } from './internal/ui/KkStudioHPlacementBar';
import { KkStudioHPlacementNudge } from './internal/ui/KkStudioHPlacementNudge';
import { KkStudioHPlacementPart } from './internal/ui/KkStudioHPlacementPart';

export type { KkStudioHNudgeDirection } from './internal/ui/KkStudioHPlacementNudge';

export const KkStudioHPlacement = Object.assign(KkStudioHPlacementRoot, {
  Head: KkStudioHCountsHead,
  Text: KkStudioHCountsText,
  Row: KkStudioHPlacementRow,
  Nudge: KkStudioHPlacementNudge,
  Track: KkStudioHPlacementTrack,
  Part: KkStudioHPlacementPart,
  Bar: KkStudioHPlacementBar,
});
