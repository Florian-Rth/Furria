import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';

interface AlbumHeadlineProps {
  album: Album;
}

export const AlbumHeadline: FC<AlbumHeadlineProps> = ({ album }) => (
  <Typography
    variant="h1"
    component="h1"
    sx={{ fontSize: { xs: '2.25rem', md: '3.875rem' }, lineHeight: 0.96, overflowWrap: 'anywhere' }}
  >
    {album.title}
  </Typography>
);
