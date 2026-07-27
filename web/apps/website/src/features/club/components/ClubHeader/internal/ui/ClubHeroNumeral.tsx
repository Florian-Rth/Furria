import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { clubHeroNumeral } from '@/features/club/header-content';

export const ClubHeroNumeral: FC = () => (
  <Box
    data-kk-club-numeral
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      top: { xs: theme.spacing(-3), md: theme.spacing(-3) },
      right: { xs: theme.spacing(-2), md: theme.spacing(-2) },
      fontFamily: kkTokens.font.display,
      fontSize: { xs: '11rem', md: '17rem' },
      lineHeight: 0.74,
      color: 'transparent',
      WebkitTextStroke: {
        xs: `3px ${(theme.vars ?? theme).palette.primary.main}`,
        md: `5px ${(theme.vars ?? theme).palette.primary.main}`,
      },
      opacity: { xs: 0.12, md: 0.18 },
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 0,
    })}
  >
    {clubHeroNumeral}
  </Box>
);
