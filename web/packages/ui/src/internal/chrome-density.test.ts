import { describe, expect, it } from 'vitest';
import { kkTokens } from '../tokens';
import { chromeDensityAt, densityBetween } from './chrome-density';

const { scrollTravel } = kkTokens.shell;

describe('chromeDensityAt', () => {
  it.each([
    { scrollOffset: -240, expected: 0 },
    { scrollOffset: 0, expected: 0 },
    { scrollOffset: scrollTravel / 4, expected: 0.25 },
    { scrollOffset: scrollTravel / 2, expected: 0.5 },
    { scrollOffset: scrollTravel, expected: 1 },
    { scrollOffset: scrollTravel * 40, expected: 1 },
  ])('reads $expected density at offset $scrollOffset', ({ scrollOffset, expected }) => {
    expect(chromeDensityAt(scrollOffset)).toBeCloseTo(expected);
  });
});

describe('chromeDensityAt under reduced motion', () => {
  it.each([
    { scrollOffset: -240, expected: 0 },
    { scrollOffset: 0, expected: 0 },
    { scrollOffset: 1, expected: 1 },
    { scrollOffset: scrollTravel / 2, expected: 1 },
    { scrollOffset: scrollTravel * 40, expected: 1 },
  ])('snaps to $expected at offset $scrollOffset', ({ scrollOffset, expected }) => {
    expect(chromeDensityAt(scrollOffset, 'instant')).toBe(expected);
  });
});

describe('densityBetween', () => {
  it.each([
    { rest: 2, dense: 12, expected: 'calc(2 + 10 * var(--kk-chrome-density, 0))' },
    { rest: 0.5, dense: 0.25, expected: 'calc(0.5 + -0.25 * var(--kk-chrome-density, 0))' },
    { rest: 1, dense: 1, expected: 'calc(1 + 0 * var(--kk-chrome-density, 0))' },
  ])('ramps from $rest to $dense along the density', ({ rest, dense, expected }) => {
    expect(densityBetween(rest, dense)).toBe(expected);
  });
});
