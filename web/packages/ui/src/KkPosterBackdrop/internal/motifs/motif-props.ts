import type { PosterPlate } from '../logic/poster-composition';

export interface MotifScreen {
  light: string;
  mid: string;
  deep: string;
}

export interface MotifProps {
  plate: PosterPlate;
  screen: MotifScreen;
}

export const INK_LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 3,
  strokeLinejoin: 'round',
  strokeLinecap: 'round',
} as const;

export const FINE_LINE = { ...INK_LINE, strokeWidth: 2 } as const;
