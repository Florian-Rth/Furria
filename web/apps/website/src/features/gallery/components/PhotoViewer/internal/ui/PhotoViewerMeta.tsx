import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildAlbumMeta } from '@/features/gallery/gallery-content';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';

interface PhotoViewerMetaProps {
  album: AlbumDetail;
}

export const PhotoViewerMeta: FC<PhotoViewerMetaProps> = ({ album }) => {
  const metaLabel = buildAlbumMeta(album);

  return (
    <Typography
      variant="caption"
      data-kk-photo-viewer-meta
      sx={{ fontWeight: 600, color: 'text.secondary', textWrap: 'pretty' }}
    >
      {metaLabel}
    </Typography>
  );
};
