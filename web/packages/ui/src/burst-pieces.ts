import { pseudoRandom } from './confetti-pieces';

export interface BurstPiece {
  id: number;
  offsetX: number;
  offsetY: number;
  size: number;
  isRound: boolean;
  isSlim: boolean;
  color: 'red' | 'gold' | 'ink';
  durationSeconds: number;
  spinDegrees: number;
}

const COLORS: BurstPiece['color'][] = ['red', 'gold', 'ink'];

export const buildBurstPieces = (count: number, seed: number): BurstPiece[] =>
  Array.from({ length: count }, (_, index) => {
    const rng = (offset: number): number => pseudoRandom(seed, index * 7 + offset);
    const angle = rng(0) * Math.PI * 2;
    const distance = 26 + rng(1) * 46;

    return {
      id: index,
      offsetX: Math.cos(angle) * distance,
      offsetY: Math.sin(angle) * distance - 10,
      size: 6 + rng(2) * 6,
      isRound: index % 3 === 0,
      isSlim: index % 2 === 1,
      color: COLORS[index % COLORS.length] ?? 'red',
      durationSeconds: 0.6 + rng(3) * 0.3,
      spinDegrees: (rng(4) > 0.5 ? 1 : -1) * (180 + rng(5) * 360),
    };
  });
