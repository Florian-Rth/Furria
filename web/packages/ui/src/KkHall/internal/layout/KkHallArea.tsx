import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { HALL_WIDE } from '../hall-query';

export type KkHallAreaName =
  | 'count'
  | 'band'
  | 'step'
  | 'stage'
  | 'absent'
  | 'keys'
  | 'left'
  | 'right';

export type KkHallAreaFill = 'fill' | 'centre' | 'start';

const placements: Record<KkHallAreaFill, string> = {
  fill: 'stretch',
  centre: 'center',
  start: 'start',
};

const SIZED_AREAS: readonly KkHallAreaName[] = ['count', 'band', 'stage', 'left', 'right'];

interface KkHallAreaProps extends PropsWithChildren {
  area: KkHallAreaName;
  fill?: KkHallAreaFill;
  clearCorner?: boolean;
}

export const KkHallArea: FC<KkHallAreaProps> = ({
  area,
  fill = 'fill',
  clearCorner = false,
  children,
}) => (
  <Box
    data-kk-hall-area={area}
    sx={{
      gridArea: area,
      position: 'relative',
      display: 'grid',
      placeItems: placements[fill],
      minWidth: 0,
      minHeight: 0,
      [HALL_WIDE]: { pt: clearCorner ? `calc(${kkTokens.tapTarget} + 0.75rem)` : 0 },
      containerType: SIZED_AREAS.includes(area) ? 'size' : 'normal',
      '& > *': { minWidth: 0, minHeight: 0 },
    }}
  >
    {children}
  </Box>
);
