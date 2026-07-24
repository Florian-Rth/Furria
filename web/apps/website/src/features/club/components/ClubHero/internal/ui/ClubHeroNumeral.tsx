import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { clubHeroNumeral } from '@/features/club/hero-content';

export const ClubHeroNumeral: FC = () => (
  <Box
    data-kk-club-numeral
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      top: { xs: theme.spacing(-4), md: theme.spacing(-6) },
      right: { xs: theme.spacing(-3), md: 0 },
      fontFamily: kkTokens.font.display,
      fontSize: { xs: '15rem', md: '24rem' },
      lineHeight: 0.74,
      color: 'transparent',
      WebkitTextStroke: `2px ${(theme.vars ?? theme).palette.primary.main}`,
      opacity: { xs: 0.08, md: 0.12 },
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 0,
    })}
  >
    {clubHeroNumeral}
  </Box>
);
