import { KkLaneBarGroup } from './internal/layout/KkLaneBarGroup';
import { KkLaneBarRoot } from './internal/layout/KkLaneBarRoot';
import { KkLaneBarReadout } from './internal/ui/KkLaneBarReadout';
import { KkLaneBarTitle } from './internal/ui/KkLaneBarTitle';

export const KkLaneBar = Object.assign(KkLaneBarRoot, {
  Group: KkLaneBarGroup,
  Title: KkLaneBarTitle,
  Readout: KkLaneBarReadout,
});
