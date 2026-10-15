import { KkStateRailRoot } from './internal/layout/KkStateRailRoot';
import { KkStateRailTiles } from './internal/layout/KkStateRailTiles';
import { KkStateRailLead } from './internal/ui/KkStateRailLead';
import { KkStateRailTile } from './internal/ui/KkStateRailTile';

export const KkStateRail = Object.assign(KkStateRailRoot, {
  Lead: KkStateRailLead,
  Tiles: KkStateRailTiles,
  Tile: KkStateRailTile,
});
