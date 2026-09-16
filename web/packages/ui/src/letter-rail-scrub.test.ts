import { describe, expect, it } from 'vitest';
import { AT_REST, railIndexAt, railLiftAt } from './letter-rail-scrub';

const BAND = { top: 100, bottom: 360, count: 26 };

describe('railIndexAt', () => {
  it('lands on the first letter at the very top of the rail', () => {
    expect(railIndexAt(BAND.top, BAND)).toBe(0);
  });

  it('lands on the last letter at the very bottom of the rail', () => {
    expect(railIndexAt(BAND.bottom - 1, BAND)).toBe(BAND.count - 1);
  });

  it('holds on to the ends when the finger leaves the rail', () => {
    expect(railIndexAt(BAND.top - 400, BAND)).toBe(0);
    expect(railIndexAt(BAND.bottom + 400, BAND)).toBe(BAND.count - 1);
  });

  it('walks the letters in order as the finger travels down', () => {
    const walked = [0, 0.25, 0.5, 0.75, 1].map((share) =>
      railIndexAt(BAND.top + (BAND.bottom - BAND.top) * share, BAND),
    );

    expect(walked).toEqual([...walked].sort((first, second) => first - second));
  });

  it('falls back to the first letter for a rail with no height', () => {
    expect(railIndexAt(50, { top: 100, bottom: 100, count: 26 })).toBe(0);
  });
});

describe('railLiftAt', () => {
  it('leaves the rail alone while nothing is held', () => {
    expect(railLiftAt(4, null)).toEqual(AT_REST);
  });

  it('lifts the held letter the most', () => {
    const held = railLiftAt(4, 4);
    const neighbour = railLiftAt(5, 4);

    expect(held.scale).toBeGreaterThan(neighbour.scale);
    expect(held.pull).toBeLessThan(neighbour.pull);
  });

  it('falls away evenly on both sides of the finger', () => {
    expect(railLiftAt(3, 5)).toEqual(railLiftAt(7, 5));
  });

  it('leaves letters beyond its reach at rest', () => {
    expect(railLiftAt(20, 4)).toEqual(AT_REST);
  });

  it('pulls a lifted letter towards the list it points at', () => {
    expect(railLiftAt(4, 4).pull).toBeLessThan(0);
  });
});
