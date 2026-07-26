import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const NewsPageWatermark: FC = () => (
  <Box
    data-kk-news-watermark
    aria-hidden
    sx={{
      display: { xs: 'none', md: 'block' },
      position: 'absolute',
      top: '50%',
      right: '6%',
      transform: 'translateY(-50%) rotate(-8deg)',
      color: 'text.primary',
      opacity: 0.06,
      pointerEvents: 'none',
    }}
  >
    <KkBroomMark size={220} />
  </Box>
);
