export interface ConfettiPiece {
  id: number;
  leftPercent: number;
  size: number;
  isRound: boolean;
  isSlim: boolean;
  color: 'red' | 'gold' | 'ink';
  durationSeconds: number;
  delaySeconds: number;
  swayVw: number;
  swayDurationSeconds: number;
  swayDelaySeconds: number;
  spinDegrees: number;
  flipXDegrees: number;
  flipYDegrees: number;
}

const COLORS: ConfettiPiece['color'][] = ['red', 'gold', 'ink'];

export const pseudoRandom = (seed: number, k: number): number => {
  const value = Math.sin(seed * 53.3 + k * 12.9) * 10_000;
  return value - Math.floor(value);
};

export const buildConfettiPieces = (count: number, seed: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, index) => {
    const rng = (offset: number): number => pseudoRandom(seed, index * 13 + offset);
    const durationSeconds = 6 + rng(1) * 6;
    const swayDurationSeconds = 1.5 + rng(11) * 1.5;
    const color = COLORS[index % COLORS.length] ?? 'red';

    return {
      id: index,
      leftPercent: ((index + rng(0)) / count) * 100,
      size: 8 + rng(2) * 8,
      isRound: index % 3 === 0,
      isSlim: index % 2 === 1,
      color,
      durationSeconds,
      delaySeconds: -(rng(3) * durationSeconds),
      swayVw: (rng(4) - 0.5) * 4,
      swayDurationSeconds,
      swayDelaySeconds: -(rng(12) * swayDurationSeconds),
      spinDegrees: (rng(5) > 0.5 ? 1 : -1) * (360 + rng(6) * 720),
      flipXDegrees: (rng(7) > 0.5 ? 1 : -1) * (360 + rng(8) * 720),
      flipYDegrees: (rng(9) > 0.5 ? 1 : -1) * (360 + rng(10) * 720),
    };
  });
