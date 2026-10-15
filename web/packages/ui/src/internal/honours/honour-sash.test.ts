import { describe, expect, it } from 'vitest';
import { sashLayoutOf } from './honour-sash';

describe('sashLayoutOf', () => {
  it('draws only the band in lists', () => {
    const layout = sashLayoutOf(20, 15.6, 'band', 11);

    expect(layout.icon).toBeNull();
    expect(layout.text).toBeNull();
    expect(layout.band).toEqual({ x: -0.28, y: 25.62, width: 40.56, height: 7.8 });
  });

  it('centres the lone icon on the band', () => {
    const layout = sashLayoutOf(36, 29.2, 'icon', 11);

    expect(layout.icon).toEqual({ x: 31.04, y: 47.39, size: 9.93 });
    expect(layout.text).toBeNull();
  });

  it('shrinks a long name to fit beside the icon', () => {
    const short = sashLayoutOf(48, 39.6, 'text', 5).text;
    const long = sashLayoutOf(48, 39.6, 'text', 11).text;

    expect(short?.size).toBeCloseTo(9.9);
    expect(long?.size).toBeLessThan(short?.size ?? 0);
  });

  it('keeps icon and name centred as one line', () => {
    const layout = sashLayoutOf(48, 39.6, 'text', 11);
    const textSize = layout.text?.size ?? 0;
    const right = (layout.text?.x ?? 0) + 11 * textSize * 0.5;

    expect((layout.icon?.x ?? 0) + right).toBeCloseTo(96, 0);
  });

  it('places the gold edges inside the band', () => {
    const { band, edges } = sashLayoutOf(48, 39.6, 'text', 5);

    expect(
      edges.every((edge) => edge.y > band.y && edge.y + edge.height < band.y + band.height),
    ).toBe(true);
  });
});
