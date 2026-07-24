import { KkBroomMark } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const RecruitWatermark: FC = () => (
  <Box
    data-kk-recruit-watermark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-8deg)',
      color: 'primary.contrastText',
      opacity: 0.08,
      pointerEvents: 'none',
      zIndex: 0,
    }}
  >
    <KkBroomMark size={360} />
  </Box>
);
