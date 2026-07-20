export interface ConfettiPiece {
  id: number;
  leftPercent: number;
  size: number;
  isRound: boolean;
  isSlim: boolean;
  color: 'red' | 'gold' | 'ink';
  durationSeconds: number;
  delaySeconds: number;
  driftVw: number;
  spinDegrees: number;
}

const COLORS: ConfettiPiece['color'][] = ['red', 'gold', 'ink'];

const pseudoRandom = (seed: number, k: number): number => {
  const value = Math.sin(seed * 53.3 + k * 12.9) * 10_000;
  return value - Math.floor(value);
};

export const buildConfettiPieces = (count: number, seed: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, index) => {
    const rng = (offset: number): number => pseudoRandom(seed, index * 7 + offset);
    const durationSeconds = 8 + rng(1) * 8;
    const color = COLORS[index % COLORS.length] ?? 'red';

    return {
      id: index,
      leftPercent: rng(0) * 100,
      size: 8 + rng(2) * 8,
      isRound: index % 3 === 0,
      isSlim: index % 2 === 1,
      color,
      durationSeconds,
      delaySeconds: -(rng(3) * durationSeconds),
      driftVw: (rng(4) - 0.5) * 12,
      spinDegrees: (rng(5) > 0.5 ? 1 : -1) * (360 + rng(6) * 720),
    };
  });
