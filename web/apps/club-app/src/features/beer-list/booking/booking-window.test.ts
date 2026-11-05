import { describe, expect, it } from 'vitest';
import { undoRemainingMsOf } from './booking-window';

describe('undoRemainingMsOf', () => {
  it.each([
    [20_000, 12_500, 7_500],
    [20_000, 20_000, 0],
    [20_000, 25_000, 0],
    [40_000, 20_000, 10_000],
  ])('a window ending at %i seen at %i leaves %i ms', (endsAt, now, expected) => {
    expect(undoRemainingMsOf(endsAt, now)).toBe(expected);
  });
});
