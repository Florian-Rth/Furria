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
      typography: { xs: 'h3', desktop: 'h2' },
      lineHeight: 1.05,
      overflowWrap: 'anywhere',
    }}
  >
    {album.title}
  </Typography>
);
