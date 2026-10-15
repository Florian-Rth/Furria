export type ForgeChipPaint = 'mid' | 'highlight' | 'red' | 'gold';

export interface ForgeChip {
  key: number;
  dx: number;
  dy: number;
  rotate: number;
  delaySeconds: number;
  paint: ForgeChipPaint;
}

const MAX_CHIPS = 11;
const PAINTS: readonly ForgeChipPaint[] = ['mid', 'highlight', 'red', 'gold'];
const SKEW_DEGREES = 9;
const REACH_STEP = 0.18;
const SPIN_BASE = 200;
const SPIN_STEP = 47;
const DELAY_STEP_SECONDS = 0.018;
const DEGREES_PER_RADIAN = 180 / Math.PI;

const rounded = (value: number): number => Number(value.toFixed(2)) + 0;

export const forgeChipsOf = (count: number, reach: number): ForgeChip[] => {
  const chips = Math.min(Math.max(Math.floor(count), 0), MAX_CHIPS);

  return Array.from({ length: chips }, (_, index) => {
    const radians = ((index * 360) / chips + (index % 3) * SKEW_DEGREES) / DEGREES_PER_RADIAN;
    const distance = reach * (1 + (index % 4) * REACH_STEP);

    return {
      key: index,
      dx: rounded(Math.sin(radians) * distance),
      dy: rounded(-Math.cos(radians) * distance),
      rotate: SPIN_BASE + index * SPIN_STEP,
      delaySeconds: rounded(index * DELAY_STEP_SECONDS),
      paint: PAINTS[index % PAINTS.length] ?? 'gold',
    };
  });
};
