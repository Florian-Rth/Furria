import { describe, expect, it } from 'vitest';
import { hsvAfterKey, hsvAtPoint } from './tone-area';

const BOX = { left: 10, top: 20, width: 200, height: 100 };

describe('hsvAtPoint', () => {
  it.each([
    [10, 20, { h: 120, s: 0, v: 1 }],
    [210, 120, { h: 120, s: 1, v: 0 }],
    [110, 70, { h: 120, s: 0.5, v: 0.5 }],
    [-50, 500, { h: 120, s: 0, v: 0 }],
  ])('maps the point %i/%i onto saturation and brightness', (x, y, expected) => {
    expect(hsvAtPoint({ h: 120, s: 0.3, v: 0.3 }, BOX, x, y)).toEqual(expected);
  });

  it('keeps the colour when the area has no size yet', () => {
    expect(hsvAtPoint({ h: 10, s: 0.3, v: 0.4 }, { ...BOX, width: 0, height: 0 }, 50, 50)).toEqual({
      h: 10,
      s: 0.3,
      v: 0.4,
    });
  });
});

describe('hsvAfterKey', () => {
  it.each([
    ['ArrowRight', { h: 0, s: 0.52, v: 0.5 }],
    ['ArrowLeft', { h: 0, s: 0.48, v: 0.5 }],
    ['ArrowUp', { h: 0, s: 0.5, v: 0.52 }],
    ['ArrowDown', { h: 0, s: 0.5, v: 0.48 }],
    ['Enter', null],
  ])('moves on %s', (key, expected) => {
    const moved = hsvAfterKey({ h: 0, s: 0.5, v: 0.5 }, key);

    expect(
      moved === null ? null : { h: moved.h, s: +moved.s.toFixed(2), v: +moved.v.toFixed(2) },
    ).toEqual(expected);
  });

  it('stops at the edge of the area', () => {
    expect(hsvAfterKey({ h: 0, s: 1, v: 0 }, 'ArrowRight')).toEqual({ h: 0, s: 1, v: 0 });
  });
});
