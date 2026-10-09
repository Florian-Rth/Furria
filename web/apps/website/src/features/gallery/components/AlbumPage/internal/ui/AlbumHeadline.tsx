import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';

interface AlbumHeadlineProps {
  album: AlbumDetail;
}

export const AlbumHeadline: FC<AlbumHeadlineProps> = ({ album }) => (
  <Typography variant="display" component="h1" sx={{ lineHeight: 0.96, overflowWrap: 'anywhere' }}>
    {album.title}
  </Typography>
);
