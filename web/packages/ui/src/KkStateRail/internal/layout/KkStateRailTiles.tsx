import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import {
  RAIL_RISE_SECONDS,
  RAIL_STAGGERED_TILES,
  RAIL_START_SECONDS,
  RAIL_STEP_SECONDS,
  RAIL_WIDE,
  railRise,
} from '../state-rail-paint';

const staggered: CSSObject = Object.fromEntries(
  Array.from({ length: RAIL_STAGGERED_TILES }, (_, index) => [
    `& > :nth-of-type(${index + 1})`,
    { animationDelay: `${RAIL_START_SECONDS + (index + 1) * RAIL_STEP_SECONDS}s` },
  ]),
);

export const KkStateRailTiles: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-state-tiles
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: `${kkTokens.line.hair}px`,
      minWidth: 0,
      backgroundColor: 'divider',
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
      '& > *': { animation: `${railRise} ${RAIL_RISE_SECONDS}s ease-out both` },
      '& > :last-child:nth-of-type(odd)': { gridColumn: '1 / -1' },
      ...staggered,
      [RAIL_WIDE]: {
        gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
        '& > :last-child:nth-of-type(odd)': { gridColumn: 'auto' },
      },
    }}
  >
    {children}
  </Box>
);
