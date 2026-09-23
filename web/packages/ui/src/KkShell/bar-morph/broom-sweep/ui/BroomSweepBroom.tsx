import Box from '@mui/material/Box';
import type { FC } from 'react';
import { SINGLE_HEIGHT, SINGLE_VIEWBOX, SINGLE_WIDTH } from '../logic/broom-geometry';
import { BroomSweepBristles } from './BroomSweepBristles';
import { BroomSweepHandle } from './BroomSweepHandle';

export const BroomSweepBroom: FC = () => (
  <Box
    component="svg"
    viewBox={SINGLE_VIEWBOX}
    width={SINGLE_WIDTH}
    height={SINGLE_HEIGHT}
    aria-hidden
    sx={{ display: 'block', overflow: 'visible', fill: 'currentColor' }}
  >
    <BroomSweepHandle />
    <BroomSweepBristles />
  </Box>
);
