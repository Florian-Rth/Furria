import { describe, expect, it } from 'vitest';
import { durationOf, pointAlong, TouchScriptSchema, touchFramesOf } from './touch-script.ts';

describe('pointAlong', () => {
  it.each([
    { share: 0, expected: [0, 0] },
    { share: 0.25, expected: [75, 0] },
    { share: 0.75, expected: [100, 125] },
    { share: 2, expected: [100, 200] },
  ])('finds the point at share $share of an L-shaped path', ({ share, expected }) => {
    expect(
      pointAlong(
        [
          [0, 0],
          [100, 0],
          [100, 200],
        ],
        share,
      ),
    ).toEqual(expected);
  });
});

describe('touchFramesOf', () => {
  it('holds a long press before the drag starts moving', () => {
    const frames = touchFramesOf({
      gesture: 'drag',
      path: [
        [0, 0],
        [32, 0],
      ],
      ms: 32,
      holdMs: 500,
    });

    expect(frames).toEqual([
      { at: 0, type: 'touchStart', points: [{ id: 1, x: 0, y: 0 }] },
      { at: 516, type: 'touchMove', points: [{ id: 1, x: 16, y: 0 }] },
      { at: 532, type: 'touchMove', points: [{ id: 1, x: 32, y: 0 }] },
      { at: 548, type: 'touchEnd', points: [] },
    ]);
  });

  it('spreads two fingers around the pinch centre', () => {
    const frames = touchFramesOf({
      gesture: 'pinch',
      centre: [200, 300],
      fromSpread: 100,
      toSpread: 300,
      ms: 16,
    });

    expect(frames.map((frame) => frame.points)).toEqual([
      [
        { id: 1, x: 150, y: 300 },
        { id: 2, x: 250, y: 300 },
      ],
      [
        { id: 1, x: 50, y: 300 },
        { id: 2, x: 350, y: 300 },
      ],
      [],
    ]);
  });
});

describe('durationOf', () => {
  it.each([
    { gesture: { gesture: 'wait' as const, ms: 400 }, expected: 400 },
    {
      gesture: {
        gesture: 'pan' as const,
        from: [0, 0] as [number, number],
        to: [50, 0] as [number, number],
        spread: 80,
        ms: 32,
      },
      expected: 48,
    },
  ])('lasts $expected ms for $gesture.gesture', ({ gesture, expected }) => {
    expect(durationOf(gesture)).toBe(expected);
  });
});

describe('TouchScriptSchema', () => {
  it('fills the default hold of a long press', () => {
    expect(TouchScriptSchema.parse([{ gesture: 'longPress', at: [10, 20] }])).toEqual([
      { gesture: 'longPress', at: [10, 20], holdMs: 700 },
    ]);
  });
});
