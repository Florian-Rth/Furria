import { describe, expect, it } from 'vitest';
import { rulerTicksOf, tickStepOf, zoomOf } from './score-ruler';

describe('tickStepOf', () => {
  it.each([
    [186, 30],
    [60, 5],
    [12, 1],
    [2000, 60],
  ])('spaces the ruler for %i visible seconds at %i seconds', (visible, expected) => {
    expect(tickStepOf(visible)).toBe(expected);
  });
});

describe('rulerTicksOf', () => {
  it('marks the whole music at the zoomed spacing', () => {
    expect(rulerTicksOf(100, { start: 0, end: 1 }).map((tick) => tick.seconds)).toEqual([
      0, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    ]);
    expect(rulerTicksOf(100, { start: 0, end: 0.2 }).filter((tick) => tick.seconds < 6)).toEqual([
      { seconds: 0, share: 0 },
      { seconds: 2, share: 0.02 },
      { seconds: 4, share: 0.04 },
    ]);
  });

  it('has no ticks without music', () => {
    expect(rulerTicksOf(0, { start: 0, end: 1 })).toEqual([]);
  });
});

describe('zoomOf', () => {
  it('frames a part with a small margin inside the music', () => {
    const zoom = zoomOf({ start: 50, end: 100 }, 200);

    expect(zoom.start).toBeCloseTo(0.235);
    expect(zoom.end).toBeCloseTo(0.515);
  });

  it.each([
    [null, 200],
    [{ start: 0, end: 10 }, 0],
  ])('shows the whole music for %o', (range, length) => {
    expect(zoomOf(range, length)).toEqual({ start: 0, end: 1 });
  });

  it('stays inside the music at the edges', () => {
    expect(zoomOf({ start: 0, end: 200 }, 200)).toEqual({ start: 0, end: 1 });
  });
});
