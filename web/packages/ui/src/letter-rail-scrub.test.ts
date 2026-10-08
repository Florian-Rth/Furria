import { describe, expect, it } from 'vitest';
import { AT_REST, railIndexAt, railLiftAt } from './letter-rail-scrub';

const BAND = { top: 100, bottom: 360, count: 26 };

describe('railIndexAt', () => {
  it.each([
    { y: 100, expected: 0 },
    { y: 230, expected: 13 },
    { y: 359, expected: 25 },
    { y: -300, expected: 0 },
    { y: 760, expected: 25 },
  ])('lands on letter $expected at y $y', ({ y, expected }) => {
    expect(railIndexAt(y, BAND)).toBe(expected);
  });

  it('falls back to the first letter for a rail with no height', () => {
    expect(railIndexAt(50, { top: 100, bottom: 100, count: 26 })).toBe(0);
  });
});

describe('railLiftAt', () => {
  it.each([
    { index: 4, held: null },
    { index: 20, held: 4 },
  ])('leaves letter $index at rest while $held is held', ({ index, held }) => {
    expect(railLiftAt(index, held)).toEqual(AT_REST);
  });

  it('lifts and pulls the held letter the most', () => {
    const held = railLiftAt(4, 4);
    const neighbour = railLiftAt(5, 4);

    expect(held.scale).toBeGreaterThan(neighbour.scale);
    expect(held.pull).toBeLessThan(neighbour.pull);
    expect(neighbour.pull).toBeLessThan(0);
  });

  it('falls away evenly on both sides of the finger', () => {
    expect(railLiftAt(3, 5)).toEqual(railLiftAt(7, 5));
  });
});
