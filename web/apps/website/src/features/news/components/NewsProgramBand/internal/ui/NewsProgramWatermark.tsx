import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const NewsProgramWatermark: FC = () => (
  <Box
    data-kk-news-program-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      right: { xs: -56, md: '8%' },
      transform: 'translateY(-50%) rotate(10deg)',
      color: 'primary.contrastText',
      opacity: 0.1,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={300} />
  </Box>
);
