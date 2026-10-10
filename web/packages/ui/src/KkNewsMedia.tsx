import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import { KkNewsPoster } from './KkNewsPoster';
import type { KkNewsTone } from './KkNewsProof/news-proof-types';
import type { KkSx } from './kk-sx';

interface KkNewsMediaProps {
  photo: ReactNode;
  tone: KkNewsTone | null;
  posterWord: string;
  sx?: KkSx;
}

export const KkNewsMedia: FC<KkNewsMediaProps> = ({ photo, tone, posterWord, sx }) => {
  const face = photo ?? <KkNewsPoster tone={tone} word={posterWord} />;

  return (
    <Box data-kk-news-media sx={[{ width: '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {face}
    </Box>
  );
};
