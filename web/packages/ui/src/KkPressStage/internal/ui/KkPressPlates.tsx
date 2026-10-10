import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPressPhase } from '../../press-beats';
import { PLATES, plateTargetOf, STILL, WOBBLE } from '../logic/press-motion';
import { KkPressPlate } from './KkPressPlate';

interface KkPressPlatesProps {
  phase: KkPressPhase;
  failed: boolean;
  runKey: number;
}

export const KkPressPlates: FC<KkPressPlatesProps> = ({ phase, failed, runKey }) => {
  const shown = failed || phase === 'register' || phase === 'strike';

  if (!shown) {
    return null;
  }

  const wobble = phase === 'register' && !failed ? WOBBLE : STILL;
  const plates = PLATES.map((plate) => (
    <KkPressPlate
      key={`${runKey}-${plate.ink}`}
      plate={plate}
      target={plateTargetOf(plate, phase, failed)}
      wobble={wobble}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-press-plates
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {plates}
    </Box>
  );
};
