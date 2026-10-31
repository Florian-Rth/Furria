import { KkLaneDeskArea } from './internal/layout/KkLaneDeskArea';
import { KkLaneDeskRoot } from './internal/layout/KkLaneDeskRoot';
import { KkLaneDeskPanel } from './internal/ui/KkLaneDeskPanel';

export type { KkLaneDeskAreaName } from './internal/layout/KkLaneDeskArea';

export const KkLaneDesk = Object.assign(KkLaneDeskRoot, {
  Area: KkLaneDeskArea,
  Panel: KkLaneDeskPanel,
});
