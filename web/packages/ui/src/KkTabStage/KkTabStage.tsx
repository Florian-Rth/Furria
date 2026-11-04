import { KkTabStageFoot } from './internal/layout/KkTabStageFoot';
import { KkTabStageMiddle } from './internal/layout/KkTabStageMiddle';
import { KkTabStageRoot } from './internal/layout/KkTabStageRoot';
import { KkTabStageTop } from './internal/layout/KkTabStageTop';

export const KkTabStage = Object.assign(KkTabStageRoot, {
  Top: KkTabStageTop,
  Middle: KkTabStageMiddle,
  Foot: KkTabStageFoot,
});
