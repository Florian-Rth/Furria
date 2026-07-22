import { KkConfettiRain } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '@/components/Masthead/masthead-height';

export const LandingHeroBackdrop: FC = () => (
  <Box
    data-kk-hero-backdrop
    aria-hidden
    sx={{
      position: 'absolute',
      top: `calc(-1 * var(${MASTHEAD_HEIGHT_CSS_VAR}, 0px))`,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: -1,
    }}
  >
    <KkConfettiRain />
  </Box>
);
