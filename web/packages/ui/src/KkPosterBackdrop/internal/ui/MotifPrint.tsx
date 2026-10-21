import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import type { PosterMotif as PosterMotifKind, PosterPlate } from '../logic/poster-composition';
import { useMotifScreen } from '../logic/use-motif-screen';
import { PosterMotif } from '../motifs/PosterMotif';
import { MotifScreens } from './MotifScreens';

interface MotifPrintProps {
  motif: PosterMotifKind;
  plate: PosterPlate;
  pitch: number;
  density: number;
  sx: KkSx;
}

export const MotifPrint: FC<MotifPrintProps> = ({ motif, plate, pitch, density, sx }) => {
  const view = useMotifScreen(motif, plate);

  return (
    <Box component="svg" viewBox={view.viewBox} aria-hidden focusable="false" sx={sx}>
      <MotifScreens id={view.id} pitch={pitch} angle={view.angle} density={density} />
      <PosterMotif motif={motif} plate={plate} screen={view.screen} />
    </Box>
  );
};
