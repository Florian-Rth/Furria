import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { clubHeroRibbon } from '@/features/club/hero-content';

export const ClubHeroRibbon: FC = () => (
  <Box
    data-kk-club-ribbon
    sx={(theme) => ({
      display: { xs: 'none', md: 'block' },
      position: 'absolute',
      top: theme.spacing(4),
      left: theme.spacing(-1),
      zIndex: 2,
      transform: 'rotate(-6deg)',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: 2,
      py: 0.75,
      boxShadow: `${kkTokens.shadow.posterOffset} ${(theme.vars ?? theme).palette.text.primary}`,
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ fontWeight: 900, letterSpacing: '0.14em' }}
    >
      {clubHeroRibbon}
    </Typography>
  </Box>
);
