import { describe, expect, it } from 'vitest';
import { greetingBurstOf } from './greeting-burst';

describe('greetingBurstOf', () => {
  it.each([1, 2027])('flings every piece upward first with seed %d', (seed) => {
    expect(greetingBurstOf(seed).every((piece) => piece.riseY < 0)).toBe(true);
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
