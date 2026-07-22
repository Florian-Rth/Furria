import { pseudoRandom } from './confetti-pieces';

export interface ScatterPiece {
  id: number;
  xPercent: number;
  yPercent: number;
  size: number;
  rotation: number;
  isRound: boolean;
  isSlim: boolean;
  color: 'red' | 'gold' | 'ink';
}

const MAX_PIECES = 13;

const COLORS: ScatterPiece['color'][] = ['red', 'gold', 'ink'];

export const buildScatterPieces = (count: number, seed: number): ScatterPiece[] =>
  Array.from({ length: Math.min(count, MAX_PIECES) }, (_, index) => {
    const rng = (offset: number): number => pseudoRandom(seed, index * 7 + offset);
    const color = COLORS[index % COLORS.length] ?? 'red';

    return {
      id: index,
      xPercent: rng(0) * 100,
      yPercent: rng(1) * 100,
      size: 9 + rng(2) * 9,
      rotation: (rng(3) - 0.5) * 48,
      isRound: index % 3 === 0,
      isSlim: index % 2 === 1,
      color,
    };
  });
