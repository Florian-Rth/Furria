import { kkTokens } from './tokens';

const { reach, lift, pull } = kkTokens.letterRail;
const NONE = 0;
const FIRST = 0;

export interface KkLetterRailBand {
  top: number;
  bottom: number;
  count: number;
}

export interface KkLetterRailLift {
  scale: number;
  pull: number;
}

export const AT_REST: KkLetterRailLift = { scale: 1, pull: NONE };

export const railIndexAt = (y: number, band: KkLetterRailBand): number => {
  const height = band.bottom - band.top;

  if (height <= NONE || band.count <= NONE) {
    return FIRST;
  }

  const travelled = ((y - band.top) / height) * band.count;
  const index = Math.floor(travelled);

  return Math.min(Math.max(index, FIRST), band.count - 1);
};

export const railLiftAt = (index: number, held: number | null): KkLetterRailLift => {
  if (held === null) {
    return AT_REST;
  }

  const distance = Math.abs(index - held);

  if (distance > reach) {
    return AT_REST;
  }

  const falloff = (reach + 1 - distance) / (reach + 1);

  return { scale: 1 + lift * falloff, pull: -pull * falloff };
};
