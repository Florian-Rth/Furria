import { PhotoGridCell } from './internal/layout/PhotoGridCell';
import { PhotoGridRoot } from './internal/layout/PhotoGridRoot';
import { PhotoTile } from './internal/ui/PhotoTile';

export const PhotoGrid = Object.assign(PhotoGridRoot, {
  Cell: PhotoGridCell,
  Tile: PhotoTile,
});
