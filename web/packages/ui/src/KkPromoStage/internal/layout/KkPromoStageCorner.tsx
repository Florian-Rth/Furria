import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { PROMO_FOOT_HEIGHT, PROMO_GUTTER } from '../promo-paint';

const CORNER_LIFT = 26;

export const KkPromoStageCorner: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-promo-corner
    sx={{
      position: 'absolute',
      right: PROMO_GUTTER,
      bottom: PROMO_FOOT_HEIGHT + CORNER_LIFT,
      zIndex: 5,
    }}
  >
    {children}
  </Box>
);
