import { KkGroupStageRoot } from './internal/layout/KkGroupStageRoot';
import { KkGroupStageMeta } from './internal/ui/KkGroupStageMeta';
import { KkGroupStageResting } from './internal/ui/KkGroupStageResting';
import { KkGroupStageStanding } from './internal/ui/KkGroupStageStanding';

export const KkGroupStage = Object.assign(KkGroupStageRoot, {
  Standing: KkGroupStageStanding,
  Meta: KkGroupStageMeta,
  Resting: KkGroupStageResting,
});
