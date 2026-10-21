import Box from '@mui/material/Box';
import type { FC } from 'react';
import { useRef } from 'react';
import { footPaint, footPlacementPaintOf } from '../foot-paint';
import type { KkPosterPhase } from '../logic/poster-composition';
import { footPitchOf, footPlacementsOf, posterPlatesOf } from '../logic/poster-foot';
import { useSeen } from '../logic/use-seen';
import { plateLandOf, platePaintOf } from '../plate-paint';
import { MotifPrint } from './MotifPrint';

interface KkPosterBackdropFootProps {
  phase: KkPosterPhase;
  runUp: number;
  evening: boolean;
}

export const KkPosterBackdropFoot: FC<KkPosterBackdropFootProps> = ({ phase, runUp, evening }) => {
  const ref = useRef<HTMLDivElement>(null);
  const landing = useSeen(ref) ? 'landing' : 'held';
  const placements = footPlacementsOf(phase, runUp);
  const plates = posterPlatesOf(phase, evening).map((inking) => {
    const printed = placements.map((placement) => (
      <MotifPrint
        key={placement.key}
        motif={placement.motif}
        plate={inking.plate}
        pitch={footPitchOf(placement)}
        density={placement.density}
        sx={footPlacementPaintOf(placement)}
      />
    ));

    return (
      <Box key={inking.plate} sx={platePaintOf(inking)}>
        <Box sx={plateLandOf(inking.plate, landing)}>{printed}</Box>
      </Box>
    );
  });

  return (
    <Box ref={ref} aria-hidden sx={footPaint}>
      {plates}
    </Box>
  );
};
