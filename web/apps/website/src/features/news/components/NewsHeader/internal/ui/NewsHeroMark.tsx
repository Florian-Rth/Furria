import NewspaperIcon from '@mui/icons-material/Newspaper';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const NewsHeroMark: FC = () => (
  <Box
    data-kk-news-hero-mark
    aria-hidden
    sx={{
      position: 'absolute',
      right: { xs: 0, desktop: 'auto' },
      transform: 'translate(0, -25%)',
      rotate: '-8deg',
      color: 'text.primary',
      opacity: 0.07,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 0,
    }}
  >
    <NewspaperIcon
      sx={{ display: 'block', width: { xs: 260, desktop: 440 }, height: { xs: 260, desktop: 440 } }}
    />
  </Box>
);
