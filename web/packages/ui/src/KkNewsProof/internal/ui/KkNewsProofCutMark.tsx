import Box from '@mui/material/Box';
import type { FC } from 'react';

export const KkNewsProofCutMark: FC = () => (
  <Box
    aria-hidden
    data-kk-news-proof-cut
    sx={{
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -3,
      borderTop: '1.5px dashed',
      borderColor: 'primary.main',
      pointerEvents: 'none',
    }}
  />
);
