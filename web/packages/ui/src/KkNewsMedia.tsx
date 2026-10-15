import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import { KkPhoto } from './KkPhoto';
import type { KkSx } from './kk-sx';

interface KkNewsMediaProps {
  photo: ReactNode;
  sx?: KkSx;
}

export const KkNewsMedia: FC<KkNewsMediaProps> = ({ photo, sx }) => {
  const face = photo ?? <KkPhoto alt="" fill />;

  return (
    <Box data-kk-news-media sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {face}
    </Box>
  );
};
