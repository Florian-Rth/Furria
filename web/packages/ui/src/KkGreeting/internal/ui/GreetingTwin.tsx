import Box from '@mui/material/Box';
import type { MotionValue } from 'motion/react';
import type { FC } from 'react';
import type { TwinBoard } from '../logic/greeting-twin';
import { GreetingTwinCell } from './GreetingTwinCell';

const TWIN_LAYER = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 'var(--kk-dock-headline, 1)',
} as const;

interface GreetingTwinProps {
  twin: TwinBoard | null;
  clock: MotionValue<number>;
}

export const GreetingTwin: FC<GreetingTwinProps> = ({ twin, clock }) => {
  if (twin === null) {
    return null;
  }

  const cells = twin.cells.map((cell) => (
    <GreetingTwinCell key={cell.key} cell={cell} tone={twin.tone} clock={clock} />
  ));

  return (
    <Box aria-hidden data-kk-greeting-twin sx={TWIN_LAYER}>
      {cells}
    </Box>
  );
};
