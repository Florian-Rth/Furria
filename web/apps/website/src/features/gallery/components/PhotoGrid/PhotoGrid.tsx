import { PhotoGridCell } from './internal/layout/PhotoGridCell';
import { PhotoGridRoot } from './internal/layout/PhotoGridRoot';
import { PhotoTile } from './internal/ui/PhotoTile';
import { PhotoTileAction } from './internal/ui/PhotoTileAction';

export const PhotoGrid = Object.assign(PhotoGridRoot, {
  Cell: PhotoGridCell,
  Action: PhotoTileAction,
  Tile: PhotoTile,
});
