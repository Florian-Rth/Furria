import { describe, expect, it } from 'vitest';
import { isPastScrollThreshold } from './use-scrolled-past-top';

describe('isPastScrollThreshold', () => {
  it('is false at the very top of the page', () => {
    expect(isPastScrollThreshold(0)).toBe(false);
  });

  it('is false for a tiny scroll offset within the threshold', () => {
    expect(isPastScrollThreshold(4)).toBe(false);
  });

  it('is true once scrolled past the threshold', () => {
    expect(isPastScrollThreshold(120)).toBe(true);
  });
});
