import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const HeroWatermark: FC = () => (
  <Box
    data-kk-hero-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      left: '42%',
      transform: 'translate(-50%, -50%) rotate(-8deg)',
      color: 'text.primary',
      opacity: 0.05,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={480} />
  </Box>
);
