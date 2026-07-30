import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const JoinClosingWatermark: FC = () => (
  <Box
    data-kk-join-closing-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      right: { xs: -72, md: '6%' },
      transform: 'translateY(-50%) rotate(-12deg)',
      color: 'primary.contrastText',
      opacity: 0.1,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={340} />
  </Box>
);
