import { describe, expect, it } from 'vitest';
import type { HitTarget } from './hit-priority';
import { hitAreaOf, pickHitTarget } from './hit-priority';

describe('hitAreaOf', () => {
  it.each([
    { box: { x: 10, y: 10, width: 8, height: 8 }, area: { x: -8, y: -8, width: 44, height: 44 } },
    { box: { x: 0, y: 0, width: 100, height: 4 }, area: { x: 0, y: -20, width: 100, height: 44 } },
  ])('grows $box to at least 44 px around its centre', ({ box, area }) => {
    expect(hitAreaOf(box)).toEqual(area);
  });
});

describe('pickHitTarget', () => {
  const dot = (
    id: string,
    x: number,
    overrides: Partial<HitTarget<string>> = {},
  ): HitTarget<string> => ({
    id,
    x,
    y: 0,
    width: 10,
    height: 10,
    priority: 0,
    selected: false,
    ...overrides,
  });

  it.each([
    { name: 'nothing near', targets: [dot('a', 0)], point: { x: 200, y: 5 }, expected: null },
    {
      name: 'inside the grown area',
      targets: [dot('a', 0)],
      point: { x: 25, y: 5 },
      expected: 'a',
    },
    {
      name: 'the nearest overlap',
      targets: [dot('a', 0), dot('b', 20)],
      point: { x: 17, y: 5 },
      expected: 'b',
    },
    {
      name: 'the selected one first',
      targets: [dot('a', 0), dot('b', 20, { selected: true })],
      point: { x: 5, y: 5 },
      expected: 'b',
    },
    {
      name: 'the higher priority before distance',
      targets: [dot('a', 0), dot('b', 20, { priority: 2 })],
      point: { x: 5, y: 5 },
      expected: 'b',
    },
  ])('picks $name', ({ targets, point, expected }) => {
    expect(pickHitTarget(targets, point)).toBe(expected);
  });
});
