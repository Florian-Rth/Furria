export const ramp = (value: number, from: number, to: number): number =>
  Math.min(Math.max((value - from) / (to - from), 0), 1);

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;
