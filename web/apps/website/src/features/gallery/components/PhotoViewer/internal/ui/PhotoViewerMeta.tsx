import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildPhotoViewerMetaLabel } from '@/features/gallery/gallery-content';

interface PhotoViewerMetaProps {
  album: Album;
}

export const PhotoViewerMeta: FC<PhotoViewerMetaProps> = ({ album }) => (
  <Typography
    variant="caption"
    data-kk-photo-viewer-meta
    sx={{ fontWeight: 600, color: 'text.secondary', textWrap: 'pretty' }}
  >
    {buildPhotoViewerMetaLabel(album)}
  </Typography>
);
