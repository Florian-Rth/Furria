import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';

interface PhotoViewerAlbumTitleProps {
  album: Album;
  titleId: string;
}

export const PhotoViewerAlbumTitle: FC<PhotoViewerAlbumTitleProps> = ({ album, titleId }) => (
  <Typography
    id={titleId}
    variant="h3"
    component="h2"
    sx={{
      minWidth: 0,
      fontSize: { xs: '1.125rem', desktop: '1.625rem' },
      lineHeight: 1.05,
      overflowWrap: 'anywhere',
    }}
  >
    {album.title}
  </Typography>
);
