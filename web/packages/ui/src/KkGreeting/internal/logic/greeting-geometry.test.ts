import { describe, expect, it } from 'vitest';
import { burstOriginOf, cellBoxOf } from './greeting-geometry';

describe('cellBoxOf', () => {
  it.each([
    {
      glyph: { left: 120, top: 210, width: 48, height: 45 },
      lineHeight: 35,
      box: { left: 104, top: 15, width: 48, height: 35 },
    },
    {
      glyph: { left: 16, top: 245, width: 20, height: 30 },
      lineHeight: 35,
      box: { left: 0, top: 42.5, width: 20, height: 35 },
    },
  ])(
    'centres the line box on the glyph, relative to the greeting',
    ({ glyph, lineHeight, box }) => {
      expect(cellBoxOf(glyph, { left: 16, top: 200, width: 358, height: 95 }, lineHeight)).toEqual(
        box,
      );
    },
  );
});

describe('burstOriginOf', () => {
  it('starts the burst at the mark on the right end of the cell', () => {
    expect(burstOriginOf({ left: 100, top: 40, width: 120, height: 36 })).toEqual({
      x: 211,
      y: 58,
    });
  });
});
