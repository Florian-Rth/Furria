import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { FlapCell } from '../logic/flap-cells';
import type { GreetingCue } from '../logic/greeting-cues';

const MOVING = 'moving';
const RESTING = 'resting';

interface GreetingInkCellProps {
  cell: FlapCell;
  cue: GreetingCue;
}

export const GreetingInkCell: FC<GreetingInkCellProps> = ({ cell, cue }) => {
  const ink = cell.accent ? redInk : undefined;
  const target = { opacity: cue.opacity };
  const transition = { delay: cue.delay, duration: cue.duration, ease: 'easeOut' as const };
  const stance = cue.moving ? MOVING : RESTING;

  return (
    <>
      {cell.lead}
      <Box
        key={stance}
        component={motion.span}
        data-kk-flap-cell
        initial={false}
        animate={target}
        transition={transition}
        sx={ink}
      >
        {cell.face}
      </Box>
      {cell.trail}
    </>
  );
};
