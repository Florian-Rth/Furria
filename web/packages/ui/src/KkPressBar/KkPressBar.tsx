import { KkPressBarActions } from './internal/layout/KkPressBarActions';
import { KkPressBarRoot } from './internal/layout/KkPressBarRoot';
import { KkPressBarMore } from './internal/ui/KkPressBarMore';
import { KkPressBarReadiness } from './internal/ui/KkPressBarReadiness';
import { KkPressBarStatus } from './internal/ui/KkPressBarStatus';
import { KkPressBarToggle } from './internal/ui/KkPressBarToggle';

export type { KkPressMoreItem } from './internal/ui/KkPressBarMore';
export type { KkReadinessSlot } from './internal/ui/KkPressBarReadiness';
export type { KkPressLineTone } from './internal/ui/KkPressBarStatus';
export type { KkPressToggleOption } from './internal/ui/KkPressBarToggle';

export const KkPressBar = Object.assign(KkPressBarRoot, {
  Status: KkPressBarStatus,
  Readiness: KkPressBarReadiness,
  Toggle: KkPressBarToggle,
  More: KkPressBarMore,
  Actions: KkPressBarActions,
});
