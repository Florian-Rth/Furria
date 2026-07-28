import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { PhotoOrientation } from '@/features/gallery/gallery-content';
import { resolvePhotoTileShape } from '@/features/gallery/photo-grid-spans';

interface PhotoGridCellProps extends PropsWithChildren {
  orientation: PhotoOrientation;
}

export const PhotoGridCell: FC<PhotoGridCellProps> = ({ orientation, children }) => {
  const shape = resolvePhotoTileShape(orientation);

  return (
    <Grid
      data-kk-photo-grid-cell
      size={shape.span}
      sx={{ display: 'flex', aspectRatio: shape.aspectRatio, minWidth: 0 }}
    >
      {children}
    </Grid>
  );
};
