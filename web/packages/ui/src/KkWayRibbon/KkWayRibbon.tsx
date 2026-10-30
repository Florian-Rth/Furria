import { KkWayRibbonGroup } from './internal/layout/KkWayRibbonGroup';
import { KkWayRibbonRoot } from './internal/layout/KkWayRibbonRoot';
import { KkWayRibbonEights } from './internal/ui/KkWayRibbonEights';
import { KkWayRibbonEmpty } from './internal/ui/KkWayRibbonEmpty';
import { KkWayRibbonPart } from './internal/ui/KkWayRibbonPart';
import { KkWayRibbonTile } from './internal/ui/KkWayRibbonTile';

export const KkWayRibbon = Object.assign(KkWayRibbonRoot, {
  Group: KkWayRibbonGroup,
  Part: KkWayRibbonPart,
  Tile: KkWayRibbonTile,
  Eights: KkWayRibbonEights,
  Empty: KkWayRibbonEmpty,
});
