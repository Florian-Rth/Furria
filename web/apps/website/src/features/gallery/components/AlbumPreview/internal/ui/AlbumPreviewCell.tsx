import { KkPhoto } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';
import { albumPreviewOrientation } from '@/features/gallery/gallery-content';

interface AlbumPreviewCellProps {
  entry: AlbumPhotoEntry;
}

export const AlbumPreviewCell: FC<AlbumPreviewCellProps> = ({ entry }) => (
  <Grid size={{ xs: 6, md: 3 }}>
    <KkPhoto
      alt={entry.photo.alt}
      orientation={albumPreviewOrientation}
      placeholderLabel={entry.placeholderLabel}
      source={entry.photo.source}
    />
  </Grid>
);
