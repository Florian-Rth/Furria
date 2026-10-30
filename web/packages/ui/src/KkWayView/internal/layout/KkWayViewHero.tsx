import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { WAY_WIDE } from '../logic/way-view-query';

interface KkWayViewHeroProps extends PropsWithChildren {
  alone: boolean;
}

export const KkWayViewHero: FC<KkWayViewHeroProps> = ({ alone, children }) => (
  <Box
    data-kk-way-hero
    sx={{
      gridArea: 'hero',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      containerName: 'kk-way-hero',
      display: 'grid',
      alignItems: alone ? 'center' : 'end',
      justifyItems: 'center',
      [WAY_WIDE]: { alignItems: 'center', justifyItems: alone ? 'center' : 'start' },
    }}
  >
    {children}
  </Box>
);
