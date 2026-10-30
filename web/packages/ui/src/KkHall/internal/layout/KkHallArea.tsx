import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkHallAreaName = 'count' | 'step' | 'stage' | 'absent' | 'keys';

export type KkHallAreaFill = 'fill' | 'centre' | 'start';

const placements: Record<KkHallAreaFill, string> = {
  fill: 'stretch',
  centre: 'center',
  start: 'start',
};

const SIZED_AREAS: readonly KkHallAreaName[] = ['count', 'stage'];

interface KkHallAreaProps extends PropsWithChildren {
  area: KkHallAreaName;
  fill?: KkHallAreaFill;
}

export const KkHallArea: FC<KkHallAreaProps> = ({ area, fill = 'fill', children }) => (
  <Box
    data-kk-hall-area={area}
    sx={{
      gridArea: area,
      position: 'relative',
      display: 'grid',
      placeItems: placements[fill],
      minWidth: 0,
      minHeight: 0,
      containerType: SIZED_AREAS.includes(area) ? 'size' : 'normal',
      '& > *': { minWidth: 0, minHeight: 0 },
    }}
  >
    {children}
  </Box>
);
