import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const NarrenrufWatermark: FC = () => (
  <Box
    data-kk-narrenruf-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      left: { xs: -48, md: '6%' },
      transform: 'translateY(-50%) rotate(-12deg)',
      color: 'primary.contrastText',
      opacity: 0.12,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={320} />
  </Box>
);
