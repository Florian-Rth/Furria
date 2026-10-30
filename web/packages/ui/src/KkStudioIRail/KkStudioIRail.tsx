import { KkStudioIRailGroup } from './internal/layout/KkStudioIRailGroup';
import { KkStudioIRailRoot } from './internal/layout/KkStudioIRailRoot';
import { KkStudioIRailTiles } from './internal/layout/KkStudioIRailTiles';
import { KkStudioIRailGroupHead } from './internal/ui/KkStudioIRailGroupHead';
import { KkStudioIRailLead } from './internal/ui/KkStudioIRailLead';
import { KkStudioIRailTile } from './internal/ui/KkStudioIRailTile';

export const KkStudioIRail = Object.assign(KkStudioIRailRoot, {
  Group: KkStudioIRailGroup,
  GroupHead: KkStudioIRailGroupHead,
  Tiles: KkStudioIRailTiles,
  Tile: KkStudioIRailTile,
  Lead: KkStudioIRailLead,
});
