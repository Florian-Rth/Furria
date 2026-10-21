import type { PlateInking } from '../plate-paint';
import type { KkPosterPhase, PosterMotif } from './poster-composition';
import { MOTIF_WIDTH, POSTER_PLATES, posterInksOf } from './poster-composition';

export interface FootPlacement {
  key: string;
  motif: PosterMotif;
  x: number;
  y: number;
  width: number;
  cap: number;
  rotate: number;
  strength: number;
  density: number;
}

type Spot = readonly [
  motif: PosterMotif,
  x: number,
  y: number,
  width: number,
  cap: number,
  rotate: number,
  strength: number,
];

const POSTER: Record<KkPosterPhase, readonly Spot[]> = {
  runUp: [
    ['eleven', 52, 50, 44, 13, -4, 1],
    ['streamer', 16, 34, 34, 12, 14, 0.8],
    ['streamer', 88, 70, 30, 11, -164, 0.7],
    ['confetti', 24, 76, 24, 8, 0, 0.8],
    ['confetti', 82, 22, 18, 6, 40, 0.7],
  ],
  opening: [
    ['eleven', 50, 50, 46, 14, -5, 1],
    ['jesterCap', 16, 62, 30, 10, -12, 1],
    ['confetti', 84, 30, 30, 10, 0, 1],
    ['confetti', 26, 18, 24, 8, 70, 1],
    ['confetti', 78, 84, 24, 8, 150, 0.9],
    ['streamer', 92, 64, 30, 11, -110, 0.9],
  ],
  hall: [
    ['councilCap', 50, 54, 52, 16, -6, 1],
    ['order', 16, 46, 18, 6, 10, 0.9],
    ['order', 86, 40, 14, 5, -12, 0.7],
    ['streamer', 82, 82, 32, 11, -8, 0.6],
  ],
  hotDays: [
    ['jesterCap', 52, 52, 40, 13, 6, 1],
    ['streamer', 14, 30, 36, 12, 18, 1],
    ['streamer', 86, 74, 36, 12, -160, 1],
    ['streamer', 70, 16, 26, 9, -24, 0.8],
    ['candy', 22, 80, 16, 5, -24, 1],
    ['candy', 84, 30, 14, 4, 32, 0.9],
    ['candy', 34, 36, 10, 3, 64, 0.8],
    ['candy', 66, 88, 12, 4, -10, 0.9],
  ],
  ashWednesday: [['herring', 50, 56, 50, 15, -6, 1]],
  offSeason: [
    ['confetti', 36, 50, 26, 8, 20, 0.6],
    ['streamer', 70, 56, 30, 10, -12, 0.5],
  ],
};

const SPARSE_DENSITY = 0.42;
const FULL_DENSITY = 1;
const SOLID_DENSITY = 1.3;
const PITCH_PX = 5.5;
const BASIS_PX = 360;
const PERCENT = 100;
const REM_PX = 16;

export const elevenDensityOf = (phase: KkPosterPhase, runUp: number): number => {
  if (phase === 'opening') {
    return SOLID_DENSITY;
  }
  if (phase !== 'runUp') {
    return FULL_DENSITY;
  }

  return SPARSE_DENSITY + (SOLID_DENSITY - SPARSE_DENSITY) * Math.min(Math.max(runUp, 0), 1);
};

export const footPlacementsOf = (phase: KkPosterPhase, runUp: number): FootPlacement[] =>
  POSTER[phase].map(([motif, x, y, width, cap, rotate, strength], index) => ({
    key: `foot-${index}-${motif}`,
    motif,
    x,
    y,
    width,
    cap,
    rotate,
    strength,
    density: motif === 'eleven' ? elevenDensityOf(phase, runUp) : FULL_DENSITY,
  }));

export const footPitchOf = (placement: FootPlacement): number => {
  const renderedPx = Math.min((BASIS_PX * placement.width) / PERCENT, placement.cap * REM_PX);

  return (MOTIF_WIDTH[placement.motif] * PITCH_PX) / renderedPx;
};

export const posterPlatesOf = (phase: KkPosterPhase, evening: boolean): PlateInking[] => {
  const inks = posterInksOf(phase, evening);

  return POSTER_PLATES.filter((plate) => inks[plate] > 0).map((plate) => ({
    plate,
    amount: inks[plate],
    ashen: phase === 'ashWednesday',
    glow: evening,
  }));
};
