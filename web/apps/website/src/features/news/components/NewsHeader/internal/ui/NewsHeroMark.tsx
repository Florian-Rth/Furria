import NewspaperIcon from '@mui/icons-material/Newspaper';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const NewsHeroMark: FC = () => (
  <Box
    data-kk-news-hero-mark
    aria-hidden
    sx={{
      position: 'absolute',
      top: '50%',
      right: { xs: '-24%', md: '-10%' },
      transform: {
        xs: 'translateY(-50%) rotate(-8deg)',
        md: 'translateY(calc(-50% + 4.5rem)) rotate(-8deg)',
      },
      color: 'text.primary',
      opacity: 0.07,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 0,
    }}
  >
    <NewspaperIcon sx={{ display: 'block', fontSize: { xs: 260, md: 480 } }} />
  </Box>
);
