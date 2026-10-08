import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { chromeDensityAt, densityBetween } from './chrome-density';

const { scrollTravel } = kkTokens.shell;

describe('chromeDensityAt', () => {
  it.each([
    { scrollOffset: -240, expected: 0 },
    { scrollOffset: scrollTravel / 2, expected: 0.5 },
    { scrollOffset: scrollTravel * 40, expected: 1 },
  ])('reads $expected density at offset $scrollOffset', ({ scrollOffset, expected }) => {
    expect(chromeDensityAt(scrollOffset)).toBeCloseTo(expected);
  });

  it.each([
    { scrollOffset: 0, expected: 0 },
    { scrollOffset: 1, expected: 1 },
  ])(
    'snaps to $expected at offset $scrollOffset under reduced motion',
    ({ scrollOffset, expected }) => {
      expect(chromeDensityAt(scrollOffset, 'instant')).toBe(expected);
    },
  );
});

describe('densityBetween', () => {
  it('ramps from the rest value by the signed distance to the dense value', () => {
    expect(densityBetween(0.5, 0.25)).toBe('calc(0.5 + -0.25 * var(--kk-chrome-density, 0))');
  });
});
