import { describe, expect, it } from 'vitest';
import { clockProgressOf, clockStepOf, START_CLOCK } from './relay-clock';

describe('clockStepOf', () => {
  it('starts counting at the first painted frame', () => {
    expect(clockStepOf(START_CLOCK, 5000)).toEqual({ elapsed: 0, last: 5000, first: 5000 });
  });

  it.each([
    [0, 16, 16],
    [0, 250, 34],
    [100, 60, 60],
    [100, 250, 100],
  ])('after %dms advances a %dms frame gap by %dms', (elapsed, gap, advance) => {
    expect(clockStepOf({ elapsed, last: 1000, first: 0 }, 1000 + gap).elapsed).toBe(
      elapsed + advance,
    );
  });
});

describe('clockProgressOf', () => {
  it.each([
    [420, 500, 0.84, 0.5],
    [2000, 2000, 0.84, 1],
    [300, 1400, 0.84, 1],
  ])('%dms counted over %dms of %ds → %d', (elapsed, wall, seconds, progress) => {
    expect(clockProgressOf({ elapsed, last: wall, first: 0 }, seconds)).toBeCloseTo(progress);
  });
});
