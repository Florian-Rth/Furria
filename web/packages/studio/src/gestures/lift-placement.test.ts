import { describe, expect, it } from 'vitest';
import { liftPlacementOf, loupeOf } from './lift-placement';

const AREA = { width: 390, height: 600 };
const READOUT = { width: 120, height: 40 };

describe('liftPlacementOf', () => {
  it.each([
    {
      name: 'above the finger',
      finger: { x: 200, y: 300 },
      expected: { x: 200, y: 224, side: 'above' },
    },
    {
      name: 'below near the top edge',
      finger: { x: 200, y: 80 },
      expected: { x: 200, y: 156, side: 'below' },
    },
    {
      name: 'inside the left edge',
      finger: { x: 10, y: 300 },
      expected: { x: 60, y: 224, side: 'above' },
    },
    {
      name: 'inside the right edge',
      finger: { x: 385, y: 300 },
      expected: { x: 330, y: 224, side: 'above' },
    },
  ])('places the readout $name', ({ finger, expected }) => {
    expect(liftPlacementOf(finger, AREA, READOUT)).toEqual(expected);
  });
});

describe('loupeOf', () => {
  it('magnifies the point under the finger into the loupe centre', () => {
    const loupe = loupeOf({ x: 100, y: 300 }, AREA, 96, 2);

    expect(loupe).toEqual({
      placement: { x: 100, y: 196, side: 'above' },
      contentX: -152,
      contentY: -552,
      zoom: 2,
    });
  });
});
