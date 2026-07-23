import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const MitmachenWatermark: FC = () => (
  <Box
    data-kk-mitmachen-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      right: { xs: -24, md: 32 },
      transform: 'translateY(-50%)',
      color: 'primary.contrastText',
      opacity: 0.1,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={260} />
  </Box>
);
