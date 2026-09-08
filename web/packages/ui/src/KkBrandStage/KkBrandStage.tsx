import { KkBrandStageMeta } from './internal/layout/KkBrandStageMeta';
import { KkBrandStageRoot } from './internal/layout/KkBrandStageRoot';
import { KkBrandStageStatus } from './internal/ui/KkBrandStageStatus';

export const KkBrandStage = Object.assign(KkBrandStageRoot, {
  Meta: KkBrandStageMeta,
  Status: KkBrandStageStatus,
});
