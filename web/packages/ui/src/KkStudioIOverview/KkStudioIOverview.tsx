import { KkStudioIOverviewRoot } from './internal/layout/KkStudioIOverviewRoot';
import { KkStudioIOverviewSection } from './internal/layout/KkStudioIOverviewSection';
import { KkStudioIOverviewSpots } from './internal/layout/KkStudioIOverviewSpots';
import { KkStudioIOverviewStage } from './internal/layout/KkStudioIOverviewStage';
import { KkStudioIOverviewHead } from './internal/ui/KkStudioIOverviewHead';
import { KkStudioIOverviewSong } from './internal/ui/KkStudioIOverviewSong';
import { KkStudioIOverviewSpot } from './internal/ui/KkStudioIOverviewSpot';

export const KkStudioIOverview = Object.assign(KkStudioIOverviewRoot, {
  Section: KkStudioIOverviewSection,
  Head: KkStudioIOverviewHead,
  Song: KkStudioIOverviewSong,
  Spots: KkStudioIOverviewSpots,
  Spot: KkStudioIOverviewSpot,
  Stage: KkStudioIOverviewStage,
});
