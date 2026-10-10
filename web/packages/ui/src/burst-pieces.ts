import type { KkConfettiColor } from './confetti-pieces';
import { KK_CONFETTI_COLORS, pseudoRandom } from './confetti-pieces';

export interface BurstPiece {
  id: number;
  offsetX: number;
  offsetY: number;
  size: number;
  isRound: boolean;
  isSlim: boolean;
  color: KkConfettiColor;
  durationSeconds: number;
  spinDegrees: number;
  flipXDegrees: number;
  flipYDegrees: number;
}

const resolveTurnDirection = (value: number): number => (value > 0.5 ? 1 : -1);

const resolveSpinDegrees = (direction: number, extra: number): number =>
  resolveTurnDirection(direction) * (180 + extra * 360);

const resolveFlipDegrees = (direction: number, extra: number): number =>
  resolveTurnDirection(direction) * (60 + extra * 120);

export const buildBurstPieces = (
  count: number,
  seed: number,
  colors: readonly KkConfettiColor[] = KK_CONFETTI_COLORS,
): BurstPiece[] =>
  Array.from({ length: count }, (_, index) => {
    const rng = (offset: number): number => pseudoRandom(seed, index * 11 + offset);
    const angle = rng(0) * Math.PI * 2;
    const distance = 26 + rng(1) * 46;

    return {
      id: index,
      offsetX: Math.cos(angle) * distance,
      offsetY: Math.sin(angle) * distance - 10,
      size: 6 + rng(2) * 6,
      isRound: index % 3 === 0,
      isSlim: index % 2 === 1,
      color: colors[index % colors.length] ?? 'red',
      durationSeconds: 0.6 + rng(3) * 0.3,
      spinDegrees: resolveSpinDegrees(rng(4), rng(5)),
      flipXDegrees: resolveFlipDegrees(rng(6), rng(7)),
      flipYDegrees: resolveFlipDegrees(rng(8), rng(9)),
    };
  });
