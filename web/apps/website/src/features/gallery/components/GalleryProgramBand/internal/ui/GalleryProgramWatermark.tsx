import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const GalleryProgramWatermark: FC = () => (
  <Box
    data-kk-gallery-program-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      right: { xs: -64, md: '7%' },
      transform: 'translateY(-50%) rotate(14deg)',
      color: 'primary.contrastText',
      opacity: 0.1,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={320} />
  </Box>
);
