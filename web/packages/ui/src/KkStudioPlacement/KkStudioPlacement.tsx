import { KkStudioCountsHead } from '../KkStudioCounts/internal/layout/KkStudioCountsHead';
import { KkStudioCountsText } from '../KkStudioCounts/internal/ui/KkStudioCountsText';
import { KkStudioPlacementRoot } from './internal/layout/KkStudioPlacementRoot';
import { KkStudioPlacementRow } from './internal/layout/KkStudioPlacementRow';
import { KkStudioPlacementTrack } from './internal/layout/KkStudioPlacementTrack';
import { KkStudioPlacementBar } from './internal/ui/KkStudioPlacementBar';
import { KkStudioPlacementNudge } from './internal/ui/KkStudioPlacementNudge';
import { KkStudioPlacementPart } from './internal/ui/KkStudioPlacementPart';

export type { KkStudioNudgeDirection } from './internal/ui/KkStudioPlacementNudge';

export const KkStudioPlacement = Object.assign(KkStudioPlacementRoot, {
  Head: KkStudioCountsHead,
  Text: KkStudioCountsText,
  Row: KkStudioPlacementRow,
  Nudge: KkStudioPlacementNudge,
  Track: KkStudioPlacementTrack,
  Part: KkStudioPlacementPart,
  Bar: KkStudioPlacementBar,
});
