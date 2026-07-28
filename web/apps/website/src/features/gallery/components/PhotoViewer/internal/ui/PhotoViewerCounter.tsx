import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { photoViewerLabels } from '@/features/gallery/gallery-content';

interface PhotoViewerCounterProps {
  position: number;
  photoCount: number;
}

export const PhotoViewerCounter: FC<PhotoViewerCounterProps> = ({ position, photoCount }) => (
  <Typography
    variant="h3"
    component="p"
    aria-live="polite"
    data-kk-photo-viewer-counter
    sx={{
      flexShrink: 0,
      fontSize: { xs: '1.0625rem', desktop: '1.375rem' },
      letterSpacing: '0.04em',
      lineHeight: 1,
    }}
  >
    {position}
    <Box component="span" sx={{ color: 'text.secondary' }}>
      {` ${photoViewerLabels.counterJoin} ${photoCount}`}
    </Box>
  </Typography>
);
