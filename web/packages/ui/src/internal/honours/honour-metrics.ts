import type { SashMode } from './honour-sash';

export type KkRingedAvatarSize = 'bar' | 'medium' | 'large' | 'header' | 'portrait';

export interface RingMetrics {
  box: number;
  metalRadius: number;
  metalStroke: number;
  pieceGap: number;
  standingRadius: number;
  standingStroke: number;
  faceRadius: number;
  standingFaceRadius: number;
  dotRadius: number;
  coinShare: number;
  coinCount: number;
  sash: SashMode;
  interactive: boolean;
}

export const ringMetrics: Record<KkRingedAvatarSize, RingMetrics> = {
  bar: {
    box: 32,
    metalRadius: 14.7,
    metalStroke: 2.6,
    pieceGap: 1.5,
    standingRadius: 12.2,
    standingStroke: 1,
    faceRadius: 12.3,
    standingFaceRadius: 10.4,
    dotRadius: 2.6,
    coinShare: 0.3,
    coinCount: 1,
    sash: 'band',
    interactive: false,
  },
  medium: {
    box: 40,
    metalRadius: 18.4,
    metalStroke: 3,
    pieceGap: 1.7,
    standingRadius: 15.2,
    standingStroke: 1.1,
    faceRadius: 15.6,
    standingFaceRadius: 13.2,
    dotRadius: 3,
    coinShare: 0.3,
    coinCount: 1,
    sash: 'band',
    interactive: false,
  },
  large: {
    box: 56,
    metalRadius: 25.9,
    metalStroke: 3.7,
    pieceGap: 1.95,
    standingRadius: 21.9,
    standingStroke: 1.2,
    faceRadius: 22.4,
    standingFaceRadius: 19.4,
    dotRadius: 3.6,
    coinShare: 0.3,
    coinCount: 1,
    sash: 'band',
    interactive: false,
  },
  header: {
    box: 72,
    metalRadius: 33.4,
    metalStroke: 4.4,
    pieceGap: 2.2,
    standingRadius: 28.6,
    standingStroke: 1.3,
    faceRadius: 29.2,
    standingFaceRadius: 25.6,
    dotRadius: 4.2,
    coinShare: 0.28,
    coinCount: 3,
    sash: 'icon',
    interactive: true,
  },
  portrait: {
    box: 96,
    metalRadius: 44.6,
    metalStroke: 5.4,
    pieceGap: 2.6,
    standingRadius: 38.6,
    standingStroke: 1.5,
    faceRadius: 39.6,
    standingFaceRadius: 35,
    dotRadius: 5.2,
    coinShare: 0.25,
    coinCount: 3,
    sash: 'text',
    interactive: true,
  },
};

export const AVATAR_COIN_START_DEGREES = 34;
export const AVATAR_COIN_STEP_DEGREES = 40;
export const STANDING_DOT_DEGREES = 135;
export const FEE_BEAD_ARC = { startDegrees: 212, endDegrees: 248 } as const;

export const faceShareOf = (radius: number, box: number): string =>
  `${Number(((radius * 2 * 100) / box).toFixed(3))}%`;
