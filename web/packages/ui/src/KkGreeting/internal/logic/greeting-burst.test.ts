import { describe, expect, it } from 'vitest';
import { greetingBurstOf } from './greeting-burst';

describe('greetingBurstOf', () => {
  it.each([
    [1, 'up'],
    [2027, 'up'],
    [1, 'side'],
    [2027, 'side'],
  ] as const)('flings every piece upward first with seed %d on the %s fan', (seed, fan) => {
    expect(greetingBurstOf(seed, fan).every((piece) => piece.riseY < 0)).toBe(true);
  });

  it.each([1, 2027])('flings every piece to the right on the side fan with seed %d', (seed) => {
    expect(greetingBurstOf(seed, 'side').every((piece) => piece.riseX > 0)).toBe(true);
  });

  it('fans the pieces out to both sides', () => {
    const pieces = greetingBurstOf(11);

    expect(pieces.some((piece) => piece.riseX < 0)).toBe(true);
    expect(pieces.some((piece) => piece.riseX > 0)).toBe(true);
  });

  it('lets every piece fall back from its peak', () => {
    expect(greetingBurstOf(11).every((piece) => piece.dropY > piece.riseY)).toBe(true);
  });
});
