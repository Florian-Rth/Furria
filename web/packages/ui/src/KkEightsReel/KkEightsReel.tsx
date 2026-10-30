import { KkEightsReelCard } from './internal/layout/KkEightsReelCard';
import { KkEightsReelCounts } from './internal/layout/KkEightsReelCounts';
import { KkEightsReelRoot } from './internal/layout/KkEightsReelRoot';
import { KkEightsReelStage } from './internal/layout/KkEightsReelStage';
import { KkEightsReelCount } from './internal/ui/KkEightsReelCount';

export const KkEightsReel = Object.assign(KkEightsReelRoot, {
  Card: KkEightsReelCard,
  Stage: KkEightsReelStage,
  Counts: KkEightsReelCounts,
  Count: KkEightsReelCount,
});
