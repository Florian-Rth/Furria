import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPromoStageFoot: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-promo-foot sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 7 }}>
    {children}
  </Box>
);
