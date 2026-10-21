import Box from '@mui/material/Box';
import type { FC } from 'react';
import { artPlacementPaintOf } from '../art-paint';
import type { ArtPlacement } from '../logic/poster-composition';
import { screenPitchOf } from '../logic/poster-composition';
import type { PlateInking, PlateLanding } from '../plate-paint';
import { plateLandOf, platePaintOf } from '../plate-paint';
import { MotifPrint } from './MotifPrint';

const FULL_DENSITY = 1;

interface PosterPlateProps {
  inking: PlateInking;
  placements: readonly ArtPlacement[];
  landing: PlateLanding;
}

export const PosterPlate: FC<PosterPlateProps> = ({ inking, placements, landing }) => {
  const printed = placements.map((placement) => (
    <MotifPrint
      key={placement.key}
      motif={placement.motif}
      plate={inking.plate}
      pitch={screenPitchOf(placement)}
      density={FULL_DENSITY}
      sx={artPlacementPaintOf(placement)}
    />
  ));

  return (
    <Box sx={platePaintOf(inking)}>
      <Box sx={plateLandOf(inking.plate, landing)}>{printed}</Box>
    </Box>
  );
};
