import type { PhotoOrientation } from './gallery-content';

export interface PhotoTileSpan {
  xs: number;
  sm: number;
  md: number;
}

export interface PhotoTileShape {
  span: PhotoTileSpan;
  aspectRatio: string;
}

export const PHOTO_GRID_COLUMNS = 12;

const PHOTO_TILE_UNITS: Record<PhotoOrientation, number> = {
  portrait: 1,
  landscape: 2,
};

const UNITS_PER_ROW: PhotoTileSpan = {
  xs: 2,
  sm: 3,
  md: 4,
};

const TILE_UNIT_ASPECT_WIDTH = 4;
const TILE_ASPECT_HEIGHT = 5;

const spanOf = (units: number, unitsPerRow: number): number =>
  Math.min(PHOTO_GRID_COLUMNS, (units * PHOTO_GRID_COLUMNS) / unitsPerRow);

export const resolvePhotoTileShape = (orientation: PhotoOrientation): PhotoTileShape => {
  const units = PHOTO_TILE_UNITS[orientation];

  return {
    span: {
      xs: spanOf(units, UNITS_PER_ROW.xs),
      sm: spanOf(units, UNITS_PER_ROW.sm),
      md: spanOf(units, UNITS_PER_ROW.md),
    },
    aspectRatio: `${units * TILE_UNIT_ASPECT_WIDTH} / ${TILE_ASPECT_HEIGHT}`,
  };
};
