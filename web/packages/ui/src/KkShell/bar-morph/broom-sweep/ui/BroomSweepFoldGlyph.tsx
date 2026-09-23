import Box from '@mui/material/Box';
import type { FC } from 'react';
import { CROSSED_HEIGHT, CROSSED_VIEWBOX, CROSSED_WIDTH } from '../logic/broom-geometry';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';
import { BroomSweepFoldBroom } from './BroomSweepFoldBroom';

export type BroomSweepFoldInk = 'brand' | 'ink';

const INKS: Record<BroomSweepFoldInk, { color: string; opacity: string }> = {
  brand: { color: 'primary.main', opacity: varOf(SWEEP_VAR.foldBrandOpacity, '0') },
  ink: { color: 'text.primary', opacity: varOf(SWEEP_VAR.foldInkOpacity, '0') },
};

interface BroomSweepFoldGlyphProps {
  ink: BroomSweepFoldInk;
}

export const BroomSweepFoldGlyph: FC<BroomSweepFoldGlyphProps> = ({ ink }) => {
  const { color, opacity } = INKS[ink];

  return (
    <Box
      component="svg"
      viewBox={CROSSED_VIEWBOX}
      width={CROSSED_WIDTH}
      height={CROSSED_HEIGHT}
      aria-hidden
      sx={{
        gridArea: '1 / 1',
        display: 'block',
        overflow: 'visible',
        fill: 'currentColor',
        color,
        opacity,
        transform: varOf(SWEEP_VAR.foldPop, 'none'),
      }}
    >
      <BroomSweepFoldBroom pose={SWEEP_VAR.foldLeft} />
      <BroomSweepFoldBroom pose={SWEEP_VAR.foldRight} />
    </Box>
  );
};
