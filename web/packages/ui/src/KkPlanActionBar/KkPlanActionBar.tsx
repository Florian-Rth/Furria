import { KkPlanActionBarRoot } from './internal/layout/KkPlanActionBarRoot';
import { KkPlanActionBarButton } from './internal/ui/KkPlanActionBarButton';
import { KkPlanActionBarDivider } from './internal/ui/KkPlanActionBarDivider';
import { KkPlanActionBarReadout } from './internal/ui/KkPlanActionBarReadout';

export type { KkPlanActionTone } from './internal/ui/KkPlanActionBarButton';

export const KkPlanActionBar = Object.assign(KkPlanActionBarRoot, {
  Button: KkPlanActionBarButton,
  Readout: KkPlanActionBarReadout,
  Divider: KkPlanActionBarDivider,
});
