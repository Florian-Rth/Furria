import { useId } from 'react';
import type { MotifScreen } from '../motifs/motif-props';
import { PLATE_ANGLE } from '../plate-paint';
import type { PosterMotif, PosterPlate } from './poster-composition';
import { MOTIF_HEIGHT, MOTIF_WIDTH } from './poster-composition';

const UNSAFE_ID_CHARACTERS = /[^a-zA-Z0-9-]/g;

export interface MotifScreenView {
  id: string;
  angle: number;
  screen: MotifScreen;
  viewBox: string;
}

export const useMotifScreen = (motif: PosterMotif, plate: PosterPlate): MotifScreenView => {
  const id = `kk-poster${useId().replace(UNSAFE_ID_CHARACTERS, '')}`;

  return {
    id,
    angle: PLATE_ANGLE[plate],
    screen: { light: `url(#${id}-light)`, mid: `url(#${id}-mid)`, deep: `url(#${id}-deep)` },
    viewBox: `0 0 ${MOTIF_WIDTH[motif]} ${MOTIF_HEIGHT[motif]}`,
  };
};
