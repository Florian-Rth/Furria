import { describe, expect, it } from 'vitest';
import { labLiftOf } from './lab-lift';

describe('labLiftOf', () => {
  it.each([
    [{ x: 100, y: 200 }, Number.POSITIVE_INFINITY, { x: 100, y: 119 }],
    [{ x: 10, y: 200 }, 0, { x: 50, y: 119 }],
    [{ x: 100, y: 40 }, 0, { x: 100, y: 121 }],
    [{ x: 100, y: 40 }, Number.POSITIVE_INFINITY, { x: 100, y: -41 }],
  ])('places the value for a finger at %j', (finger, roomAbove, readout) => {
    expect(labLiftOf(finger, 300, 100, null, roomAbove)).toEqual({ readout, loupe: null });
  });

  it('stacks the value above the loupe and centres the finger in it', () => {
    expect(labLiftOf({ x: 20, y: 300 }, 300, 100, { diameter: 100, zoom: 2 }, 0)).toEqual({
      readout: { x: 50, y: 109 },
      loupe: { x: 50, y: 186, contentX: 10, contentY: -550 },
    });
  });
});
