import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface PhotoViewerCounterProps {
  position: number;
  countSuffix: string;
}

export const PhotoViewerCounter: FC<PhotoViewerCounterProps> = ({ position, countSuffix }) => (
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
      {countSuffix}
    </Box>
  </Typography>
);
