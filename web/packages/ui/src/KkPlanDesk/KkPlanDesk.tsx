import { KkPlanDeskCanvas } from './internal/layout/KkPlanDeskCanvas';
import { KkPlanDeskInspector } from './internal/layout/KkPlanDeskInspector';
import { KkPlanDeskRail } from './internal/layout/KkPlanDeskRail';
import { KkPlanDeskRoot } from './internal/layout/KkPlanDeskRoot';
import { KkPlanDeskStatus } from './internal/layout/KkPlanDeskStatus';

export const KkPlanDesk = Object.assign(KkPlanDeskRoot, {
  Status: KkPlanDeskStatus,
  Rail: KkPlanDeskRail,
  Canvas: KkPlanDeskCanvas,
  Inspector: KkPlanDeskInspector,
});
